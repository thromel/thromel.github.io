(function () {
  'use strict';

  var TIMEOUT_MS = 5000;
  var activeRequest = null;
  var requestSequence = 0;

  function root() { return document.querySelector('[data-contribution-count]'); }
  function retryButton() { return document.getElementById('contribution-count-refresh'); }

  function setBusy(isBusy) {
    var container = root();
    var button = retryButton();
    if (container) container.setAttribute('aria-busy', isBusy ? 'true' : 'false');
    if (button) button.disabled = isBusy;
  }

  function setState(state, message, count) {
    var container = root();
    if (!container) return;
    var heading = document.getElementById('contribution-count-title');
    var status = document.getElementById('contribution-count-status');
    var value = document.getElementById('contribution-count-value');
    container.setAttribute('data-state', state);
    if (heading) heading.textContent = state === 'empty' ? 'No live contribution count returned' : 'Merged external pull requests';
    if (status) status.textContent = message;
    if (value && typeof count === 'number') value.textContent = String(count);
    if (value && typeof count !== 'number' && state !== 'success') value.textContent = '—';
  }

  function isRateLimited(response, body) {
    return response.status === 403 || response.status === 429 || /rate limit/i.test(body || '');
  }

  async function refreshCount() {
    var container = root();
    if (!container) return;
    if (activeRequest) return activeRequest.promise;

    var username = container.getAttribute('data-github-user');
    if (!username) {
      setState('error', 'GitHub count is unavailable because the profile is not configured.');
      setBusy(false);
      return;
    }

    var controller = new AbortController();
    var request = {
      controller: controller,
      cancelled: false,
      timedOut: false,
      sequence: ++requestSequence,
      promise: null
    };
    var timeout = window.setTimeout(function () {
      request.timedOut = true;
      controller.abort();
    }, TIMEOUT_MS);
    var url = 'https://api.github.com/search/issues?q=author%3A' + encodeURIComponent(username) + '+type%3Apr+is%3Amerged+-user%3A' + encodeURIComponent(username) + '&per_page=1';
    setState('loading', 'Checking the current merged contribution count…');
    setBusy(true);

    activeRequest = request;
    request.promise = (async function () {
      try {
        var response = await fetch(url, { headers: { Accept: 'application/vnd.github+json' }, signal: controller.signal });
        var body = await response.text();
        if (request.cancelled || request !== activeRequest) return;
        if (!response.ok) {
          var rateLimited = isRateLimited(response, body);
          setState(rateLimited ? 'rate-limit' : 'error', rateLimited ? 'GitHub is rate-limited right now. The selected evidence remains available; retry the count later.' : 'GitHub could not refresh the merged contribution count. Review the selected evidence or try again later.');
          return;
        }
        var payload = body ? JSON.parse(body) : {};
        if (payload.incomplete_results === true) {
          setState('incomplete', 'GitHub returned a partial result, so no exact count is shown. The selected evidence remains available; retry later.');
          return;
        }
        var count = typeof payload.total_count === 'number' ? payload.total_count : 0;
        if (count === 0) {
          setState('empty', 'Selected contribution records remain available above. View the evidence or retry the count.', 0);
        } else {
          setState('success', count + ' merged pull requests to external repositories.', count);
        }
      } catch (error) {
        if (request.cancelled || request !== activeRequest) return;
        if (error && error.name === 'AbortError' && request.timedOut) {
          setState('timeout', 'GitHub took too long to respond. The selected evidence remains available; retry the count.');
        } else {
          setState('error', 'GitHub could not refresh the merged contribution count. Review the selected evidence or try again later.');
        }
      } finally {
        window.clearTimeout(timeout);
        if (request === activeRequest) {
          activeRequest = null;
          setBusy(false);
        }
      }
    }());
    return request.promise;
  }

  function cancelActiveRequest() {
    if (!activeRequest) return;
    activeRequest.cancelled = true;
    activeRequest.controller.abort();
  }

  function initialize() {
    var button = retryButton();
    if (button) button.textContent = 'Retry count';
    if (button) button.addEventListener('click', refreshCount);
    window.refreshContributionCount = refreshCount;
    refreshCount();
  }

  window.addEventListener('pagehide', cancelActiveRequest);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initialize);
  else initialize();
}());
