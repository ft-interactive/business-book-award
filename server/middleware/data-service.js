module.exports = function() {
  var service = require('../service');

  return function*(next) {
    this.service = service;
    yield next;
  };
};
