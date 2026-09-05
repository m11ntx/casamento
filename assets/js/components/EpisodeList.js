/*
  EpisodeList — carrossel horizontal dos capítulos da história (episodes.json).
  Ao clicar em um card, define store.activeEpisodeId (EpisodeDetail.js reage a isso).
*/
(function (App) {
  'use strict';
  var dom = App.utils.dom;
  var store = App.core.store;
  var format = App.utils.format;

  function EpisodeList(container, ctx) {
    var episodes = (ctx.data.episodes || []).slice().sort(function (a, b) { return (a.order || 0) - (b.order || 0); });

    function renderCard(ep, index) {
      return dom.el('button', {
        class: 'episode-card',
        type: 'button',
        onClick: function () { store.setState({ activeEpisodeId: ep.id }); }
      }, [
        dom.el('div', { class: 'episode-card__cover-wrap' }, [
          dom.el('img', { class: 'episode-card__cover', src: ep.cover, alt: '', loading: 'lazy' }),
          dom.el('span', { class: 'episode-card__index' }, ['EP ' + (index + 1)]),
          ep.video ? dom.el('span', { class: 'episode-card__play-badge', 'aria-hidden': 'true' }, ['▶']) : null
        ]),
        dom.el('h3', { class: 'episode-card__title' }, [ep.title]),
        dom.el('p', { class: 'episode-card__date' }, [format.formatDate(ep.date)]),
        dom.el('p', { class: 'episode-card__subtitle' }, [ep.subtitle || ''])
      ]);
    }

    function render() {
      dom.clear(container);
      var carousel = App.utils.carousel.build(episodes.map(renderCard), { label: 'Episódios' });
      var section = dom.el('section', { class: 'episode-list', id: 'home-episodes', 'aria-label': 'Episódios da nossa história' }, [
        dom.el('h2', { class: 'section-title' }, ['Episódios']),
        carousel.wrapper
      ]);
      container.appendChild(section);
    }

    function destroy() { dom.clear(container); }
    return { render: render, destroy: destroy };
  }

  App.components = App.components || {};
  App.components.EpisodeList = EpisodeList;
})(window.WeddingApp = window.WeddingApp || {});
