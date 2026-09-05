/*
  Synopsis — texto completo da sinopse + "elenco" (o casal), vindos de
  synopsis.json e couple.json.
*/
(function (App) {
  'use strict';
  var dom = App.utils.dom;

  function Synopsis(container, ctx) {
    var couple = ctx.data.couple;
    var synopsis = ctx.data.synopsis;

    function castCard(person) {
      return dom.el('div', { class: 'synopsis__cast-card' }, [
        dom.el('h3', {}, [person.name]),
        dom.el('p', { class: 'synopsis__cast-role' }, [person.role || '']),
        person.bio ? dom.el('p', { class: 'synopsis__cast-bio' }, [person.bio]) : null
      ]);
    }

    function render() {
      dom.clear(container);
      var el = dom.el('section', { class: 'synopsis', 'aria-label': 'Sinopse' }, [
        dom.el('h2', { class: 'section-title' }, ['Sinopse']),
        dom.el('p', { class: 'synopsis__text' }, [synopsis.synopsis || '']),
        dom.el('div', { class: 'synopsis__cast' }, [
          castCard(couple.partner1),
          castCard(couple.partner2)
        ])
      ]);
      container.appendChild(el);
    }

    function destroy() { dom.clear(container); }
    return { render: render, destroy: destroy };
  }

  App.components = App.components || {};
  App.components.Synopsis = Synopsis;
})(window.WeddingApp = window.WeddingApp || {});
