/*
  GlobalPlayer — barra de player fixa no rodapé, persistente em toda a
  aplicação (montada uma única vez em main.js, como Lightbox/EpisodeDetail).
  Toda a lógica de áudio vive em core/musicPlayer.js; este componente só
  desenha a interface e reage aos eventos do motor.

  Recursos: play/pause, próxima, anterior, volume, progresso (arrastável),
  tempo atual/duração, indicação da música atual (capa, título, artista).

  Autoplay: nenhuma chamada a play() acontece aqui automaticamente — todos os
  botões desta barra exigem um clique do usuário, que é exatamente o gesto
  que os navegadores exigem para permitir a reprodução.
*/
(function (App) {
  'use strict';
  var dom = App.utils.dom;
  var format = App.utils.format;
  var player = App.core.musicPlayer;
  var eventBus = App.core.eventBus;

  function GlobalPlayer(container, ctx) {
    player.init(ctx.data.soundtrack || []);

    var offTrackChanged = null;
    var offStateChanged = null;
    var offTick = null;

    var els = {};

    function updateTrackInfo() {
      var track = player.getCurrentTrack();
      els.cover.src = (track && track.cover) || 'assets/img/placeholders/music-cover-placeholder.svg';
      els.title.textContent = track ? track.title : 'Nenhuma faixa selecionada';
      els.artist.textContent = track ? (track.artist || '') : '';
    }

    function updatePlayState() {
      var audio = player.getAudioElement();
      var playing = !audio.paused && !audio.ended;
      els.playButton.textContent = playing ? '❚❚' : '▶';
      els.playButton.setAttribute('aria-label', playing ? 'Pausar' : 'Reproduzir');
      els.error.classList.toggle('is-hidden', !player.hasError());
    }

    function updateProgress() {
      var audio = player.getAudioElement();
      var duration = isFinite(audio.duration) ? audio.duration : 0;
      els.progressInput.max = String(duration || 0);
      if (document.activeElement !== els.progressInput) {
        els.progressInput.value = String(audio.currentTime || 0);
      }
      els.progressFill.style.width = (duration ? (audio.currentTime / duration) * 100 : 0) + '%';
      els.time.textContent = format.formatDuration(audio.currentTime) + ' / ' + format.formatDuration(duration);
    }

    function render() {
      dom.clear(container);

      var tracks = player.getTracks();
      if (!tracks.length) {
        container.classList.add('is-hidden');
        return;
      }
      container.classList.remove('is-hidden');

      var audio = player.getAudioElement();

      els.cover = dom.el('img', { class: 'global-player__cover', src: 'assets/img/placeholders/music-cover-placeholder.svg', alt: '' });
      els.title = dom.el('p', { class: 'global-player__title' }, ['Nenhuma faixa selecionada']);
      els.artist = dom.el('p', { class: 'global-player__artist' }, ['']);
      els.error = dom.el('p', { class: 'global-player__error is-hidden' }, [
        'Áudio indisponível (arquivo ainda não adicionado em assets/music/).'
      ]);

      els.playButton = dom.el('button', {
        class: 'global-player__btn global-player__btn--play',
        type: 'button',
        'aria-label': 'Reproduzir',
        onClick: function () { player.togglePlay(); }
      }, ['▶']);

      var prevButton = dom.el('button', {
        class: 'global-player__btn', type: 'button', 'aria-label': 'Faixa anterior',
        onClick: function () { player.prev(); }
      }, ['⏮']);

      var nextButton = dom.el('button', {
        class: 'global-player__btn', type: 'button', 'aria-label': 'Próxima faixa',
        onClick: function () { player.next(); }
      }, ['⏭']);

      els.progressFill = dom.el('div', { class: 'global-player__progress-fill' });
      els.progressInput = dom.el('input', {
        class: 'global-player__progress-input',
        type: 'range', min: '0', max: '0', step: '0.1', value: '0',
        'aria-label': 'Progresso da faixa',
        onInput: function (e) { player.seekTo(parseFloat(e.target.value)); }
      });
      els.time = dom.el('span', { class: 'global-player__time' }, ['0:00 / 0:00']);

      var progressWrapper = dom.el('div', { class: 'global-player__progress-wrapper' }, [
        dom.el('div', { class: 'global-player__progress-track' }, [els.progressFill]),
        els.progressInput
      ]);

      var volumeInput = dom.el('input', {
        class: 'global-player__volume-input',
        type: 'range', min: '0', max: '1', step: '0.05', value: String(audio.volume),
        'aria-label': 'Volume',
        onInput: function (e) { player.setVolume(parseFloat(e.target.value)); }
      });

      var bar = dom.el('div', { class: 'global-player', role: 'region', 'aria-label': 'Player de trilha sonora' }, [
        dom.el('div', { class: 'global-player__now-playing' }, [
          els.cover,
          dom.el('div', { class: 'global-player__meta' }, [els.title, els.artist, els.error])
        ]),
        dom.el('div', { class: 'global-player__controls' }, [
          dom.el('div', { class: 'global-player__buttons' }, [prevButton, els.playButton, nextButton]),
          dom.el('div', { class: 'global-player__progress' }, [progressWrapper, els.time])
        ]),
        dom.el('div', { class: 'global-player__volume' }, [
          dom.el('span', { class: 'global-player__volume-icon', 'aria-hidden': 'true' }, ['🔊']),
          volumeInput
        ])
      ]);

      container.appendChild(bar);
      updateTrackInfo();
      updatePlayState();
      updateProgress();
    }

    offTrackChanged = eventBus.on('player:trackChanged', function () {
      updateTrackInfo();
      updatePlayState();
      updateProgress();
    });
    offStateChanged = eventBus.on('player:stateChanged', updatePlayState);
    offTick = eventBus.on('player:tick', updateProgress);

    function destroy() {
      if (offTrackChanged) offTrackChanged();
      if (offStateChanged) offStateChanged();
      if (offTick) offTick();
      dom.clear(container);
    }

    return { render: render, destroy: destroy };
  }

  App.components = App.components || {};
  App.components.GlobalPlayer = GlobalPlayer;
})(window.WeddingApp = window.WeddingApp || {});
