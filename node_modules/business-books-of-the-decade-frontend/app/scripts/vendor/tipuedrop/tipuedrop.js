
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
      'show'            : 3,
      'speed'           : 300,
      'mode'            : 'static',
      'contentLocation' : 'tipuedrop/tipuedrop_content.json'
    }, options);

    return this.each(function() {

      var tipuedrop_in = {
        pages: []
      };
      $.ajaxSetup({
        async: false
      });

      if (set.mode === 'json') {
        $.getJSON(set.contentLocation,
          function(json) {
            tipuedrop_in = $.extend({}, json);
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
              out;
          for (var i = 0; i < tipuedrop_in.pages.length; i++) {
            var pat = new RegExp($obj.val(), 'i');

            if ((tipuedrop_in.pages[i].title.search(pat) !== -1 || tipuedrop_in.pages[i].author.search(pat) !== -1 || tipuedrop_in.pages[i].year.search(pat) !== -1) && c < set.show) {
              if (c === 0) {
                out = '<div id="tipue_drop_wrapper"><div class="tipue_drop_head"><div id="tipue_drop_head_text">Suggested results</div></div>';
              }
              out += '<a href="/books/' + tipuedrop_in.pages[i].year + '/' + tipuedrop_in.pages[i].rank + '/' + tipuedrop_in.pages[i].slug + '"';
              out += '><div class="tipue_drop_item"><div class="tipue_drop_left"><img src="http://image.webservices.ft.com/v1/images/raw/http://interactivegraphics.ft-static.com/static/sites/2014/business-books-of-the-decade/covers/' + tipuedrop_in.pages[i].cover + '?source=business_books_ofthe_decade&amp;width=120" class="tipue_drop_image" alt=""></div><div class="tipue_drop_right"><div class="tipue_drop_right_title">' + tipuedrop_in.pages[i].title + '</div><div class="tipue_drop_right_text">' + tipuedrop_in.pages[i].author + '<br />' + tipuedrop_in.pages[i].year + '</div></div></div></a>';
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
