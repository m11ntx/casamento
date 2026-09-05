/*
  carousel — monta a estrutura de um carrossel horizontal reutilizável
  (usado por Galeria, Momentos e Episódios): uma trilha com scroll nativo
  (funciona por toque em mobile, sem barra de rolagem visível — ver
  carousel.css) e setas de navegação que aparecem no hover para desktop.
*/
(function (App) {
  'use strict';
  var dom = App.utils.dom;

  function build(items, opts) {
    opts = opts || {};
    var track = dom.el('div', { class: 'carousel__track', role: 'list', 'aria-label': opts.label || '' }, items);

    function scrollByPage(direction) {
      var amount = track.clientWidth * 0.85 * direction;
      track.scrollBy({ left: amount, behavior: 'smooth' });
    }

    var prevButton = dom.el('button', {
      class: 'carousel__arrow carousel__arrow--prev',
      type: 'button',
      'aria-label': 'Item anterior',
      onClick: function () { scrollByPage(-1); }
    }, ['‹']);

    var nextButton = dom.el('button', {
      class: 'carousel__arrow carousel__arrow--next',
      type: 'button',
      'aria-label': 'Próximo item',
      onClick: function () { scrollByPage(1); }
    }, ['›']);

    var wrapper = dom.el('div', { class: 'carousel' }, [prevButton, track, nextButton]);

    return { wrapper: wrapper, track: track };
  }

  App.utils = App.utils || {};
  App.utils.carousel = { build: build };
})(window.WeddingApp = window.WeddingApp || {});
