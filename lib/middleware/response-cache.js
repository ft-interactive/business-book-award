var cash = require('koa-cash');
var lruCache = require('lru-cache');

module.exports = function(opts) {
  var cache = lruCache({
    maxAge: opts.maxAge // global max age
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
