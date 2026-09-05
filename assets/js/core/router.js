/*
  router — hash router minimalista (#/rota). Escolhido por ser 100% compatível
  com GitHub Pages sem nenhuma configuração de servidor/rewrite.
*/
(function (App) {
  'use strict';

  var routes = [];
  var notFoundHandler = null;

  function register(pattern, handler) {
    var paramNames = [];
    var regex = new RegExp('^' + pattern.replace(/:[^/]+/g, function (match) {
      paramNames.push(match.slice(1));
      return '([^/]+)';
    }) + '$');
    routes.push({ regex: regex, paramNames: paramNames, handler: handler });
  }

  function setNotFound(handler) { notFoundHandler = handler; }

  function currentPath() {
    var hash = window.location.hash || '#/';
    return hash.replace(/^#/, '') || '/';
  }

  function resolve() {
    var path = currentPath();
    for (var i = 0; i < routes.length; i++) {
      var match = path.match(routes[i].regex);
      if (match) {
        var params = {};
        routes[i].paramNames.forEach(function (name, idx) { params[name] = decodeURIComponent(match[idx + 1]); });
        routes[i].handler(params);
        return;
      }
    }
    if (notFoundHandler) notFoundHandler();
  }

  function navigate(path) {
    if (currentPath() === path) {
      resolve();
    } else {
      window.location.hash = '#' + path;
    }
  }

  function start() {
    window.addEventListener('hashchange', resolve);
    resolve();
  }

  App.core = App.core || {};
  App.core.router = { register: register, setNotFound: setNotFound, navigate: navigate, start: start, currentPath: currentPath };
})(window.WeddingApp = window.WeddingApp || {});
