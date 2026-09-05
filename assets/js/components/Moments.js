/*
  Moments (Momentos) — carrossel de destaques visuais construído a partir de
  timeline.json (mesmos dados usados na Linha do Tempo, aqui apresentados como
  cartões de foto + data + título, em vez de lista cronológica).
*/
(function (App) {
  'use strict';
  var dom = App.utils.dom;
  var format = App.utils.format;

  function Moments(container, ctx) {
    var events = (ctx.data.timeline || []).slice().sort(function (a, b) { return new Date(a.date) - new Date(b.date); });
    var gallery = ctx.data.gallery || [];

    function findPhoto(photoId) {
      return gallery.find(function (p) { return p.id === photoId; });
    }

    function renderCard(event) {
      var photo = event.photoId ? findPhoto(event.photoId) : null;
      return dom.el('div', { class: 'moments__card' }, [
        dom.el('div', { class: 'moments__card-image-wrap' }, [
          dom.el('img', {
            class: 'moments__card-image',
            src: photo ? photo.thumb : 'assets/img/placeholders/photo-placeholder-1.svg',
            alt: photo ? (photo.alt || '') : '',
            loading: 'lazy'
          })
        ]),
        dom.el('p', { class: 'moments__card-date' }, [format.formatDate(event.date)]),
        dom.el('h3', { class: 'moments__card-title' }, [event.title])
      ]);
    }

    function render() {
      dom.clear(container);
      var carousel = App.utils.carousel.build(events.map(renderCard), { label: 'Momentos marcantes' });
      var section = dom.el('section', { class: 'moments', id: 'home-moments', 'aria-label': 'Momentos' }, [
        dom.el('h2', { class: 'section-title' }, ['Momentos']),
        carousel.wrapper
      ]);
      container.appendChild(section);
    }

    function destroy() { dom.clear(container); }
    return { render: render, destroy: destroy };
  }

  App.components = App.components || {};
  App.components.Moments = Moments;
})(window.WeddingApp = window.WeddingApp || {});
