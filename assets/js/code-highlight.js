/**
 * Code Highlighting Enhancements
 * Adds copy-to-clipboard functionality and other code block improvements
 */

// Global flag to prevent multiple initializations
window.codeHighlightInitialized = window.codeHighlightInitialized || false;

document.addEventListener('DOMContentLoaded', function () {
  // Prevent multiple initializations
  if (window.codeHighlightInitialized) {
    console.log('Code highlighting already initialized, skipping...');
    return;
  }

  console.log('Initializing code highlighting...');

  // Clean up any existing duplicate headers first
  aggressiveCleanupDuplicateHeaders();

  // Enhance all code blocks with copy buttons and language labels
  enhanceCodeBlocks();

  // Initialize theme-aware highlighting
  updateCodeTheme();

  // Set up theme change observers
  setupThemeObserver();

  // Mark as initialized
  window.codeHighlightInitialized = true;

  console.log('Code highlighting initialization complete');

  // Add line number support (optional)
  // addLineNumbers();
});

/**
 * Aggressive cleanup of any duplicate headers that might exist
 */
function aggressiveCleanupDuplicateHeaders() {
  console.log('Starting aggressive cleanup of duplicate headers...');

  // Remove ALL existing code headers first
  const existingHeaders = document.querySelectorAll('.code-header');
  console.log(`Found ${existingHeaders.length} existing headers to remove`);
  existingHeaders.forEach((header) => header.remove());

  // Remove any orphaned copy buttons
  const orphanedButtons = document.querySelectorAll(
    '.copy-btn:not(.code-header .copy-btn)'
  );
  console.log(
    `Found ${orphanedButtons.length} orphaned copy buttons to remove`
  );
  orphanedButtons.forEach((button) => button.remove());

  // Reset all enhanced flags
  const allCodeBlocks = document.querySelectorAll('.highlight');
  allCodeBlocks.forEach((block) => {
    block.removeAttribute('data-enhanced');
    block.removeAttribute('data-code-highlight-processed');
  });

  console.log('Aggressive cleanup complete');
}

/**
 * Clean up any duplicate headers that might exist (lighter version)
 */
function cleanupDuplicateHeaders() {
  // First, remove any standalone headers without proper code blocks
  const allHeaders = document.querySelectorAll('.code-header');

  allHeaders.forEach(function (header) {
    const nextSibling = header.nextElementSibling;
    const hasValidCodeBlock =
      nextSibling &&
      (nextSibling.classList.contains('highlight') ||
        nextSibling.querySelector('.highlight'));

    if (!hasValidCodeBlock) {
      header.remove();
    }
  });

  // Then handle duplicates for the same code block
  const codeBlocks = document.querySelectorAll('.highlight');

  codeBlocks.forEach(function (codeBlock) {
    const headers = [];
    let currentElement = codeBlock.previousElementSibling;

    // Find all preceding headers
    while (currentElement && currentElement.classList.contains('code-header')) {
      headers.unshift(currentElement);
      currentElement = currentElement.previousElementSibling;
    }

    // Remove all but the first header
    if (headers.length > 1) {
      headers.slice(1).forEach((header) => header.remove());
    }
  });
}

/**
 * Enhance all code blocks with copy buttons and language labels
 */
function enhanceCodeBlocks() {
  console.log('Enhancing code blocks...');

  const codeBlocks = document.querySelectorAll('.highlight');
  console.log(`Found ${codeBlocks.length} code blocks to enhance`);

  codeBlocks.forEach(function (codeBlock, index) {
    // Multiple checks to prevent duplicate processing
    if (
      codeBlock.hasAttribute('data-enhanced') ||
      codeBlock.hasAttribute('data-code-highlight-processed')
    ) {
      console.log(`Code block ${index} already enhanced, skipping`);
      return;
    }

    // Check if there's already a code header before this code block
    const previousSibling = codeBlock.previousElementSibling;
    if (previousSibling && previousSibling.classList.contains('code-header')) {
      console.log(
        `Code block ${index} already has header, marking as enhanced`
      );
      codeBlock.setAttribute('data-enhanced', 'true');
      codeBlock.setAttribute('data-code-highlight-processed', 'true');
      return;
    }

    // Check if this code block is already inside a container with a header
    const parent = codeBlock.parentElement;
    if (parent && parent.querySelector('.code-header')) {
      console.log(`Code block ${index} parent has header, marking as enhanced`);
      codeBlock.setAttribute('data-enhanced', 'true');
      codeBlock.setAttribute('data-code-highlight-processed', 'true');
      return;
    }

    console.log(`Enhancing code block ${index}...`);

    // Mark as enhanced BEFORE processing to prevent race conditions
    codeBlock.setAttribute('data-enhanced', 'true');
    codeBlock.setAttribute('data-code-highlight-processed', 'true');

    // Extract language from class name (Rouge adds language-* classes)
    const language = extractLanguage(codeBlock);

    // Create header with both language label and copy button
    const header = createCodeHeader(language, codeBlock, index);

    // Insert header before code block
    codeBlock.parentNode.insertBefore(header, codeBlock);

    console.log(`Enhanced code block ${index} with language: ${language}`);
  });

  console.log('Code block enhancement complete');
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
function createCodeHeader(language, codeBlock, blockIndex) {
  const header = document.createElement('div');
  header.className = 'code-header';
  // Add unique identifier to prevent duplicates
  header.setAttribute(
    'data-block-id',
    `code-block-${blockIndex}-${Date.now()}`
  );

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
  // Add unique identifier to copy button
  copyBtn.setAttribute('data-copy-id', `copy-btn-${blockIndex}-${Date.now()}`);

  // Add click event to copy button (use addEventListener to prevent duplicates)
  copyBtn.addEventListener(
    'click',
    function (e) {
      e.preventDefault();
      e.stopPropagation();
      copyCodeToClipboard(codeBlock, copyBtn);
    },
    { once: false }
  );

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
