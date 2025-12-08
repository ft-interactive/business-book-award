var qs = require("querystring");
const _ = require("lodash");

exports.image_service = function (input, width, height, quality, compression) {
  if (!input) {
    return "";
  }

  var args = {
    source: "business-books-of-the-year",
  };

  if (width) {
    args.width = width;
  }

  if (height) {
    args.height = height;
  }

  if (quality) {
    args.quality = quality;
  }

  if (compression) {
    args.compression = compression;
  }

  return input + "?" + qs.stringify(args, "&amp;");
};

exports.trim = function (input) {
  if (!input || typeof input !== "string") return input;
  return input.trim();
};

exports.split = function (input, delimeter) {
  return (input || []).split(delimeter);
};

exports.pluck = function (input, prop) {
  return _.map(input, prop);
};

exports.slice = function (input, a, b) {
  return !b ? input.slice(a || 0) : input.slice(a, b);
};
