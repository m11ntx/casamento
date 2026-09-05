/*
  SoundtrackAlbumDetail — modal com todas as faixas de um álbum/pasta da
  trilha sonora, aberto ao clicar num card em SoundtrackList.js. Controlado
  via store.activeAlbum. Cada linha aciona core/musicPlayer.js diretamente
  (clique do usuário, respeita a política de autoplay).
*/
(function (App) {
  'use strict';
  var dom = App.utils.dom;
  var store = App.core.store;
  var a11y = App.core.a11y;
  var player = App.core.musicPlayer;

  function groupByAlbum(tracks) {
    var byAlbum = {};
    tracks.forEach(function (track) {
      var album = track.album || 'Trilha Sonora';
      (byAlbum[album] = byAlbum[album] || []).push(track);
    });
    return byAlbum;
  }

  function SoundtrackAlbumDetail(container, ctx) {
    var groups = groupByAlbum((ctx.data.soundtrack || []));
    var releaseFocusTrap = null;
    var lastActiveElement = null;
    var currentAlbum = null;
    var unsubscribeStorePlay = null;

    function close() { store.setState({ activeAlbum: null }); }

    function onKeydown(e) { if (e.key === 'Escape') close(); }

    function renderTrackRow(track) {
      var state = store.getState();
      var isActive = state.currentTrackId === track.id;
      var isPlaying = isActive && state.isPlaying;

      return dom.el('li', {
        class: 'album-detail__track' + (isActive ? ' is-active' : '')
      }, [
        dom.el('button', {
          class: 'album-detail__track-btn',
          type: 'button',
          'aria-label': (isPlaying ? 'Pausar ' : 'Reproduzir ') + track.title,
          onClick: function () { player.playTrackById(track.id); }
        }, [
          dom.el('span', { class: 'album-detail__track-icon', 'aria-hidden': 'true' }, [isPlaying ? '❚❚' : '▶']),
          dom.el('span', { class: 'album-detail__track-info' }, [
            dom.el('span', { class: 'album-detail__track-title' }, [track.title]),
            dom.el('span', { class: 'album-detail__track-artist' }, [track.artist || ''])
          ])
        ])
      ]);
    }

    function renderOpen() {
      dom.clear(container);
      var tracks = groups[currentAlbum];
      if (!tracks) return;
      var cover = tracks.reduce(function (found, t) { return found || t.cover; }, null);
      // Se todas as faixas forem do mesmo artista, mostra o nome dele; senão
      // (ex.: "Diversas", uma compilação), mostra "Vários artistas" — evita
      // sugerir que um artista específico (o que por acaso toca primeiro) é
      // o autor do álbum inteiro.
      var sameArtist = tracks.every(function (t) { return t.artist === tracks[0].artist; });
      var artistLabel = sameArtist ? tracks[0].artist : 'Vários artistas';

      var dialog = dom.el('div', { class: 'album-detail', role: 'dialog', 'aria-modal': 'true', 'aria-label': currentAlbum }, [
        dom.el('div', { class: 'album-detail__backdrop', onClick: close }),
        dom.el('div', { class: 'album-detail__panel' }, [
          dom.el('button', { class: 'album-detail__close', type: 'button', 'aria-label': 'Fechar', onClick: close }, ['✕']),
          dom.el('div', { class: 'album-detail__header' }, [
            dom.el('img', {
              class: 'album-detail__cover',
              src: cover || 'assets/img/placeholders/music-cover-placeholder.svg',
              alt: ''
            }),
            dom.el('div', {}, [
              dom.el('h2', { class: 'album-detail__title' }, [currentAlbum]),
              dom.el('p', { class: 'album-detail__meta' }, [artistLabel + ' • ' + tracks.length + ' faixas'])
            ])
          ]),
          dom.el('ol', { class: 'album-detail__track-list' }, tracks.map(renderTrackRow))
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
      var album = state.activeAlbum;
      if (album) {
        if (!currentAlbum) {
          lastActiveElement = document.activeElement;
          a11y.lockBackground();
        }
        currentAlbum = album;
        renderOpen();
      } else if (currentAlbum) {
        currentAlbum = null;
        renderClosed();
      }
    }

    var unsubscribe = store.subscribe(onStoreChange);
    // Reage também a mudanças de faixa/estado de reprodução, para destacar a
    // faixa ativa em tempo real enquanto o modal está aberto.
    unsubscribeStorePlay = App.core.eventBus.on('player:stateChanged', function () {
      if (currentAlbum) renderOpen();
    });
    var offTrackChanged = App.core.eventBus.on('player:trackChanged', function () {
      if (currentAlbum) renderOpen();
    });

    container.classList.add('is-hidden');

    function destroy() {
      unsubscribe();
      if (unsubscribeStorePlay) unsubscribeStorePlay();
      if (offTrackChanged) offTrackChanged();
      document.removeEventListener('keydown', onKeydown);
    }

    return { destroy: destroy };
  }

  App.components = App.components || {};
  App.components.SoundtrackAlbumDetail = SoundtrackAlbumDetail;
})(window.WeddingApp = window.WeddingApp || {});
