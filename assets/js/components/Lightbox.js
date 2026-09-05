/*
  Lightbox — experiência imersiva de foto/vídeo em destaque: fundo escuro,
  mídia centralizada, contador, título, descrição, data. Navegação por
  botões anterior/próxima, teclado (← →, Esc) e swipe (toque, mobile).
  Controlado via store.currentPhotoId — overlay persistente montado uma
  única vez em main.js, não uma rota.

  Navegação por álbum: se store.activeCategory estiver definida (não "all"),
  anterior/próxima e o contador ficam restritos às fotos daquela categoria —
  é assim que os cards de álbum da Galeria abrem "as fotos relacionadas" e
  cicla só entre elas, em vez de misturar com as 1200+ fotos de outros álbuns.

  "Ver todas as fotos": quando há mais de uma foto no álbum, um botão abre
  AlbumGrid.js — uma grade com todas as miniaturas do álbum, por cima deste
  Lightbox — para escolher qualquer foto diretamente, em vez de só avançar
  uma de cada vez (importante em álbuns com centenas de fotos).
*/
(function (App) {
  'use strict';
  var dom = App.utils.dom;
  var store = App.core.store;
  var a11y = App.core.a11y;
  var format = App.utils.format;

  var SWIPE_THRESHOLD_PX = 40;

  function Lightbox(container, ctx) {
    var allPhotos = ctx.data.gallery || [];
    var releaseFocusTrap = null;
    var lastActiveElement = null;
    var currentId = null;
    var touchStartX = null;

    function getScopedPhotos() {
      var category = store.getState().activeCategory;
      if (!category || category === 'all') return allPhotos;
      var scoped = allPhotos.filter(function (p) { return (p.categoryIds || []).indexOf(category) !== -1; });
      return scoped.length ? scoped : allPhotos;
    }

    function findIndex(id, photos) {
      return photos.findIndex(function (p) { return p.id === id; });
    }

    function close() { store.setState({ currentPhotoId: null }); }

    function showNext(step) {
      var photos = getScopedPhotos();
      var idx = findIndex(currentId, photos);
      if (idx === -1 || !photos.length) return;
      var nextIdx = (idx + step + photos.length) % photos.length;
      store.setState({ currentPhotoId: photos[nextIdx].id });
    }

    function onKeydown(e) {
      if (e.key === 'Escape') close();
      else if (e.key === 'ArrowRight') showNext(1);
      else if (e.key === 'ArrowLeft') showNext(-1);
    }

    function onTouchStart(e) {
      touchStartX = e.changedTouches[0].clientX;
    }

    function onTouchEnd(e) {
      if (touchStartX === null) return;
      var deltaX = e.changedTouches[0].clientX - touchStartX;
      touchStartX = null;
      if (deltaX > SWIPE_THRESHOLD_PX) showNext(-1);
      else if (deltaX < -SWIPE_THRESHOLD_PX) showNext(1);
    }

    function renderMedia(photo) {
      if (photo.type === 'video') {
        var errorNotice = dom.el('p', { class: 'lightbox__media-error is-hidden' }, [
          'Vídeo indisponível no momento (arquivo ainda não adicionado em assets/video/clips/).'
        ]);
        var video = dom.el('video', {
          class: 'lightbox__media lightbox__video',
          controls: true,
          poster: photo.thumb || '',
          preload: 'none',
          onError: function () { errorNotice.classList.remove('is-hidden'); }
        }, [
          dom.el('source', { src: photo.video || '', type: 'video/mp4' })
        ]);
        return dom.el('div', { class: 'lightbox__media-wrap' }, [video, errorNotice]);
      }
      return dom.el('img', { class: 'lightbox__media lightbox__image', src: photo.full, alt: photo.alt || '' });
    }

    function renderOpen() {
      dom.clear(container);
      var photos = getScopedPhotos();
      var photo = photos.find(function (p) { return p.id === currentId; }) ||
        allPhotos.find(function (p) { return p.id === currentId; });
      if (!photo) return;
      var index = findIndex(currentId, photos);
      var isVideo = photo.type === 'video';

      var dialog = dom.el('div', {
        class: 'lightbox',
        role: 'dialog',
        'aria-modal': 'true',
        'aria-label': photo.title || photo.alt || (isVideo ? 'Vídeo ampliado' : 'Foto ampliada')
      }, [
        dom.el('div', { class: 'lightbox__backdrop', onClick: close }),
        dom.el('div', { class: 'lightbox__panel' }, [
          dom.el('button', { class: 'lightbox__close', type: 'button', 'aria-label': 'Fechar', onClick: close }, ['✕']),
          dom.el('div', { class: 'lightbox__stage' }, [
            dom.el('button', { class: 'lightbox__nav lightbox__nav--prev', type: 'button', 'aria-label': 'Item anterior', onClick: function () { showNext(-1); } }, ['‹']),
            renderMedia(photo),
            dom.el('button', { class: 'lightbox__nav lightbox__nav--next', type: 'button', 'aria-label': 'Próximo item', onClick: function () { showNext(1); } }, ['›'])
          ]),
          dom.el('div', { class: 'lightbox__info' }, [
            dom.el('p', { class: 'lightbox__counter' }, [(index + 1) + ' de ' + photos.length]),
            photo.title ? dom.el('h2', { class: 'lightbox__title' }, [photo.title]) : null,
            photo.description ? dom.el('p', { class: 'lightbox__description' }, [photo.description]) : null,
            photo.date ? dom.el('p', { class: 'lightbox__date' }, [format.formatDate(photo.date)]) : null,
            photos.length > 1 ? dom.el('button', {
              class: 'lightbox__view-all',
              type: 'button',
              onClick: function () { store.setState({ albumGridOpen: true }); }
            }, ['▦ Ver todas (' + photos.length + ')']) : null
          ])
        ])
      ]);

      container.appendChild(dialog);
      container.classList.remove('is-hidden');
      document.addEventListener('keydown', onKeydown);
      releaseFocusTrap = a11y.trapFocus(dialog);
      a11y.announce(
        (isVideo ? 'Vídeo ' : 'Foto ') + (index + 1) + ' de ' + photos.length + ': ' + (photo.title || photo.alt || '')
      );
    }

    function renderClosed() {
      if (releaseFocusTrap) { releaseFocusTrap(); releaseFocusTrap = null; }
      document.removeEventListener('keydown', onKeydown);
      dom.clear(container);
      container.classList.add('is-hidden');
      a11y.unlockBackground();
      if (lastActiveElement && lastActiveElement.focus) lastActiveElement.focus();
    }

    function onStoreChange(state) {
      var id = state.currentPhotoId;
      if (id) {
        if (!currentId) {
          lastActiveElement = document.activeElement;
          a11y.lockBackground();
        }
        currentId = id;
        renderOpen();
      } else if (currentId) {
        currentId = null;
        renderClosed();
      }
    }

    var unsubscribe = store.subscribe(onStoreChange);
    container.classList.add('is-hidden');
    container.addEventListener('touchstart', onTouchStart, { passive: true });
    container.addEventListener('touchend', onTouchEnd, { passive: true });

    function destroy() {
      unsubscribe();
      document.removeEventListener('keydown', onKeydown);
      container.removeEventListener('touchstart', onTouchStart);
      container.removeEventListener('touchend', onTouchEnd);
    }

    return { destroy: destroy };
  }

  App.components = App.components || {};
  App.components.Lightbox = Lightbox;
})(window.WeddingApp = window.WeddingApp || {});
