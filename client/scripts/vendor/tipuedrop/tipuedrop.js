
/*
Tipue drop 4.0
Copyright (c) 2014 Tipue
Tipue drop is released under the MIT License
http://www.tipue.com/drop
*/


(function($) {

  'use strict';

  $.fn.tipuedrop = function(options) {
    
    var tipuedrop = window.tipuedrop || {};

    var set = $.extend({
      show            : 3,
      speed           : 300,
      mode            : 'static',
      contentLocation : 'tipuedrop/tipuedrop_content.json',
      route: function(book) {
        return '/books/' + book.year + '/' + book.rank + '/' + book.slug;
      }
    }, options);

    return this.each(function() {

      var tipuedrop_in = {
        pages: []
      };

      if (set.mode === 'json') {
        $.getJSON(set.contentLocation,
          function(json) {
            tipuedrop_in.pages = json;
          }
        );
      }
      if (set.mode === 'static') {
        tipuedrop_in = $.extend({}, tipuedrop);
      }

      $(this).keyup(function() {
        getTipuedrop($(this));
      });

      function getTipuedrop($obj) {

        if ($obj.val()) {

          var c = 0,
              out,
              pat = new RegExp($obj.val(), 'i'),
              book;

          for (var i = 0; i < tipuedrop_in.pages.length; i++) {
            book = tipuedrop_in.pages[i];
            if ((book.title.search(pat) !== -1 || book.author.search(pat) !== -1 || book.year.toString().search(pat) !== -1) && c < set.show) {
              if (c === 0) {
                out = '<div id="tipue_drop_wrapper"><div class="tipue_drop_head"><div id="tipue_drop_head_text">Suggested results</div></div>';
              }
              out += '<a href="' + set.route(book) + '"';
              out += '><div class="tipue_drop_item"><div class="tipue_drop_left">';
              out += '<img src="http://image.webservices.ft.com/v1/images/raw/' + book.cover;
              out += '?source=ig_business_books_ofthe_decade&amp;width=120" class="tipue_drop_image" alt=""></div>';
              out += '<div class="tipue_drop_right"><div class="tipue_drop_right_title">' + book.title + '</div>';
              out += '<div class="tipue_drop_right_text">' + book.author + '<br />' + book.year + '</div></div></div></a>';
              c++;
            }
          }
          if (c !== 0) {
            out += '</div>';
            $('#tipue_drop_content').html(out);
            $('#tipue_drop_content').fadeIn(set.speed);
          }
        } else {
          $('#tipue_drop_content').fadeOut(set.speed);
        }
      }

      $('html').click(function() {
        $('#tipue_drop_content').fadeOut(set.speed);
      });
    });
  };
})(jQuery);
