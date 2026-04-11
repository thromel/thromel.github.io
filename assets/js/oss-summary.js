(function () {
  function getProofHelpers() {
    return (
      window.GitHubProof || {
        classifyGitHubStatus: function (response) {
          return response && response.ok ? 'success' : 'error';
        },
        setProofState: function (root, state) {
          if (root) {
            root.setAttribute('data-state', state);
          }
        },
        setProofMessage: function (target, message) {
          if (target) {
            target.textContent = message || '';
          }
        },
      }
    );
  }

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

  function tryParseJson(bodyText) {
    if (!bodyText) {
      return {};
    }

    try {
      return JSON.parse(bodyText);
    } catch (_) {
      return {};
    }
  }

  function setOssState(container, statusNode, textNode, state, message) {
    var proof = getProofHelpers();

    proof.setProofState(container, state);
    proof.setProofState(statusNode, state);
    proof.setProofMessage(textNode, message);
  }

  async function fetchMergedCount(url) {
    var proof = getProofHelpers();
    var response = await fetch(url, {
      headers: { Accept: 'application/vnd.github.v3+json' }
    });
    var bodyText = await response.text();
    var status = proof.classifyGitHubStatus(response, bodyText);
    var data = tryParseJson(bodyText);

    return {
      count: data.total_count || 0,
      status: status,
    };
  }

  async function renderOssSummary() {
    var container = document.getElementById('oss-summary');
    var statusNode = document.getElementById('oss-summary-status');
    var textNode = document.getElementById('oss-summary-text');

    if (!container || !statusNode || !textNode) {
      return;
    }

    var username = getGitHubUsername();
    if (!username) {
      setOssState(container, statusNode, textNode, 'error', 'GitHub data is unavailable right now. Browse recent contribution targets instead.');
      return;
    }

    setOssState(container, statusNode, textNode, 'loading', 'Loading recent merged pull requests...');

    try {
      var result = await fetchMergedCount(
        'https://api.github.com/search/issues?q=author:' +
          encodeURIComponent(username) +
          '+type:pr+is:merged+-user:' +
          encodeURIComponent(username) +
          '&per_page=1'
      );

      if (result.status === 'error' || result.status === 'rate-limit') {
        setOssState(
          container,
          statusNode,
          textNode,
          'error',
          'GitHub data is unavailable right now. Browse recent contribution targets instead.'
        );
        return;
      }

      if (result.status === 'empty' || result.count <= 0) {
        setOssState(container, statusNode, textNode, 'empty', 'No merged external pull requests published yet.');
        return;
      }

      setOssState(
        container,
        statusNode,
        textNode,
        'success',
        result.count + ' merged pull requests to open source projects.'
      );
    } catch (_) {
      setOssState(
        container,
        statusNode,
        textNode,
        'error',
        'GitHub data is unavailable right now. Browse recent contribution targets instead.'
      );
    }
  }

  document.addEventListener('DOMContentLoaded', renderOssSummary);
})();
