/*
  AlbumGrid — grade com todas as fotos/vídeos de um álbum (contact sheet),
  aberta a partir do botão "Ver todas as fotos" dentro do Lightbox (útil para
  álbuns com centenas de fotos, ex.: Casamento, 950 itens — em vez de só
  clicar em "próxima" repetidas vezes, dá pra ver tudo e pular direto para
  qualquer uma). Escolher uma foto na grade fecha a grade e mostra essa foto
  no Lightbox, que continua aberto por baixo o tempo todo.

  Controlado via store.albumGridOpen + store.activeCategory. Performance para
  centenas de itens: renderiza em lotes (BATCH_SIZE), carregando o próximo
  lote só quando o usuário rola perto do fim (mesma técnica de
  IntersectionObserver usada em Gallery.js/Lightbox.js).
*/
(function (App) {
  'use strict';
  var dom = App.utils.dom;
  var store = App.core.store;
  var a11y = App.core.a11y;
  var imageLoader = App.utils.imageLoader;

  var BATCH_SIZE = 60;

  function AlbumGrid(container, ctx) {
    var allPhotos = ctx.data.gallery || [];
    var categories = ctx.data.categories || [];
    var releaseFocusTrap = null;
    var lastActiveElement = null;
    var currentCategory = null;
    var sentinelObserver = null;

    function close() { store.setState({ albumGridOpen: false }); }

    function onKeydown(e) { if (e.key === 'Escape') close(); }

    function categoryLabel(id) {
      var cat = categories.find(function (c) { return c.id === id; });
      return cat ? cat.label : id;
    }

    function photosOf(categoryId) {
      return allPhotos.filter(function (p) { return (p.categoryIds || []).indexOf(categoryId) !== -1; });
    }

    function renderThumb(photo) {
      var isVideo = photo.type === 'video';
      return dom.el('button', {
        class: 'album-grid__thumb',
        type: 'button',
        'aria-label': (isVideo ? 'Reproduzir vídeo: ' : 'Ver foto: ') + (photo.title || photo.alt || ''),
        onClick: function () { store.setState({ currentPhotoId: photo.id, albumGridOpen: false }); }
      }, [
        dom.el('img', { class: 'album-grid__thumb-img', 'data-src': photo.thumb, alt: photo.alt || '', loading: 'lazy' }),
        isVideo ? dom.el('span', { class: 'album-grid__play-badge', 'aria-hidden': 'true' }, ['▶']) : null
      ]);
    }

    function renderOpen() {
      dom.clear(container);
      if (sentinelObserver) { sentinelObserver.disconnect(); sentinelObserver = null; }

      var photos = photosOf(currentCategory);
      var renderedCount = 0;

      var grid = dom.el('div', { class: 'album-grid__grid', role: 'list' });
      var sentinel = dom.el('div', { class: 'album-grid__sentinel', 'aria-hidden': 'true' });
      grid.appendChild(sentinel);

      function appendBatch() {
        var next = photos.slice(renderedCount, renderedCount + BATCH_SIZE);
        next.forEach(function (p) { grid.insertBefore(renderThumb(p), sentinel); });
        renderedCount += next.length;
        imageLoader.observeAll(grid);
        if (renderedCount >= photos.length && sentinelObserver) {
          sentinelObserver.disconnect();
          sentinelObserver = null;
        }
      }

      appendBatch();

      var dialog = dom.el('div', {
        class: 'album-grid',
        role: 'dialog',
        'aria-modal': 'true',
        'aria-label': categoryLabel(currentCategory)
      }, [
        dom.el('div', { class: 'album-grid__backdrop', onClick: close }),
        dom.el('div', { class: 'album-grid__panel' }, [
          dom.el('div', { class: 'album-grid__header' }, [
            dom.el('div', {}, [
              dom.el('h2', { class: 'album-grid__title' }, [categoryLabel(currentCategory)]),
              dom.el('p', { class: 'album-grid__count' }, [photos.length + (photos.length === 1 ? ' item' : ' itens')])
            ]),
            dom.el('button', { class: 'album-grid__close', type: 'button', 'aria-label': 'Fechar', onClick: close }, ['✕'])
          ]),
          grid
        ])
      ]);

      container.appendChild(dialog);
      container.classList.remove('is-hidden');
      document.addEventListener('keydown', onKeydown);
      releaseFocusTrap = a11y.trapFocus(dialog);

      if (renderedCount < photos.length) {
        if ('IntersectionObserver' in window) {
          sentinelObserver = new IntersectionObserver(function (entries) {
            if (entries[0].isIntersecting) appendBatch();
          }, { root: grid, rootMargin: '400px 0px' });
          sentinelObserver.observe(sentinel);
        } else {
          while (renderedCount < photos.length) appendBatch();
        }
      }
    }

    function renderClosed() {
      if (sentinelObserver) { sentinelObserver.disconnect(); sentinelObserver = null; }
      if (releaseFocusTrap) { releaseFocusTrap(); releaseFocusTrap = null; }
      document.removeEventListener('keydown', onKeydown);
      dom.clear(container);
      container.classList.add('is-hidden');
      a11y.unlockBackground();
      if (lastActiveElement && lastActiveElement.focus) lastActiveElement.focus();
    }

    function onStoreChange(state) {
      if (state.albumGridOpen && state.activeCategory) {
        var isNewOpen = !currentCategory;
        var isDifferentAlbum = currentCategory && currentCategory !== state.activeCategory;
        if (isNewOpen) {
          lastActiveElement = document.activeElement;
          a11y.lockBackground();
        }
        if (isNewOpen || isDifferentAlbum) {
          currentCategory = state.activeCategory;
          renderOpen();
        }
      } else if (currentCategory) {
        currentCategory = null;
        renderClosed();
      }
    }

    var unsubscribe = store.subscribe(onStoreChange);
    container.classList.add('is-hidden');

    function destroy() {
      unsubscribe();
      if (sentinelObserver) sentinelObserver.disconnect();
      document.removeEventListener('keydown', onKeydown);
    }

    return { destroy: destroy };
  }

  App.components = App.components || {};
  App.components.AlbumGrid = AlbumGrid;
})(window.WeddingApp = window.WeddingApp || {});
