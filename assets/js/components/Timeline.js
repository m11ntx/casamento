/*
  Timeline — linha do tempo dos marcos do relacionamento (data/timeline.json:
  namoro, casamento, nascimento da Giovana). O último marco é sempre "Hoje",
  calculado em tempo real (não vem do JSON) a partir de couple.weddingDate,
  para a linha do tempo sempre terminar "até os dias de hoje" sem precisar
  editar nada manualmente com o passar dos anos.
*/
(function (App) {
  'use strict';
  var dom = App.utils.dom;
  var format = App.utils.format;

  function Timeline(container, ctx) {
    var events = (ctx.data.timeline || []).slice().sort(function (a, b) { return new Date(a.date) - new Date(b.date); });
    var gallery = ctx.data.gallery || [];
    var couple = ctx.data.couple || {};

    function renderPhoto(photoId) {
      var photo = gallery.find(function (p) { return p.id === photoId; });
      if (!photo) return null;
      return dom.el('img', { class: 'timeline__photo', src: photo.thumb, alt: photo.alt || '', loading: 'lazy' });
    }

    // Alguns marcos referenciam uma foto direta (event.photo, ex.: a capa do
    // casamento) em vez de um photoId da galeria — útil quando a melhor foto
    // pro marco é uma capa/curadoria específica, não uma foto qualquer do
    // álbum.
    function renderEventPhoto(event) {
      if (event.photo) return dom.el('img', { class: 'timeline__photo', src: event.photo, alt: '', loading: 'lazy' });
      if (event.photoId) return renderPhoto(event.photoId);
      return null;
    }

    function renderItem(event) {
      var year = format.formatDate(event.date, { year: 'numeric' });
      return dom.el('li', { class: 'timeline__item' }, [
        dom.el('div', { class: 'timeline__marker' }, [dom.el('span', { class: 'timeline__marker-year' }, [year])]),
        dom.el('div', { class: 'timeline__content' }, [
          renderEventPhoto(event),
          dom.el('div', { class: 'timeline__text' }, [
            dom.el('p', { class: 'timeline__date' }, [format.formatDate(event.date)]),
            dom.el('h3', { class: 'timeline__title' }, [event.title]),
            event.description ? dom.el('p', { class: 'timeline__description' }, [event.description]) : null
          ])
        ])
      ]);
    }

    function renderTodayItem() {
      var weddingDate = couple.weddingDate;
      var description = '';
      if (weddingDate) {
        var diff = format.diffParts(weddingDate, new Date());
        // Arredonda para o ano completo mais próximo (em vez de "X anos e Y
        // meses") — nos dias ao redor de um aniversário de casamento, já é
        // assim que se conta ("12 anos"), não "11 anos e 11 meses".
        var totalYears = Math.round(diff.totalDays / 365.25);
        description = totalYears > 0
          ? totalYears + (totalYears === 1 ? ' ano' : ' anos') + ' depois de tudo isso, a história continua.'
          : 'A história continua.';
      }
      return dom.el('li', { class: 'timeline__item timeline__item--today' }, [
        dom.el('div', { class: 'timeline__marker timeline__marker--today' }),
        dom.el('div', { class: 'timeline__content' }, [
          dom.el('div', { class: 'timeline__text' }, [
            dom.el('p', { class: 'timeline__date' }, ['Hoje']),
            dom.el('h3', { class: 'timeline__title' }, ['E a história continua...']),
            description ? dom.el('p', { class: 'timeline__description' }, [description]) : null
          ])
        ])
      ]);
    }

    function render() {
      dom.clear(container);
      var items = events.map(renderItem).concat([renderTodayItem()]);
      var section = dom.el('section', { class: 'timeline', id: 'home-timeline', 'aria-label': 'Linha do tempo' }, [
        dom.el('h2', { class: 'section-title' }, ['Linha do Tempo']),
        dom.el('ol', { class: 'timeline__list' }, items)
      ]);
      container.appendChild(section);
    }

    function destroy() { dom.clear(container); }
    return { render: render, destroy: destroy };
  }

  App.components = App.components || {};
  App.components.Timeline = Timeline;
})(window.WeddingApp = window.WeddingApp || {});
