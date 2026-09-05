/*
  EpisodeDetail — visão detalhada de um episódio/capítulo, em overlay modal.
  Quando o episódio tem um vídeo (ep.video), toca o vídeo de verdade
  (<video controls>, com o cover como pôster) em vez de só mostrar a capa
  estática; se o arquivo não existir ou o formato não for suportado pelo
  navegador (ex.: .mpg — sem suporte nativo em nenhum navegador atual),
  mostra um aviso amigável em vez de falhar silenciosamente.
  Controlado via store.activeEpisodeId, montado uma única vez em main.js.
*/
(function (App) {
  'use strict';
  var dom = App.utils.dom;
  var store = App.core.store;
  var a11y = App.core.a11y;
  var format = App.utils.format;

  function EpisodeDetail(container, ctx) {
    var episodes = ctx.data.episodes || [];
    var releaseFocusTrap = null;
    var lastActiveElement = null;
    var currentId = null;

    function close() { store.setState({ activeEpisodeId: null }); }

    function onKeydown(e) { if (e.key === 'Escape') close(); }

    function renderMedia(ep) {
      if (!ep.video) {
        return dom.el('img', { class: 'episode-detail__cover', src: ep.cover, alt: '' });
      }
      var errorNotice = dom.el('p', { class: 'episode-detail__media-error is-hidden' }, [
        'Vídeo indisponível neste navegador (formato não suportado ou arquivo ainda não adicionado).'
      ]);
      var video = dom.el('video', {
        class: 'episode-detail__cover episode-detail__video',
        controls: true,
        poster: ep.cover || '',
        preload: 'none',
        onError: function () { errorNotice.classList.remove('is-hidden'); }
      }, [
        dom.el('source', { src: ep.video, type: 'video/mp4' })
      ]);
      return dom.el('div', { class: 'episode-detail__media-wrap' }, [video, errorNotice]);
    }

    function renderOpen() {
      var ep = episodes.find(function (e) { return e.id === currentId; });
      dom.clear(container);
      if (!ep) return;

      var dialog = dom.el('div', { class: 'episode-detail', role: 'dialog', 'aria-modal': 'true', 'aria-label': ep.title }, [
        dom.el('div', { class: 'episode-detail__backdrop', onClick: close }),
        dom.el('div', { class: 'episode-detail__panel' }, [
          dom.el('button', { class: 'episode-detail__close', type: 'button', 'aria-label': 'Fechar', onClick: close }, ['✕']),
          renderMedia(ep),
          dom.el('h2', { class: 'episode-detail__title' }, [ep.title]),
          dom.el('p', { class: 'episode-detail__date' }, [format.formatDate(ep.date)]),
          dom.el('p', { class: 'episode-detail__synopsis' }, [ep.synopsis || ''])
        ])
      ]);

      container.appendChild(dialog);
      container.classList.remove('is-hidden');
      document.addEventListener('keydown', onKeydown);
      releaseFocusTrap = a11y.trapFocus(dialog);
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
      var id = state.activeEpisodeId;
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

    function destroy() {
      unsubscribe();
      document.removeEventListener('keydown', onKeydown);
    }

    return { destroy: destroy };
  }

  App.components = App.components || {};
  App.components.EpisodeDetail = EpisodeDetail;
})(window.WeddingApp = window.WeddingApp || {});
