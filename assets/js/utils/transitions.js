/*
  transitions — transições simples de fade (base funcional, sem efeitos
  cinematográficos avançados ainda — isso fica para uma fase seguinte).
  Respeita prefers-reduced-motion automaticamente.
*/
(function (App) {
  'use strict';

  function fadeIn(node) {
    node.classList.remove('is-hidden');
    requestAnimationFrame(function () { node.classList.add('is-visible'); });
  }

  function fadeOut(node, done) {
    node.classList.remove('is-visible');
    var reduced = App.core.a11y.prefersReducedMotion();
    var delay = reduced ? 0 : 250;
    window.setTimeout(function () {
      node.classList.add('is-hidden');
      if (typeof done === 'function') done();
    }, delay);
  }

  App.utils = App.utils || {};
  App.utils.transitions = { fadeIn: fadeIn, fadeOut: fadeOut };
})(window.WeddingApp = window.WeddingApp || {});
