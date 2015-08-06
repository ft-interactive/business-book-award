'use strict';
require('fastclick')(document.body); // github.com/ftlabs/fastclick

function on(selector, event, callback) {
  document.querySelector(selector).addEventListener(event, callback);
}

document.querySelector('.js-filter-bar-toggle-placeholder')
        .insertAdjacentHTML('beforeend', '<a href="#filterbar" class="js-filter-bar-toggle top-bar__action" role="button"><span class="visuallyhidden">Menu</span></a>');

on('.js-filter-bar-toggle', 'click', function(event) {
  event.preventDefault();
  var filterBar = document.querySelector('.js-filter-bar');
  if (!filterBar) return;
  filterBar.classList.toggle('filter-bar--hidden');
});

// Prevent search form submission
on('.js-search-form', 'submit', function(event) {
  event.preventDefault();
});

// Submit the filter form on change
on('.js-filter-form-select', 'change', function(event) {
  document.querySelector('.js-filter-form').submit();
});

//$('.js-tipue-drop').tipuedrop(window.searchOptions);
