/*
  CategoryFilter — filtro de categorias da galeria de fotos (categories.json).
  Escreve a categoria ativa no store; Gallery.js reage a essa mudança.
*/
(function (App) {
  'use strict';
  var dom = App.utils.dom;
  var store = App.core.store;

  function CategoryFilter(container, ctx) {
    var categories = ctx.data.categories || [];

    function setActive(id) {
      store.setState({ activeCategory: id });
      render();
    }

    function render() {
      dom.clear(container);
      var active = store.getState().activeCategory;

      var allChip = dom.el('button', {
        class: 'chip' + (active === 'all' ? ' is-active' : ''),
        type: 'button',
        'aria-pressed': active === 'all' ? 'true' : 'false',
        onClick: function () { setActive('all'); }
      }, ['Todas']);

      var chips = categories.map(function (cat) {
        return dom.el('button', {
          class: 'chip' + (active === cat.id ? ' is-active' : ''),
          type: 'button',
          'aria-pressed': active === cat.id ? 'true' : 'false',
          onClick: function () { setActive(cat.id); }
        }, [cat.label]);
      });

      var wrap = dom.el('div', { class: 'category-filter', role: 'group', 'aria-label': 'Categorias de fotos' }, [allChip].concat(chips));
      container.appendChild(wrap);
    }

    function destroy() { dom.clear(container); }
    return { render: render, destroy: destroy };
  }

  App.components = App.components || {};
  App.components.CategoryFilter = CategoryFilter;
})(window.WeddingApp = window.WeddingApp || {});
