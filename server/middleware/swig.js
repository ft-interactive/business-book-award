'use strict';

const _ = require('lodash');
const swig = require('swig');
const views = require('koa-views');

const filters = require('../util/filters');
const prod = process.env.NODE_ENV === 'production';
const site = require('../site');

Object.keys(filters).forEach(function(name) {
  if (!_.isFunction(filters[name])) {
    return;
  }
  swig.setFilter(name, filters[name]);
});

var assets;
var getAsset;

if (prod) {
  assets = require('../../public/rev-manifest.json');
  console.log('Load asset paths', assets);
  getAsset = function(name) {
    console.log('get asset')
    if (!assets[name]) return '';
    console.log('>>', assets[name])
    return site.baseurl.static + '/' + assets[name];
  };
} else {
  getAsset = function(name) {
    return site.baseurl.static + '/' + name;
  };
}

function getNow() {
  return Date.now();
}

swig.setDefaults({
  cache: prod ? 'memory' : false,
  locals: {
    asset: getAsset,
    now: getNow,
    site: site
  }
});

const middleware = views('../../views', {
  cache: prod ? 'memory' : false,
  map: {
    html: 'swig'
  }
});

exports.middleware = middleware;
