var pkg = require('../../package.json');

// FT Health endpoint standard
// https://docs.google.com/a/ft.com/document/d/18hefJjImF5IFp9WvPAm9Iq5_GmWzI9ahlKSzShpQl1s/edit#
// FT health check format standard
// https://docs.google.com/a/ft.com/document/edit?id=1ftlkDj1SUXvKvKJGvoMoF1GnSUInCNPnNGomqTpJaFk
module.exports = function() {
  return function*(next) {
    this.set('Cache-Control', 'no-store no-cache private');
    this.body = {
      schemaVersion: 1,
      name: pkg.name,
      description: pkg.description,
      checks: [
        {
          name: 'site',
          ok: true,
          severity: 2,
          businessImact: 'FT Business book of the year microsite not be accessible by all users'
        }
      ]
    };
    yield next;
  };
};
