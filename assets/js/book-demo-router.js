(function() {
  'use strict';

  var triggers = document.querySelectorAll('[data-book-demo-trigger]');

  triggers.forEach(function(trigger) {
    trigger.addEventListener('click', function(event) {
      event.preventDefault();
      if (typeof window.openQuizModal === 'function') {
        window.openQuizModal();
      }
    });
  });
})();
