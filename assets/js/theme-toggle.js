document.addEventListener('DOMContentLoaded', function () {
  // Get the theme preference from localStorage or default to light
  const currentTheme = localStorage.getItem('theme') || 'light';

  // Apply the theme
  applyTheme(currentTheme);

  // Create the theme toggle button
  createThemeToggle();

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
        ? '<i class="fas fa-sun"></i>'
        : '<i class="fas fa-moon"></i>';
  }
}

function toggleTheme() {
  // Get current theme
  const currentTheme = localStorage.getItem('theme') || 'light';

  // Toggle to the other theme
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

  // Apply the new theme
  applyTheme(newTheme);
}

function createThemeToggle() {
  // Create the toggle button if it doesn't exist
  if (!document.querySelector('.theme-toggle')) {
    const toggleButton = document.createElement('div');
    toggleButton.className = 'theme-toggle';

    // Set initial icon based on current theme
    const currentTheme = localStorage.getItem('theme') || 'light';
    toggleButton.innerHTML =
      currentTheme === 'dark'
        ? '<i class="fas fa-sun"></i>'
        : '<i class="fas fa-moon"></i>';

    // Add to the body
    document.body.appendChild(toggleButton);
  }
}
