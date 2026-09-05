/*
  Gallery — um card por álbum/categoria (capa + nome + quantidade de fotos).
  Ao clicar num card, define store.activeCategory (para o Lightbox restringir
  anterior/próxima àquele álbum) e abre o Lightbox direto na primeira foto —
  o próprio Lightbox mostra uma fita de miniaturas sempre visível embaixo
  (ver Lightbox.js), então dá pra ver o que existe e pular pra qualquer uma
  sem precisar de uma grade separada.
*/
(function (App) {
  'use strict';
  var dom = App.utils.dom;
  var store = App.core.store;

  function Gallery(container, ctx) {
    var photos = ctx.data.gallery || [];
    var categories = ctx.data.categories || [];

    function photosOf(categoryId) {
      return photos.filter(function (p) { return (p.categoryIds || []).indexOf(categoryId) !== -1; });
    }

    function countOf(categoryId) {
      return photosOf(categoryId).length;
    }

    function openAlbum(category) {
      var first = photosOf(category.id)[0];
      if (!first) return;
      store.setState({ activeCategory: category.id, currentPhotoId: first.id });
    }

    function renderCard(category) {
      var count = countOf(category.id);
      return dom.el('button', {
        class: 'album-card',
        type: 'button',
        'aria-label': 'Abrir álbum: ' + category.label + ' (' + count + ' fotos)',
        onClick: function () { openAlbum(category); }
      }, [
        dom.el('div', { class: 'album-card__cover-wrap' }, [
          dom.el('img', {
            class: 'album-card__cover',
            src: 'assets/img/photos/covers/' + category.id + '.jpg',
            alt: '',
            loading: 'lazy'
          }),
          dom.el('span', { class: 'album-card__count' }, [count + ' fotos'])
        ]),
        dom.el('h3', { class: 'album-card__title' }, [category.label])
      ]);
    }

    function render() {
      dom.clear(container);
      var body = categories.length
        ? App.utils.carousel.build(categories.map(renderCard), { label: 'Álbuns de fotos' }).wrapper
        : dom.el('p', { class: 'gallery__empty' }, ['Nenhum álbum cadastrado ainda.']);

      var section = dom.el('section', { class: 'gallery', id: 'home-gallery', 'aria-label': 'Galeria de fotos' }, [
        dom.el('h2', { class: 'section-title' }, ['Galeria']),
        body
      ]);
      container.appendChild(section);
    }

    function destroy() { dom.clear(container); }

    return { render: render, destroy: destroy };
  }

  App.components = App.components || {};
  App.components.Gallery = Gallery;
})(window.WeddingApp = window.WeddingApp || {});
