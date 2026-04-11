(function () {
  function parseBodyText(bodyText) {
    if (!bodyText) {
      return null;
    }

    try {
      return JSON.parse(bodyText);
    } catch (_) {
      return null;
    }
  }

  function bodyLooksEmpty(parsedBody) {
    if (!parsedBody) {
      return false;
    }

    if (typeof parsedBody.total_count === 'number') {
      return parsedBody.total_count === 0;
    }

    if (Array.isArray(parsedBody.items)) {
      return parsedBody.items.length === 0;
    }

    if (Array.isArray(parsedBody)) {
      return parsedBody.length === 0;
    }

    return false;
  }

  function classifyGitHubStatus(response, bodyText) {
    if (!response) {
      return 'error';
    }

    var parsedBody = parseBodyText(bodyText);
    var loweredBody = typeof bodyText === 'string' ? bodyText.toLowerCase() : '';

    if (response.ok) {
      return bodyLooksEmpty(parsedBody) ? 'empty' : 'success';
    }

    if (
      response.status === 403 ||
      response.status === 429 ||
      loweredBody.indexOf('rate limit') !== -1 ||
      loweredBody.indexOf('secondary rate') !== -1
    ) {
      return 'rate-limit';
    }

    return 'error';
  }

  function setProofState(root, state) {
    if (!root) {
      return;
    }

    root.setAttribute('data-state', state);
  }

  function setProofMessage(target, message) {
    if (!target) {
      return;
    }

    target.textContent = message || '';
  }

  function normalizeRepositoryName(repositoryUrl) {
    if (!repositoryUrl) {
      return '';
    }

    return repositoryUrl.replace(/^https:\/\/api\.github\.com\/repos\//, '');
  }

  window.GitHubProof = {
    classifyGitHubStatus: classifyGitHubStatus,
    setProofState: setProofState,
    setProofMessage: setProofMessage,
    normalizeRepositoryName: normalizeRepositoryName,
  };
})();
