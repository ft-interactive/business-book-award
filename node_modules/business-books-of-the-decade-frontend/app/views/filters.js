var qs = require('querystring');

exports.image_service = function (input, width, height) {
  var args = {
    source: 'ig_business_books_ofthe_decade'
  };

  if (width) {
    args.width = width;
  }

  if (height) {
    args.height = height;
  }

  return 'http://image.webservices.ft.com/v1/images/raw/' + input + '?' + qs.stringify(args, '&amp;');
};
