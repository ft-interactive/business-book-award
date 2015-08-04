// FT gtg (good to go) standard
// https://docs.google.com/a/ft.com/document/d/11paOrAIl9eIOqUEERc9XMaaL3zouJDdkmb-gExYFnw0/edit
module.exports = function() {
  return function*(next) {
    this.set('Cache-Control', 'no-store no-cache private');
    this.body = 'OK';
    yield next;
  };
};
