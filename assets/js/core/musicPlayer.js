/*
  musicPlayer — motor central e único do player de trilha sonora: dono do
  elemento <audio>, da playlist (ordenada pelo campo "order" de cada faixa em
  soundtrack.json) e de toda a lógica de play/pause/próxima/anterior/volume/
  progresso. A interface (GlobalPlayer.js, a barra fixa; SoundtrackList.js, a
  lista de faixas na Home) apenas chama estas funções e escuta os eventos —
  nenhuma delas mantém seu próprio <audio>.

  Política de autoplay: a primeira faixa (order:1 — hoje "I Won't Give Up",
  Jason Mraz) é carregada automaticamente ao iniciar, para já aparecer pronta
  na barra do player. main.js tenta play() assim que a Home é montada,
  aproveitando o toque que o usuário já deu no portão da abertura (mesmo
  documento/sessão — é exatamente o gesto que os navegadores exigem, não é
  um contorno da política). Se o navegador mesmo assim recusar (ex.: usuário
  chegou direto em #/home sem passar pela abertura), não insistimos, não
  mutamos à força nem tentamos de novo sozinhos — só refletimos isso no
  estado (isPlaying: false) e a faixa fica pronta esperando um clique.

  Arquitetura preparada para novas faixas: adicione o arquivo em
  assets/music/ e um objeto correspondente em data/soundtrack.json — nada
  neste arquivo precisa mudar.
*/
(function (App) {
  'use strict';
  var store = App.core.store;
  var eventBus = App.core.eventBus;

  var audio = new Audio();
  audio.preload = 'none';

  var tracks = [];
  var currentIndex = -1;
  var hasError = false;
  var initialized = false;

  function emitState() { eventBus.emit('player:stateChanged'); }

  audio.addEventListener('timeupdate', function () { eventBus.emit('player:tick'); });
  audio.addEventListener('loadedmetadata', function () { eventBus.emit('player:tick'); });
  audio.addEventListener('ended', function () { if (tracks.length) next(); });
  audio.addEventListener('error', function () {
    hasError = true;
    store.setState({ isPlaying: false });
    emitState();
  });

  function init(trackList) {
    if (initialized) return;
    initialized = true;
    tracks = (trackList || []).slice().sort(function (a, b) { return (a.order || 0) - (b.order || 0); });
    if (tracks.length) loadTrack(0, false); // deixa a faixa em destaque pronta, sem tocar ainda
  }

  function getTracks() { return tracks; }
  function getCurrentTrack() { return (currentIndex >= 0 && currentIndex < tracks.length) ? tracks[currentIndex] : null; }
  function getCurrentIndex() { return currentIndex; }
  function hasErrorState() { return hasError; }
  function getAudioElement() { return audio; }

  function loadTrack(index, autoplay) {
    if (!tracks.length) return;
    currentIndex = (index + tracks.length) % tracks.length;
    var track = tracks[currentIndex];
    hasError = false;
    audio.src = track.file || '';
    store.setState({ currentTrackId: track.id, isPlaying: false });
    eventBus.emit('player:trackChanged', track);
    if (autoplay) play();
  }

  function play() {
    return audio.play().then(function () {
      hasError = false;
      store.setState({ isPlaying: true });
      emitState();
    }).catch(function () {
      // Recusado pelo navegador (autoplay bloqueado) ou arquivo indisponível.
      // Não insistimos nem tentamos contornar — só refletimos no estado.
      store.setState({ isPlaying: false });
      emitState();
    });
  }

  function pause() {
    audio.pause();
    store.setState({ isPlaying: false });
    emitState();
  }

  function togglePlay() {
    if (!getCurrentTrack()) {
      if (tracks.length) loadTrack(0, true);
      return;
    }
    if (audio.paused) play();
    else pause();
  }

  function playTrackById(id) {
    var index = tracks.findIndex(function (t) { return t.id === id; });
    if (index === -1) return;
    if (index === currentIndex && getCurrentTrack()) togglePlay();
    else loadTrack(index, true);
  }

  function next() { loadTrack(currentIndex + 1, true); }
  function prev() { loadTrack(currentIndex - 1, true); }

  function seekTo(seconds) {
    if (isFinite(audio.duration)) {
      audio.currentTime = Math.max(0, Math.min(seconds, audio.duration));
    }
  }

  function setVolume(value) {
    audio.volume = Math.max(0, Math.min(1, value));
  }

  App.core = App.core || {};
  App.core.musicPlayer = {
    init: init,
    getTracks: getTracks,
    getCurrentTrack: getCurrentTrack,
    getCurrentIndex: getCurrentIndex,
    hasError: hasErrorState,
    getAudioElement: getAudioElement,
    play: play,
    pause: pause,
    togglePlay: togglePlay,
    playTrackById: playTrackById,
    next: next,
    prev: prev,
    seekTo: seekTo,
    setVolume: setVolume
  };
})(window.WeddingApp = window.WeddingApp || {});
