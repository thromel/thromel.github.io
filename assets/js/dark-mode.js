// Function to toggle dark mode
function toggleDarkMode() {
  const body = document.body;
  const lightIcon = document.getElementById('lightIcon');
  const darkIcon = document.getElementById('darkIcon');

  // Toggle dark mode class on body
  body.classList.toggle('dark-mode');

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
document.addEventListener('DOMContentLoaded', function () {
  const darkModeToggle = document.getElementById('darkModeToggle');
  const lightIcon = document.getElementById('lightIcon');
  const darkIcon = document.getElementById('darkIcon');

  // Check if dark mode was previously enabled
  if (localStorage.getItem('darkMode') === 'enabled') {
    document.body.classList.add('dark-mode');
    lightIcon.style.display = 'none';
    darkIcon.style.display = 'inline-block';
  }

  // Add click event to toggle button
  darkModeToggle.addEventListener('click', toggleDarkMode);
});
