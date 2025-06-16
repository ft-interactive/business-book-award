var service = require('../service');

module.exports = function*(next) {
  console.log('Refresh data request received');
  this.assert(this.query.auth, 404, 'Not found');
  this.assert(this.query.auth == process.env.SPREADSHEET_REFRESH_TOKEN, 401, 'Invalid auth token');
  var republish = 'republish' in this.query;
  var changed = yield service.refresh(republish);
  var msg = (republish ? 'REPUBLISH' : 'Refresh') + 'ed at ' + (new Date()).toUTCString();
  if (republish) {
    if (changed) {
      msg += '\n\n\n-- And the Bertha data HAS changed!';
    } else {
      msg += '\n\n-- BUT THE BERTHA RESPONSE HAD NO CHANGE IN THE DATA!';
    }
  }
  this.body = msg;
};
