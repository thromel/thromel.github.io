(function () {
  var RATE_LIMIT_MESSAGE = 'GitHub is rate-limited right now. Check back shortly or use the repository links below.';
  var ERROR_MESSAGE = 'Unable to fetch contributions right now. Please try again later.';
  var LOADING_MESSAGE = 'Fetching contributions from GitHub...';

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
        normalizeRepositoryName: function (repositoryUrl) {
          return (repositoryUrl || '').replace(/^https:\/\/api\.github\.com\/repos\//, '');
        },
      }
    );
  }

  function getGitHubUsername() {
    var root = document.getElementById('contributions-proof');
    if (root && root.dataset && root.dataset.githubUser) {
      return root.dataset.githubUser;
    }

    return null;
  }

  function escapeHtml(text) {
    var div = document.createElement('div');
    div.textContent = text || '';
    return div.innerHTML;
  }

  function sanitizeLabelColor(color) {
    return /^[0-9a-f]{6}$/i.test(color || '') ? color : '64748b';
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

  function isMergedPullRequest(pr) {
    return Boolean(pr && pr.pull_request && pr.pull_request.merged_at);
  }

  function renderContributionItem(pr) {
    var proof = getProofHelpers();
    var repoName = proof.normalizeRepositoryName(pr.repository_url);
    var formattedDate = new Date(pr.created_at).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
    var status = isMergedPullRequest(pr) ? 'merged' : 'open';
    var statusIcon = status === 'merged' ? 'fa-code-merge' : 'fa-code-pull-request';
    var statusLabel = status.charAt(0).toUpperCase() + status.slice(1);
    var numberMarkup = typeof pr.number === 'number' ? '<span>#' + pr.number + '</span>' : '';
    var commentsMarkup =
      pr.comments > 0
        ? '<span><i class="fas fa-comment"></i> ' + pr.comments + '</span>'
        : '';
    var labelsMarkup = Array.isArray(pr.labels) && pr.labels.length > 0
      ? '<div class="contribution-labels">' +
          pr.labels
            .map(function (label) {
              var color = sanitizeLabelColor(label.color);
              return (
                '<span class="contribution-label" style="background: #' +
                color +
                '20; color: #' +
                color +
                ';">' +
                escapeHtml(label.name) +
                '</span>'
              );
            })
            .join('') +
          '</div>'
      : '';

    return (
      '<div class="timeline-item contribution-item">' +
        '<div class="contribution-repo">' +
          '<i class="fab fa-github"></i>' +
          '<a href="https://github.com/' + escapeHtml(repoName) + '" target="_blank" rel="noopener noreferrer">' +
            escapeHtml(repoName) +
          '</a>' +
        '</div>' +
        '<div class="timeline-header">' +
          '<h3 class="timeline-title">' +
            '<a href="' + escapeHtml(pr.html_url) + '" target="_blank" rel="noopener noreferrer">' +
              escapeHtml(pr.title) +
            '</a>' +
          '</h3>' +
          '<span class="timeline-date">' + formattedDate + '</span>' +
        '</div>' +
        '<div class="contribution-meta">' +
          '<span class="pr-status ' + status + '">' +
            '<i class="fas ' + statusIcon + '"></i>' +
            statusLabel +
          '</span>' +
          numberMarkup +
          commentsMarkup +
        '</div>' +
        labelsMarkup +
      '</div>'
    );
  }

  function setContributionStats(mergedCount, openCount, repoCount) {
    document.getElementById('merged-prs').textContent = mergedCount;
    document.getElementById('open-prs').textContent = openCount;
    document.getElementById('repos-contributed').textContent = repoCount;
  }

  function setContributionsState(state, message) {
    var proof = getProofHelpers();
    var root = document.getElementById('contributions-proof');
    var loadingState = document.getElementById('loading-state');
    var errorState = document.getElementById('error-state');
    var emptyState = document.getElementById('empty-state');
    var contributionsSection = document.getElementById('contributions-section');
    var loadingMessage = loadingState.querySelector('.proof-state-text');
    var errorMessage = document.getElementById('error-state-message');
    var emptyMessage = emptyState.querySelector('.proof-state-text');

    proof.setProofState(root, state);
    loadingState.style.display = state === 'loading' ? 'grid' : 'none';
    errorState.style.display = state === 'error' ? 'grid' : 'none';
    emptyState.style.display = state === 'empty' ? 'grid' : 'none';
    contributionsSection.style.display = state === 'success' ? 'block' : 'none';

    if (message) {
      if (state === 'loading') {
        proof.setProofMessage(loadingMessage, message);
      } else if (state === 'error') {
        proof.setProofMessage(errorMessage, message);
      } else if (state === 'empty') {
        proof.setProofMessage(emptyMessage, message);
      }
    }
  }

  async function fetchContributions() {
    var proof = getProofHelpers();
    var timeline = document.getElementById('contributions-timeline');
    var username = getGitHubUsername();

    if (!timeline || !username) {
      setContributionsState('error', ERROR_MESSAGE);
      return;
    }

    timeline.innerHTML = '';
    setContributionStats('-', '-', '-');
    setContributionsState('loading', LOADING_MESSAGE);

    try {
      var response = await fetch(
        'https://api.github.com/search/issues?q=author:' +
          encodeURIComponent(username) +
          '+type:pr+-user:' +
          encodeURIComponent(username) +
          '&sort=updated&order=desc&per_page=100',
        {
          headers: {
            Accept: 'application/vnd.github.v3+json'
          }
        }
      );
      var bodyText = await response.text();
      var status = proof.classifyGitHubStatus(response, bodyText);

      if (status === 'rate-limit') {
        setContributionsState('error', RATE_LIMIT_MESSAGE);
        return;
      }

      if (status === 'error') {
        setContributionsState('error', ERROR_MESSAGE);
        return;
      }

      var data = tryParseJson(bodyText);
      var prs = (data.items || []).filter(function (pr) {
        return isMergedPullRequest(pr) || pr.state === 'open';
      });

      if (status === 'empty' || prs.length === 0) {
        setContributionStats(0, 0, 0);
        setContributionsState('empty', 'No external contributions found yet.');
        return;
      }

      var mergedPRs = prs.filter(isMergedPullRequest);
      var openPRs = prs.filter(function (pr) {
        return pr.state === 'open';
      });
      var groupedByRepo = {};

      prs.forEach(function (pr) {
        var repoName = proof.normalizeRepositoryName(pr.repository_url);
        if (!groupedByRepo[repoName]) {
          groupedByRepo[repoName] = [];
        }
        groupedByRepo[repoName].push(pr);
      });

      setContributionStats(mergedPRs.length, openPRs.length, Object.keys(groupedByRepo).length);
      timeline.innerHTML = Object.keys(groupedByRepo)
        .map(function (repoName) {
          return groupedByRepo[repoName].map(function (pr) {
            return renderContributionItem(pr);
          }).join('');
        })
        .join('');
      setContributionsState('success');
    } catch (error) {
      console.error('Error fetching contributions:', error);
      setContributionsState('error', ERROR_MESSAGE);
    }
  }

  document.addEventListener('DOMContentLoaded', function () {
    var retryButton = document.getElementById('retry-contributions');
    if (retryButton) {
      retryButton.addEventListener('click', fetchContributions);
    }

    window.fetchContributions = fetchContributions;
    fetchContributions();
  });
})();
