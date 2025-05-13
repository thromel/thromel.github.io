// Function to toggle dark mode
function toggleDarkMode() {
  console.log('Toggle dark mode called');
  const body = document.body;
  const lightIcon = document.getElementById('lightIcon');
  const darkIcon = document.getElementById('darkIcon');

  // Toggle dark mode class on body
  body.classList.toggle('dark-mode');
  console.log('Dark mode toggled:', body.classList.contains('dark-mode'));

  // Toggle icon visibility
  if (body.classList.contains('dark-mode')) {
    lightIcon.style.display = 'none';
    darkIcon.style.display = 'inline-block';
    localStorage.setItem('darkMode', 'enabled');
  } else {
    lightIcon.style.display = 'inline-block';
    darkIcon.style.display = 'none';
    localStorage.setItem('darkMode', 'disabled');
  }
}

// Check for saved user preference
window.addEventListener('DOMContentLoaded', function () {
  console.log('DOM loaded, initializing dark mode');

  const darkModeToggle = document.getElementById('darkModeToggle');
  const lightIcon = document.getElementById('lightIcon');
  const darkIcon = document.getElementById('darkIcon');

  if (!darkModeToggle) {
    console.error('Dark mode toggle button not found');
    return;
  }

  console.log('Dark mode toggle found:', darkModeToggle);

  // Check if dark mode was previously enabled
  if (localStorage.getItem('darkMode') === 'enabled') {
    console.log('Dark mode was previously enabled');
    document.body.classList.add('dark-mode');
    lightIcon.style.display = 'none';
    darkIcon.style.display = 'inline-block';
  }

  // Add click event to toggle button
  darkModeToggle.addEventListener('click', toggleDarkMode);
  console.log('Dark mode toggle event listener added');
});
