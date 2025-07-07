// Apply theme immediately to prevent FOUC
(function() {
  const theme = localStorage.getItem('theme') || 'dark';
  document.documentElement.classList.add(`${theme}-theme`);
})();

document.addEventListener('DOMContentLoaded', function () {
  // Get the theme preference from localStorage or default to dark
  const currentTheme = localStorage.getItem('theme') || 'dark';

  // Apply the theme
  applyTheme(currentTheme);

  // Create the theme toggle button
  createThemeToggle();

  // Fallback: Try creating the button again after a delay
  setTimeout(() => {
    createThemeToggle();
  }, 500);

  // Add event listener for theme toggle
  document.addEventListener('click', function (e) {
    if (e.target.closest('.theme-toggle')) {
      toggleTheme();
    }
  });
});

function applyTheme(theme) {
  // Remove any existing theme classes
  document.documentElement.classList.remove('dark-theme', 'light-theme');

  // Add the current theme class
  document.documentElement.classList.add(`${theme}-theme`);

  // Update body background class based on theme
  if (theme === 'dark') {
    document.body.classList.add('bg-dark');
    document.body.classList.remove('bg-light');
  } else {
    document.body.classList.add('bg-light');
    document.body.classList.remove('bg-dark');
  }

  // Store the theme preference
  localStorage.setItem('theme', theme);

  // Update toggle button icon
  const toggleButton = document.querySelector('.theme-toggle');
  if (toggleButton) {
    toggleButton.innerHTML =
      theme === 'dark'
        ? '<i class="fas fa-sun" aria-hidden="true"></i>'
        : '<i class="fas fa-moon" aria-hidden="true"></i>';
    
    // Ensure button remains visible after theme change
    toggleButton.style.opacity = '1';
    toggleButton.style.visibility = 'visible';
  }
}

function toggleTheme() {
  // Get current theme
  const currentTheme = localStorage.getItem('theme') || 'dark';

  // Toggle to the other theme
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

  // Apply the new theme
  applyTheme(newTheme);
}

function createThemeToggle() {
  // Create the toggle button if it doesn't exist
  if (!document.querySelector('.theme-toggle')) {
    const toggleButton = document.createElement('button');
    toggleButton.className = 'theme-toggle';
    toggleButton.setAttribute('type', 'button');
    toggleButton.setAttribute('title', 'Toggle dark/light mode');
    toggleButton.setAttribute('aria-label', 'Toggle dark/light mode');

    // Set initial icon based on current theme
    const currentTheme = localStorage.getItem('theme') || 'dark';
    toggleButton.innerHTML =
      currentTheme === 'dark'
        ? '<i class="fas fa-sun" aria-hidden="true"></i>'
        : '<i class="fas fa-moon" aria-hidden="true"></i>';

    // Force styles to ensure visibility
    toggleButton.style.cssText = `
      position: fixed !important;
      bottom: 90px !important;
      right: 30px !important;
      z-index: 10000 !important;
      width: 50px !important;
      height: 50px !important;
      border-radius: 50% !important;
      background: #38bdf8 !important;
      border: none !important;
      color: white !important;
      cursor: pointer !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      font-size: 1.2rem !important;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3) !important;
      opacity: 1 !important;
      visibility: visible !important;
    `;

    // Add to the body
    document.body.appendChild(toggleButton);
    
    console.log('🌙 Theme toggle button created and positioned');
  }
}
