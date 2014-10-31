'use strict';

onDomReady(function () {
  if ('querySelector' in document &&
      'localStorage' in window &&
      'addEventListener' in window &&
      'classList' in document.createElement('_')) {
    document.documentElement.className = document.documentElement.className.replace(/\bno-js\b/g, 'js');

    require('fastclick')(document.body); // github.com/ftlabs/fastclick

    var filterBarToggleElement = '<a href="#filterbar" class="js-filter-bar-toggle top-bar__action" role="button"><span class="visuallyhidden">Menu</span></a>';
    document.querySelector('.js-filter-bar-toggle-placeholder').innerHTML = filterBarToggleElement;

    var filterBar = document.querySelector('.js-filter-bar');

    [].forEach.call(document.querySelectorAll('.js-filter-bar-toggle'), function (el) {
      el.addEventListener('click', function(e) {
        e.preventDefault();
        filterBar.classList.toggle('filter-bar--hidden');
      }, false);
    });

    // Prevent search form submission
    document.querySelector('.js-search-form').addEventListener('submit', function(e) {
      e.preventDefault();
    }, false);

    // Submit the filter form on change
    document.querySelector('.js-filter-form-select').addEventListener('change', function() {
      document.querySelector('.js-filter-form').submit();
    }, false);

    $('.js-tipue-drop').tipuedrop();
  }
});
