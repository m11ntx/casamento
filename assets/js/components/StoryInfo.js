/*
  StoryInfo — barra compacta de informações da história (estilo linha de
  metadados de plataforma de streaming: ano, classificação, gêneros...),
  a partir de couple.json e synopsis.json.
*/
(function (App) {
  'use strict';
  var dom = App.utils.dom;
  var format = App.utils.format;

  function StoryInfo(container, ctx) {
    var couple = ctx.data.couple || {};
    var synopsis = ctx.data.synopsis || {};

    function statBlock(label, value) {
      if (!value) return null;
      return dom.el('div', { class: 'story-info__stat' }, [
        dom.el('span', { class: 'story-info__stat-value' }, [value]),
        dom.el('span', { class: 'story-info__stat-label' }, [label])
      ]);
    }

    function render() {
      dom.clear(container);
      var startLabel = couple.relationshipStartDate ? format.formatDate(couple.relationshipStartDate) : null;
      var weddingLabel = couple.weddingDate ? format.formatDate(couple.weddingDate) : null;
      var genresLabel = (synopsis.genres || []).join(', ') || null;

      var stats = [
        statBlock('Início da história', startLabel),
        statBlock('Casamento', weddingLabel),
        statBlock('Classificação', synopsis.rating),
        statBlock('Gêneros', genresLabel)
      ].filter(Boolean);

      var section = dom.el('section', { class: 'story-info', id: 'home-story-info', 'aria-label': 'Informações da história' }, [
        dom.el('div', { class: 'story-info__stats' }, stats)
      ]);
      container.appendChild(section);
    }

    function destroy() { dom.clear(container); }
    return { render: render, destroy: destroy };
  }

  App.components = App.components || {};
  App.components.StoryInfo = StoryInfo;
})(window.WeddingApp = window.WeddingApp || {});
