/*
  dataLoader — busca todo o conteúdo em /data (JSON) via fetch().

  Aviso importante: navegadores bloqueiam fetch() de arquivos locais quando a
  página é aberta via file:// (duplo clique), por política de segurança do
  próprio navegador — não é uma falha desta implementação. Por isso, detectamos
  o protocolo file:// ANTES de tentar o fetch e devolvemos um erro específico
  ('FILE_PROTOCOL'), que main.js usa para mostrar uma tela explicativa amigável
  em vez de uma falha silenciosa. Servido via http(s) — incluindo GitHub Pages
  ou qualquer servidor local simples — o fetch funciona normalmente.
*/
(function (App) {
  'use strict';

  var DATA_FILES = {
    config: 'data/config.json',
    couple: 'data/couple.json',
    synopsis: 'data/synopsis.json',
    categories: 'data/categories.json',
    gallery: 'data/gallery.json',
    episodes: 'data/episodes.json',
    soundtrack: 'data/soundtrack.json',
    timeline: 'data/timeline.json',
    people: 'data/people.json'
  };

  function isFileProtocol() {
    return window.location.protocol === 'file:';
  }

  function fetchJSON(url) {
    return fetch(url).then(function (response) {
      if (!response.ok) throw new Error('HTTP ' + response.status + ' ao carregar ' + url);
      return response.json();
    });
  }

  function loadAll() {
    if (isFileProtocol()) {
      return Promise.reject(new Error('FILE_PROTOCOL'));
    }
    var keys = Object.keys(DATA_FILES);
    return Promise.all(keys.map(function (key) { return fetchJSON(DATA_FILES[key]); }))
      .then(function (results) {
        var data = {};
        keys.forEach(function (key, i) { data[key] = results[i]; });
        return data;
      });
  }

  App.core = App.core || {};
  App.core.dataLoader = { loadAll: loadAll, isFileProtocol: isFileProtocol, files: DATA_FILES };
})(window.WeddingApp = window.WeddingApp || {});
