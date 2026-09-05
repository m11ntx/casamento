/*
  a11y — helpers de acessibilidade: foco preso em modais, anúncios para leitores
  de tela e verificação de preferência por movimento reduzido.
*/
(function (App) {
  'use strict';

  function prefersReducedMotion() {
    return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  function trapFocus(container) {
    var focusable = container.querySelectorAll(
      'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
    );
    if (!focusable.length) return function () {};
    var first = focusable[0];
    var last = focusable[focusable.length - 1];

    function onKeydown(e) {
      if (e.key !== 'Tab') return;
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }

    container.addEventListener('keydown', onKeydown);
    first.focus();
    return function release() {
      container.removeEventListener('keydown', onKeydown);
    };
  }

  function announce(message) {
    var liveRegion = document.getElementById('a11y-live-region');
    if (!liveRegion) return;
    liveRegion.textContent = '';
    window.setTimeout(function () { liveRegion.textContent = message; }, 50);
  }

  /*
    lockBackground/unlockBackground — usado por modais (Lightbox,
    EpisodeDetail) para tirar o conteúdo principal (#screen-root) da árvore
    de acessibilidade enquanto o modal está aberto. O foco por Tab já fica
    preso via trapFocus(), mas leitores de tela em modo de navegação por
    cursor virtual conseguem "vazar" para o conteúdo de fundo sem isso.
    Contador de referências: se dois modais abrirem em sequência sem o
    primeiro ter fechado, só destrava quando o último também fechar.
  */
  var backgroundLockCount = 0;
  function lockBackground() {
    backgroundLockCount++;
    var el = document.getElementById('screen-root');
    if (el) {
      el.setAttribute('inert', '');
      el.setAttribute('aria-hidden', 'true');
    }
  }
  function unlockBackground() {
    backgroundLockCount = Math.max(0, backgroundLockCount - 1);
    if (backgroundLockCount === 0) {
      var el = document.getElementById('screen-root');
      if (el) {
        el.removeAttribute('inert');
        el.removeAttribute('aria-hidden');
      }
    }
  }

  App.core = App.core || {};
  App.core.a11y = {
    prefersReducedMotion: prefersReducedMotion,
    trapFocus: trapFocus,
    announce: announce,
    lockBackground: lockBackground,
    unlockBackground: unlockBackground
  };
})(window.WeddingApp = window.WeddingApp || {});
