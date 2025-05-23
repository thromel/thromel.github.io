/**
 * Code Highlighting Enhancements
 * Adds copy-to-clipboard functionality and other code block improvements
 */

document.addEventListener('DOMContentLoaded', function () {
  // Add copy buttons to all code blocks
  addCopyButtons();

  // Add language labels to code blocks
  addLanguageLabels();

  // Add line number support (optional)
  // addLineNumbers();
});

/**
 * Add copy-to-clipboard buttons to all code blocks
 */
function addCopyButtons() {
  const codeBlocks = document.querySelectorAll('.highlight');

  codeBlocks.forEach(function (codeBlock) {
    // Skip if already has a copy button
    if (codeBlock.querySelector('.copy-btn')) {
      return;
    }

    // Create copy button
    const copyBtn = document.createElement('button');
    copyBtn.className = 'copy-btn';
    copyBtn.innerHTML = '<i class="fas fa-copy"></i> Copy';
    copyBtn.setAttribute('title', 'Copy code to clipboard');

    // Add click event
    copyBtn.addEventListener('click', function () {
      copyCodeToClipboard(codeBlock, copyBtn);
    });

    // Create header if it doesn't exist
    let header = codeBlock.previousElementSibling;
    if (!header || !header.classList.contains('code-header')) {
      header = document.createElement('div');
      header.className = 'code-header';
      codeBlock.parentNode.insertBefore(header, codeBlock);
    }

    // Add copy button to header
    header.appendChild(copyBtn);
  });
}

/**
 * Add language labels to code blocks
 */
function addLanguageLabels() {
  const codeBlocks = document.querySelectorAll('.highlight');

  codeBlocks.forEach(function (codeBlock) {
    // Extract language from class name
    const classes = codeBlock.className.split(' ');
    let language = 'code';

    for (const className of classes) {
      if (className.startsWith('language-')) {
        language = className.replace('language-', '');
        break;
      }
    }

    // Check if header already exists
    let header = codeBlock.previousElementSibling;
    if (!header || !header.classList.contains('code-header')) {
      header = document.createElement('div');
      header.className = 'code-header';
      codeBlock.parentNode.insertBefore(header, codeBlock);
    }

    // Add language label if it doesn't exist
    if (!header.querySelector('.code-language')) {
      const languageLabel = document.createElement('span');
      languageLabel.className = 'code-language';
      languageLabel.textContent =
        language.charAt(0).toUpperCase() + language.slice(1);
      header.insertBefore(languageLabel, header.firstChild);
    }
  });
}

/**
 * Copy code content to clipboard
 */
function copyCodeToClipboard(codeBlock, button) {
  const code =
    codeBlock.querySelector('pre code') || codeBlock.querySelector('pre');
  const text = code.textContent || code.innerText;

  // Create a temporary textarea to copy from
  const textarea = document.createElement('textarea');
  textarea.value = text;
  document.body.appendChild(textarea);
  textarea.select();

  try {
    const successful = document.execCommand('copy');
    if (successful) {
      // Update button to show success
      const originalHTML = button.innerHTML;
      button.innerHTML = '<i class="fas fa-check"></i> Copied!';
      button.classList.add('copied');

      // Reset button after 2 seconds
      setTimeout(function () {
        button.innerHTML = originalHTML;
        button.classList.remove('copied');
      }, 2000);
    }
  } catch (err) {
    console.error('Failed to copy code: ', err);

    // Fallback for modern browsers
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(function () {
        const originalHTML = button.innerHTML;
        button.innerHTML = '<i class="fas fa-check"></i> Copied!';
        button.classList.add('copied');

        setTimeout(function () {
          button.innerHTML = originalHTML;
          button.classList.remove('copied');
        }, 2000);
      });
    }
  } finally {
    document.body.removeChild(textarea);
  }
}

/**
 * Add line numbers to code blocks (optional feature)
 */
function addLineNumbers() {
  const codeBlocks = document.querySelectorAll(
    '.highlight pre code, .highlight pre'
  );

  codeBlocks.forEach(function (codeElement) {
    const code = codeElement.textContent || codeElement.innerText;
    const lines = code.split('\n');

    // Remove last empty line if it exists
    if (lines[lines.length - 1] === '') {
      lines.pop();
    }

    // Create line numbers
    const lineNumbers = lines
      .map((_, index) => `<span class="line-number">${index + 1}</span>`)
      .join('\n');

    // Create wrapper
    const wrapper = document.createElement('div');
    wrapper.className = 'code-with-lines';

    // Create line numbers column
    const lineNumbersColumn = document.createElement('div');
    lineNumbersColumn.className = 'line-numbers';
    lineNumbersColumn.innerHTML = lineNumbers;

    // Clone the original code element
    const codeColumn = codeElement.cloneNode(true);
    codeColumn.className = 'code-content';

    // Build the new structure
    wrapper.appendChild(lineNumbersColumn);
    wrapper.appendChild(codeColumn);

    // Replace the original
    codeElement.parentNode.replaceChild(wrapper, codeElement);
  });
}

/**
 * Highlight specific lines in code blocks
 * Usage: Add data-highlight-lines="1,3-5,8" to the code block
 */
function highlightSpecificLines() {
  const codeBlocks = document.querySelectorAll(
    '.highlight[data-highlight-lines]'
  );

  codeBlocks.forEach(function (codeBlock) {
    const highlightLines = codeBlock.getAttribute('data-highlight-lines');
    const ranges = highlightLines.split(',');
    const linesToHighlight = new Set();

    ranges.forEach(function (range) {
      if (range.includes('-')) {
        const [start, end] = range.split('-').map(Number);
        for (let i = start; i <= end; i++) {
          linesToHighlight.add(i);
        }
      } else {
        linesToHighlight.add(Number(range));
      }
    });

    const pre = codeBlock.querySelector('pre');
    const code = pre.textContent || pre.innerText;
    const lines = code.split('\n');

    // Add highlight class to specified lines
    // This would require additional CSS and DOM manipulation
    // Implementation depends on your specific highlighting needs
  });
}

/**
 * Add smooth scrolling for long code blocks
 */
function addCodeBlockScrolling() {
  const codeBlocks = document.querySelectorAll('.highlight');

  codeBlocks.forEach(function (codeBlock) {
    const pre = codeBlock.querySelector('pre');
    if (pre && pre.scrollWidth > pre.clientWidth) {
      codeBlock.classList.add('scrollable');
    }
  });
}

/**
 * Theme-aware syntax highlighting
 * Updates code highlighting when theme changes
 */
function updateCodeTheme() {
  const isDarkTheme = document.documentElement.classList.contains('dark-theme');
  const codeBlocks = document.querySelectorAll('.highlight');

  codeBlocks.forEach(function (codeBlock) {
    if (isDarkTheme) {
      codeBlock.classList.remove('light-theme');
      codeBlock.classList.add('dark-theme');
    } else {
      codeBlock.classList.remove('dark-theme');
      codeBlock.classList.add('light-theme');
    }
  });
}

// Listen for theme changes
document.addEventListener('themeChanged', updateCodeTheme);

// CSS for copied state
const style = document.createElement('style');
style.textContent = `
    .copy-btn.copied {
        background: #238636 !important;
        border-color: #238636 !important;
        color: white !important;
    }
    
    .code-with-lines {
        display: flex;
    }
    
    .line-numbers {
        background: #161b22;
        border-right: 1px solid #30363d;
        padding: 1rem 0.5rem;
        user-select: none;
        min-width: 2.5rem;
        text-align: right;
        font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', 'Source Code Pro', monospace;
        font-size: 0.875rem;
        line-height: 1.5;
        color: #6e7681;
    }
    
    .line-numbers .line-number {
        display: block;
    }
    
    .code-content {
        flex: 1;
        overflow-x: auto;
    }
    
    .highlight.scrollable::after {
        content: "← Scroll horizontally to see more";
        position: absolute;
        bottom: 0.5rem;
        right: 1rem;
        font-size: 0.75rem;
        color: #8b949e;
        opacity: 0.7;
    }
`;
document.head.appendChild(style);
