var cash = require('koa-cash');
var lruCache = require('lru-cache');

module.exports = function(opts) {
  var cache = lruCache({
    maxAge: opts.maxAge || Infinity,
    max: opts.max || 128e6,
    length: function(n) {
      return n.length;
    }
  });

  return cash({
    get: function* (key, maxAge) {
      return cache.get(key)
    },
    set: function* (key, value) {
      cache.set(key, value)
    }
  });
};
