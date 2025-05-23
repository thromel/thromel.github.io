/**
 * Code Highlighting Enhancements
 * Adds copy-to-clipboard functionality and other code block improvements
 */

document.addEventListener('DOMContentLoaded', function () {
  // Clean up any existing duplicate headers first
  cleanupDuplicateHeaders();

  // Enhance all code blocks with copy buttons and language labels
  enhanceCodeBlocks();

  // Initialize theme-aware highlighting
  updateCodeTheme();

  // Set up theme change observers
  setupThemeObserver();

  // Add line number support (optional)
  // addLineNumbers();
});

/**
 * Clean up any duplicate headers that might exist
 */
function cleanupDuplicateHeaders() {
  const allHeaders = document.querySelectorAll('.code-header');
  const seenCodeBlocks = new Set();

  allHeaders.forEach(function (header) {
    const nextSibling = header.nextElementSibling;
    if (nextSibling && nextSibling.classList.contains('highlight')) {
      if (seenCodeBlocks.has(nextSibling)) {
        // This is a duplicate header, remove it
        header.remove();
      } else {
        seenCodeBlocks.add(nextSibling);
      }
    } else {
      // Header without a following code block, remove it
      header.remove();
    }
  });
}

/**
 * Enhance all code blocks with copy buttons and language labels
 */
function enhanceCodeBlocks() {
  const codeBlocks = document.querySelectorAll('.highlight');

  codeBlocks.forEach(function (codeBlock) {
    // Skip if already enhanced
    if (codeBlock.hasAttribute('data-enhanced')) {
      return;
    }

    // Check if there's already a code header before this code block
    const previousSibling = codeBlock.previousElementSibling;
    if (previousSibling && previousSibling.classList.contains('code-header')) {
      // Already has a header, just mark as enhanced
      codeBlock.setAttribute('data-enhanced', 'true');
      return;
    }

    // Check if this code block is already inside a container with a header
    const parent = codeBlock.parentElement;
    if (parent && parent.querySelector('.code-header')) {
      // Parent already has a header, mark as enhanced
      codeBlock.setAttribute('data-enhanced', 'true');
      return;
    }

    // Mark as enhanced to prevent duplicate processing
    codeBlock.setAttribute('data-enhanced', 'true');

    // Extract language from class name (Rouge adds language-* classes)
    const language = extractLanguage(codeBlock);

    // Create header with both language label and copy button
    const header = createCodeHeader(language, codeBlock);

    // Insert header before code block
    codeBlock.parentNode.insertBefore(header, codeBlock);
  });
}

/**
 * Extract language from code block classes
 */
function extractLanguage(codeBlock) {
  const classes = Array.from(codeBlock.classList);
  let language = 'code';

  // Look for language-* class or data-lang attribute
  for (const className of classes) {
    if (className.startsWith('language-')) {
      language = className.replace('language-', '');
      break;
    }
  }

  // Fallback: check for Rouge's highlight class with language
  const langMatch = codeBlock.className.match(/highlight-(\w+)/);
  if (langMatch) {
    language = langMatch[1];
  }

  // Another fallback: check the first class after 'highlight'
  if (language === 'code' && classes.length > 1) {
    const possibleLang = classes[1];
    if (possibleLang && possibleLang !== 'highlight') {
      language = possibleLang;
    }
  }

  return language;
}

/**
 * Create code header with language label and copy button
 */
function createCodeHeader(language, codeBlock) {
  const header = document.createElement('div');
  header.className = 'code-header';

  // Create language label
  const languageLabel = document.createElement('span');
  languageLabel.className = 'code-language';
  languageLabel.textContent = formatLanguageName(language);

  // Create copy button
  const copyBtn = document.createElement('button');
  copyBtn.className = 'copy-btn';
  copyBtn.innerHTML = '<i class="fas fa-copy"></i> Copy';
  copyBtn.setAttribute('title', 'Copy code to clipboard');
  copyBtn.setAttribute('aria-label', 'Copy code to clipboard');

  // Add click event to copy button
  copyBtn.addEventListener('click', function () {
    copyCodeToClipboard(codeBlock, copyBtn);
  });

  // Add keyboard navigation
  copyBtn.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      copyBtn.click();
    }
  });

  // Append elements to header
  header.appendChild(languageLabel);
  header.appendChild(copyBtn);

  return header;
}

/**
 * Format language name for display
 */
function formatLanguageName(language) {
  const languageMap = {
    js: 'JavaScript',
    ts: 'TypeScript',
    py: 'Python',
    python: 'Python',
    java: 'Java',
    cpp: 'C++',
    c: 'C',
    cs: 'C#',
    css: 'CSS',
    html: 'HTML',
    xml: 'XML',
    json: 'JSON',
    yaml: 'YAML',
    yml: 'YAML',
    sql: 'SQL',
    bash: 'Bash',
    sh: 'Shell',
    powershell: 'PowerShell',
    ruby: 'Ruby',
    php: 'PHP',
    go: 'Go',
    rust: 'Rust',
    scala: 'Scala',
    kotlin: 'Kotlin',
    swift: 'Swift',
    dart: 'Dart',
    r: 'R',
    matlab: 'MATLAB',
    latex: 'LaTeX',
    markdown: 'Markdown',
    md: 'Markdown',
  };

  return (
    languageMap[language.toLowerCase()] ||
    language.charAt(0).toUpperCase() + language.slice(1)
  );
}

/**
 * Copy code content to clipboard
 */
function copyCodeToClipboard(codeBlock, button) {
  const code =
    codeBlock.querySelector('pre code') || codeBlock.querySelector('pre');
  const text = code.textContent || code.innerText;

  // Use modern clipboard API if available
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard
      .writeText(text)
      .then(function () {
        showCopySuccess(button);
      })
      .catch(function (err) {
        console.error('Failed to copy code: ', err);
        fallbackCopy(text, button);
      });
  } else {
    fallbackCopy(text, button);
  }
}

/**
 * Fallback copy method for older browsers
 */
function fallbackCopy(text, button) {
  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  document.body.appendChild(textarea);
  textarea.select();

  try {
    const successful = document.execCommand('copy');
    if (successful) {
      showCopySuccess(button);
    }
  } catch (err) {
    console.error('Fallback copy failed: ', err);
  } finally {
    document.body.removeChild(textarea);
  }
}

/**
 * Show copy success feedback
 */
function showCopySuccess(button) {
  const originalHTML = button.innerHTML;
  button.innerHTML = '<i class="fas fa-check"></i> Copied!';
  button.classList.add('copied');

  // Reset button after 2 seconds
  setTimeout(function () {
    button.innerHTML = originalHTML;
    button.classList.remove('copied');
  }, 2000);
}

/**
 * Detect current theme using your site's theme system
 */
function getCurrentTheme() {
  const htmlElement = document.documentElement;

  // Check for your theme system's classes on :root (html element)
  if (htmlElement.classList.contains('light-theme')) {
    return 'light';
  }

  if (htmlElement.classList.contains('dark-theme')) {
    return 'dark';
  }

  // Check for data attributes as fallback
  const themeData = htmlElement.getAttribute('data-theme');
  if (themeData) {
    return themeData.toLowerCase().includes('light') ? 'light' : 'dark';
  }

  // Check localStorage as another fallback
  try {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      return savedTheme.toLowerCase().includes('light') ? 'light' : 'dark';
    }
  } catch (e) {
    // Ignore localStorage errors
  }

  // Default to dark theme to match your site
  return 'dark';
}

/**
 * Theme-aware syntax highlighting - No longer needed to add classes to individual elements
 * The CSS now uses :root.light-theme selectors which work automatically
 */
function updateCodeTheme() {
  const currentTheme = getCurrentTheme();
  console.log('Current theme detected:', currentTheme);

  // The CSS handles the theming automatically with :root.light-theme selectors
  // We just need to make sure the theme is properly detected

  // Dispatch a custom event for other scripts that might need it
  document.dispatchEvent(
    new CustomEvent('codeThemeUpdated', {
      detail: { theme: currentTheme },
    })
  );
}

/**
 * Set up theme change observer
 */
function setupThemeObserver() {
  // Observe changes to the html element's class attribute
  const observer = new MutationObserver(function (mutations) {
    let themeChanged = false;

    mutations.forEach(function (mutation) {
      if (
        mutation.type === 'attributes' &&
        (mutation.attributeName === 'class' ||
          mutation.attributeName === 'data-theme')
      ) {
        themeChanged = true;
      }
    });

    if (themeChanged) {
      setTimeout(updateCodeTheme, 100); // Small delay to ensure theme change is complete
    }
  });

  // Observe the document element (html) for class changes
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['class', 'data-theme'],
  });

  // Also listen for storage events (in case theme is saved to localStorage)
  window.addEventListener('storage', function (e) {
    if (e.key === 'theme') {
      updateCodeTheme();
    }
  });

  // Listen for your site's theme toggle events
  document.addEventListener('themeChanged', updateCodeTheme);
}

/**
 * Add line numbers to code blocks (optional feature)
 */
function addLineNumbers() {
  const codeBlocks = document.querySelectorAll('.highlight pre');

  codeBlocks.forEach(function (pre) {
    // Skip if already has line numbers
    if (pre.querySelector('.line-numbers')) {
      return;
    }

    const code = pre.textContent || pre.innerText;
    const lines = code.split('\n');

    // Remove last empty line if it exists
    if (lines[lines.length - 1] === '') {
      lines.pop();
    }

    // Create line numbers
    const lineNumbers = document.createElement('div');
    lineNumbers.className = 'line-numbers';
    lineNumbers.setAttribute('aria-hidden', 'true');

    for (let i = 1; i <= lines.length; i++) {
      const lineNumber = document.createElement('span');
      lineNumber.className = 'line-number';
      lineNumber.textContent = i;
      lineNumbers.appendChild(lineNumber);
    }

    // Wrap content in a container
    const wrapper = document.createElement('div');
    wrapper.className = 'code-with-lines';

    // Move pre content to wrapper
    pre.parentNode.insertBefore(wrapper, pre);
    wrapper.appendChild(lineNumbers);
    wrapper.appendChild(pre);
  });
}

// Add CSS for additional features
const additionalCSS = `
    .copy-btn.copied {
        background: #238636 !important;
        border-color: #238636 !important;
        color: white !important;
        transform: scale(0.95);
    }
    
    .copy-btn:active {
        transform: scale(0.95);
    }
    
    .code-with-lines {
        display: flex;
        overflow-x: auto;
    }
    
    .line-numbers {
        background: rgba(22, 27, 34, 0.8);
        border-right: 1px solid #30363d;
        padding: 1rem 0.5rem 1rem 1rem;
        user-select: none;
        min-width: 3rem;
        text-align: right;
        font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', 'Source Code Pro', monospace;
        font-size: 0.875rem;
        line-height: 1.5;
        color: #6e7681;
        position: sticky;
        left: 0;
    }
    
    .line-numbers .line-number {
        display: block;
        padding: 0 0.5rem 0 0;
    }
    
    :root.light-theme .line-numbers {
        background: rgba(241, 243, 244, 0.8);
        border-right-color: #d0d7de;
        color: #586069;
    }
    
    .code-header {
        position: relative;
        z-index: 10;
    }
    
    .highlight {
        position: relative;
        overflow: visible;
    }
    
    /* Improved scrollbar for code blocks */
    .highlight pre::-webkit-scrollbar {
        height: 8px;
    }
    
    .highlight pre::-webkit-scrollbar-track {
        background: #161b22;
    }
    
    .highlight pre::-webkit-scrollbar-thumb {
        background: #30363d;
        border-radius: 4px;
    }
    
    .highlight pre::-webkit-scrollbar-thumb:hover {
        background: #484f58;
    }
    
    :root.light-theme .highlight pre::-webkit-scrollbar-track {
        background: #f6f8fa;
    }
    
    :root.light-theme .highlight pre::-webkit-scrollbar-thumb {
        background: #d0d7de;
    }
    
    :root.light-theme .highlight pre::-webkit-scrollbar-thumb:hover {
        background: #afb8c1;
    }
`;

// Inject additional CSS
const styleElement = document.createElement('style');
styleElement.textContent = additionalCSS;
document.head.appendChild(styleElement);
