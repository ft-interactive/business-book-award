var qs = require('querystring');

exports.image_service = function (input, width, height) {

  if (!input) {
    return '';
  }

  var args = {
    source: 'ig_business_book_award'
  };

  if (width) {
    args.width = width;
  }

  if (height) {
    args.height = height;
  }

  return 'https://image.webservices.ft.com/v1/images/raw/' + input + '?' + qs.stringify(args, '&amp;');
};

exports.slice = function(input, a, b) {
  return !b ? input.slice(a || 0) : input.slice(a, b);
};
