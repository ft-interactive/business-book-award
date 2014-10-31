$(document).ready(function() {
  'use strict';
  require('fastclick')(document.body); // github.com/ftlabs/fastclick

  var filterBarToggleElement = '<a href="#filterbar" class="js-filter-bar-toggle top-bar__action" role="button"><span class="visuallyhidden">Menu</span></a>';
  $('.js-filter-bar-toggle-placeholder').append(filterBarToggleElement);

  var filterBar = $('.js-filter-bar');

  $('.js-filter-bar-toggle').each(function(el) {
    $(el).on('click', function(e) {
      e.preventDefault();
      filterBar.toggleClass('filter-bar--hidden');
    });
  });

  // Prevent search form submission
  $('.js-search-form').on('submit', function(e) {
    e.preventDefault();
  });

  // Submit the filter form on change
  $('.js-filter-form-select').on('change', function() {
    $('.js-filter-form').submit();
  });

  $('.js-tipue-drop').tipuedrop();
});
