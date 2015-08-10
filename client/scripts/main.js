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

var books_request;

on('.js-tipue-drop', 'keyup', function(event) {

  if (!books_request) {
    books_request = fetch(window.searchOptions.contentLocation).then(function(response){
      return response.json();
    });
  }

  books_request.then(function(books){
    view_search_results(event.target, books);
  });

});

function filter_book_fuzzy(value) {
  var pat = new RegExp(value, 'i');
  return function(book) {
    return book.title.search(pat) !== -1 ||
            book.author.search(pat) !== -1 ||
            book.year.toString().search(pat) !== -1;
  }
}

function filter_book_exact_title(value) {
  value = value.toLowerCase();
  return function(book) {
    var s = book.title.toLowerCase().replace(/^(a|the) /).indexOf(value);
    return s === 0;
  }
}

function hide_results() {
  var dropdown = document.getElementById('tipue_drop_content');
  dropdown.innerHTML = '';
  // hide popup - fade out with speed variable
  dropdown.style.display = 'none';
}

function view_search_results(input, books) {

  var value = input.value;

  if (!value) {
    hide_results();
    return
  }

  
  var show = 3;
  var route = window.searchOptions.route;
  var matching;

  if (value.length < 3) {
    matching = books.filter(filter_book_exact_title(value)).slice(0, 6);
  } else {
    matching = books.filter(filter_book_fuzzy(value)).slice(0, 3);
  }

  if (!matching.length) {
    hide_results();
    return;
  }

  var html = '';

  html += '<div id="tipue_drop_wrapper"><div class="tipue_drop_head"><div id="tipue_drop_head_text">Suggested results</div></div>';
  html += matching.map(function(book) {
    var out = '';
    out += '<a href="' + route(book) + '"';
    out += '><div class="tipue_drop_item"><div class="tipue_drop_left">';
    out += '<img src="http://image.webservices.ft.com/v1/images/raw/' + book.cover;
    out += '?source=ft_ig_business_book_award_search&amp;width=120" class="tipue_drop_image" alt=""></div>';
    out += '<div class="tipue_drop_right"><div class="tipue_drop_right_title">' + book.title + '</div>';
    out += '<div class="tipue_drop_right_text">' + book.author + '<br />' + book.year + '</div></div></div></a>';
    return out;
  }).join('') + '</div>';

  var dropdown = document.getElementById('tipue_drop_content');
  dropdown.innerHTML = html;
  dropdown.style.display = 'block';
  // $('#tipue_drop_content').fadeIn(set.speed);

}
