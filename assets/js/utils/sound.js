/*
  sound — efeitos sonoros curtos, sintetizados inteiramente via Web Audio API.
  Nenhum arquivo de áudio externo, nenhuma amostra/gravação de terceiros —
  tudo é gerado por osciladores e ruído filtrado, em código.

  Importante sobre autoplay: navegadores só permitem iniciar áudio a partir de
  um gesto do usuário (clique/toque/tecla). Por isso resume()/playRevealSound()
  devem sempre ser chamados de dentro de um handler de evento de interação —
  nunca automaticamente no carregamento da página.
*/
(function (App) {
  'use strict';

  var ctx = null;

  function getContext() {
    if (ctx) return ctx;
    var AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return null;
    ctx = new AudioCtx();
    return ctx;
  }

  function resume() {
    var audioCtx = getContext();
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume().catch(function () { /* sem suporte/permissão: seguimos sem som */ });
    }
    return audioCtx;
  }

  function createNoiseBuffer(audioCtx, duration) {
    var sampleCount = Math.max(1, Math.floor(audioCtx.sampleRate * duration));
    var buffer = audioCtx.createBuffer(1, sampleCount, audioCtx.sampleRate);
    var channel = buffer.getChannelData(0);
    for (var i = 0; i < sampleCount; i++) {
      channel[i] = Math.random() * 2 - 1;
    }
    return buffer;
  }

  /*
    playRevealSound(when) — som de "revelação": um riser (ruído filtrado +
    tom subindo de altura, crescendo em intensidade) que acompanha a cortina
    de fitas se abrindo, seguido de um acorde breve e luminoso no instante
    exato em que o conteúdo é revelado. `when` é o atraso em segundos a
    partir de agora.
  */
  function playRevealSound(when) {
    var audioCtx = resume();
    if (!audioCtx) return;
    var startAt = audioCtx.currentTime + Math.max(0, when || 0);
    var riserDuration = 1.1;

    var master = audioCtx.createGain();
    master.gain.value = 0.9;
    master.connect(audioCtx.destination);

    // Riser — ruído filtrado em passa-banda, subindo de frequência
    var noiseSource = audioCtx.createBufferSource();
    noiseSource.buffer = createNoiseBuffer(audioCtx, riserDuration + 0.2);

    var riserFilter = audioCtx.createBiquadFilter();
    riserFilter.type = 'bandpass';
    riserFilter.Q.value = 0.8;
    riserFilter.frequency.setValueAtTime(200, startAt);
    riserFilter.frequency.exponentialRampToValueAtTime(4200, startAt + riserDuration);

    var riserGain = audioCtx.createGain();
    riserGain.gain.setValueAtTime(0.0001, startAt);
    riserGain.gain.exponentialRampToValueAtTime(0.5, startAt + riserDuration * 0.85);
    riserGain.gain.exponentialRampToValueAtTime(0.0001, startAt + riserDuration + 0.15);

    noiseSource.connect(riserFilter).connect(riserGain).connect(master);
    noiseSource.start(startAt);
    noiseSource.stop(startAt + riserDuration + 0.2);

    // Riser tonal — reforça a sensação de "construção" subindo junto
    var tone = audioCtx.createOscillator();
    tone.type = 'sine';
    tone.frequency.setValueAtTime(160, startAt);
    tone.frequency.exponentialRampToValueAtTime(760, startAt + riserDuration);
    var toneGain = audioCtx.createGain();
    toneGain.gain.setValueAtTime(0.0001, startAt);
    toneGain.gain.exponentialRampToValueAtTime(0.25, startAt + riserDuration * 0.8);
    toneGain.gain.exponentialRampToValueAtTime(0.0001, startAt + riserDuration + 0.1);
    tone.connect(toneGain).connect(master);
    tone.start(startAt);
    tone.stop(startAt + riserDuration + 0.2);

    // Chegada — acorde breve e luminoso no instante exato da revelação
    var arrivalAt = startAt + riserDuration;
    var arrivalNotes = [523.25, 659.25, 784.0]; // C5, E5, G5
    arrivalNotes.forEach(function (freq, i) {
      var noteStart = arrivalAt + i * 0.03;
      var osc = audioCtx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, noteStart);
      var noteGain = audioCtx.createGain();
      noteGain.gain.setValueAtTime(0.0001, noteStart);
      noteGain.gain.exponentialRampToValueAtTime(0.28, noteStart + 0.05);
      noteGain.gain.exponentialRampToValueAtTime(0.0001, noteStart + 1.6);
      osc.connect(noteGain).connect(master);
      osc.start(noteStart);
      osc.stop(noteStart + 1.8);
    });
  }

  App.utils = App.utils || {};
  App.utils.sound = { playRevealSound: playRevealSound, resume: resume };
})(window.WeddingApp = window.WeddingApp || {});
