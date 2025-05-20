document.addEventListener('DOMContentLoaded', function () {
  // Select all tag spans with the inline styling
  const tagSelector =
    'span[style*="display: inline-block; margin: 2px; padding: 5px 10px; border: 1px solid #ccc; border-radius: 5px; background-color: #f5f5f5; font-size: 12px;"]';
  const tagElements = document.querySelectorAll(tagSelector);

  // Update all found elements to use our new class
  tagElements.forEach(function (element) {
    element.removeAttribute('style');
    element.classList.add('tech-tag');
  });
});
