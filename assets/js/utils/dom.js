/*
  dom — helper leve de criação de elementos, para evitar repetição de
  createElement/setAttribute/appendChild pelos componentes.
*/
(function (App) {
  'use strict';

  function el(tag, attrs, children) {
    var node = document.createElement(tag);
    attrs = attrs || {};
    Object.keys(attrs).forEach(function (key) {
      var value = attrs[key];
      if (value === null || value === undefined || value === false || value === '') {
        if (key !== 'value') return;
      }
      if (key === 'class') node.className = value;
      else if (key === 'html') node.innerHTML = value;
      else if (key.indexOf('on') === 0 && typeof value === 'function') {
        node.addEventListener(key.slice(2).toLowerCase(), value);
      } else if (
        key.indexOf('data-') === 0 ||
        key.indexOf('aria-') === 0 ||
        key === 'fetchpriority' ||
        key === 'role'
      ) {
        // Atributos cuja propriedade IDL não existe ou tem grafia diferente
        // da chave HTML (ex.: fetchpriority → fetchPriority) — mais seguro
        // sempre usar setAttribute nesses casos.
        node.setAttribute(key, value);
      } else {
        node[key] = value;
      }
    });
    (children || []).forEach(function (child) {
      if (child === null || child === undefined || child === false) return;
      node.appendChild(typeof child === 'string' ? document.createTextNode(child) : child);
    });
    return node;
  }

  function clear(node) {
    while (node.firstChild) node.removeChild(node.firstChild);
  }

  App.utils = App.utils || {};
  App.utils.dom = { el: el, clear: clear };
})(window.WeddingApp = window.WeddingApp || {});
