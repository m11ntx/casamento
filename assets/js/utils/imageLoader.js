/*
  imageLoader — lazy loading de imagens via IntersectionObserver, com fallback
  para navegadores sem suporte (carrega imediatamente).
  Uso: <img data-src="caminho/da/imagem.webp" ...> + imageLoader.observeAll(container)
*/
(function (App) {
  'use strict';

  var observer = null;

  function getObserver() {
    if (observer) return observer;
    if (!('IntersectionObserver' in window)) return null;
    observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          loadImage(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, { rootMargin: '200px 0px' });
    return observer;
  }

  function loadImage(img) {
    var src = img.getAttribute('data-src');
    if (!src) return;
    img.src = src;
    img.removeAttribute('data-src');
    img.classList.add('is-loaded');
  }

  function observe(img) {
    var obs = getObserver();
    if (!obs) {
      loadImage(img);
      return;
    }
    obs.observe(img);
  }

  function observeAll(root) {
    var scope = root || document;
    var images = scope.querySelectorAll('img[data-src]');
    images.forEach(function (img) { observe(img); });
  }

  App.utils = App.utils || {};
  App.utils.imageLoader = { observe: observe, observeAll: observeAll, loadImage: loadImage };
})(window.WeddingApp = window.WeddingApp || {});
