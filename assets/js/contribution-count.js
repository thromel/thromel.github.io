(function () {
  'use strict';

  var TIMEOUT_MS = 5000;

  function root() { return document.querySelector('[data-contribution-count]'); }

  function setState(state, message, count) {
    var container = root();
    if (!container) return;
    var status = document.getElementById('contribution-count-status');
    var value = document.getElementById('contribution-count-value');
    container.setAttribute('data-state', state);
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
    var username = container.getAttribute('data-github-user');
    if (!username) {
      setState('error', 'GitHub count is unavailable because the profile is not configured.');
      return;
    }

    var controller = new AbortController();
    var timeout = window.setTimeout(function () { controller.abort(); }, TIMEOUT_MS);
    var url = 'https://api.github.com/search/issues?q=author%3A' + encodeURIComponent(username) + '+type%3Apr+is%3Amerged+-user%3A' + encodeURIComponent(username) + '&per_page=1';
    setState('loading', 'Loading the current GitHub count…');

    try {
      var response = await fetch(url, { headers: { Accept: 'application/vnd.github+json' }, signal: controller.signal });
      var body = await response.text();
      if (!response.ok) {
        setState(isRateLimited(response, body) ? 'rate-limit' : 'error', isRateLimited(response, body) ? 'GitHub is rate-limited right now. Refresh the count later; the curated evidence above is still available.' : 'GitHub could not return a count right now. Refresh the count later.');
        return;
      }
      var payload = body ? JSON.parse(body) : {};
      var count = typeof payload.total_count === 'number' ? payload.total_count : 0;
      if (count === 0) {
        setState('empty', 'No merged external pull requests were returned by GitHub.', 0);
      } else {
        setState('success', count + ' merged external pull requests returned by GitHub.', count);
      }
    } catch (error) {
      if (error && error.name === 'AbortError') {
        setState('timeout', 'GitHub took too long to respond. Refresh the count when the service is available.');
      } else {
        setState('error', 'GitHub could not return a count right now. Refresh the count later.');
      }
    } finally {
      window.clearTimeout(timeout);
    }
  }

  document.addEventListener('DOMContentLoaded', function () {
    var button = document.getElementById('contribution-count-refresh');
    if (button) button.addEventListener('click', refreshCount);
    window.refreshContributionCount = refreshCount;
    refreshCount();
  });
}());
