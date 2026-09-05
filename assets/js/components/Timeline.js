/*
  Timeline — linha do tempo dos marcos do relacionamento (timeline.json).
  Cada evento pode referenciar uma foto da galeria via photoId.
*/
(function (App) {
  'use strict';
  var dom = App.utils.dom;
  var format = App.utils.format;

  function Timeline(container, ctx) {
    var events = (ctx.data.timeline || []).slice().sort(function (a, b) { return new Date(a.date) - new Date(b.date); });
    var gallery = ctx.data.gallery || [];

    function renderPhoto(photoId) {
      var photo = gallery.find(function (p) { return p.id === photoId; });
      if (!photo) return null;
      return dom.el('img', { class: 'timeline__photo', src: photo.thumb, alt: photo.alt || '', loading: 'lazy' });
    }

    function renderItem(event) {
      return dom.el('li', { class: 'timeline__item' }, [
        dom.el('div', { class: 'timeline__marker' }),
        dom.el('div', { class: 'timeline__content' }, [
          dom.el('p', { class: 'timeline__date' }, [format.formatDate(event.date)]),
          dom.el('h3', { class: 'timeline__title' }, [event.title]),
          event.description ? dom.el('p', { class: 'timeline__description' }, [event.description]) : null,
          event.photoId ? renderPhoto(event.photoId) : null
        ])
      ]);
    }

    function render() {
      dom.clear(container);
      var section = dom.el('section', { class: 'timeline', id: 'home-timeline', 'aria-label': 'Linha do tempo' }, [
        dom.el('h2', { class: 'section-title' }, ['Linha do Tempo']),
        dom.el('ol', { class: 'timeline__list' }, events.map(renderItem))
      ]);
      container.appendChild(section);
    }

    function destroy() { dom.clear(container); }
    return { render: render, destroy: destroy };
  }

  App.components = App.components || {};
  App.components.Timeline = Timeline;
})(window.WeddingApp = window.WeddingApp || {});
