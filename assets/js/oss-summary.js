(function () {
  function getGitHubUsername() {
    var summary = document.getElementById('oss-summary');
    if (summary && summary.dataset && summary.dataset.githubUser) {
      return summary.dataset.githubUser;
    }

    var profileLink = document.querySelector('a[href^="https://github.com/"]');
    if (!profileLink) {
      return null;
    }

    var match = profileLink.href.match(/github\.com\/([^/?#]+)/i);
    return match ? match[1] : null;
  }

  async function fetchCount(url) {
    var response = await fetch(url, {
      headers: { Accept: 'application/vnd.github.v3+json' }
    });

    if (!response.ok) {
      throw new Error('GitHub API request failed with status ' + response.status);
    }

    var data = await response.json();
    return data.total_count || 0;
  }

  async function renderOssSummary() {
    var container = document.getElementById('oss-summary');
    var textNode = document.getElementById('oss-summary-text');

    if (!container || !textNode) {
      return;
    }

    var username = getGitHubUsername();
    if (!username) {
      return;
    }

    try {
      var mergedCount = await fetchCount(
        'https://api.github.com/search/issues?q=author:' +
          encodeURIComponent(username) +
          '+type:pr+is:merged+-user:' +
          encodeURIComponent(username) +
          '&per_page=1'
      );

      if (mergedCount <= 0) {
        return;
      }

      textNode.textContent = mergedCount + ' merged pull requests to open source projects';
      container.style.display = 'flex';
    } catch (_) {
      // Leave section hidden when API is unavailable/rate-limited.
    }
  }

  document.addEventListener('DOMContentLoaded', renderOssSummary);
})();
