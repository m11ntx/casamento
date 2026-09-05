/*
  PeopleSection — pessoas importantes (padrinhos, madrinhas, família), a partir
  de people.json.
*/
(function (App) {
  'use strict';
  var dom = App.utils.dom;

  function PeopleSection(container, ctx) {
    var people = ctx.data.people || [];

    function renderCard(person) {
      return dom.el('div', { class: 'people__card' }, [
        dom.el('img', {
          class: 'people__photo',
          src: person.photo || 'assets/img/placeholders/avatar-placeholder.svg',
          alt: person.name,
          loading: 'lazy'
        }),
        dom.el('h3', { class: 'people__name' }, [person.name]),
        dom.el('p', { class: 'people__role' }, [person.role || '']),
        person.message ? dom.el('p', { class: 'people__message' }, ['"' + person.message + '"']) : null
      ]);
    }

    function render() {
      dom.clear(container);
      var section = dom.el('section', { class: 'people', 'aria-label': 'Pessoas importantes' }, [
        dom.el('h2', { class: 'section-title' }, ['Elenco de Apoio']),
        dom.el('div', { class: 'people__grid' }, people.map(renderCard))
      ]);
      container.appendChild(section);
    }

    function destroy() { dom.clear(container); }
    return { render: render, destroy: destroy };
  }

  App.components = App.components || {};
  App.components.PeopleSection = PeopleSection;
})(window.WeddingApp = window.WeddingApp || {});
