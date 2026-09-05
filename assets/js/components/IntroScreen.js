/*
  IntroScreen — abertura cinematográfica (identidade própria: monograma do
  casal, não um logo de terceiros).

  Sequência:
    1. Uma cortina de fitas cobre a tela inteira, balançando sutilmente —
       inclusive antes do toque, para a tela inicial não ficar parada/vazia.
    2. Ao tocar em "Toque para começar", o balanço continua por mais
       HOLD_DURATION_MS (a cortina "vive" na tela por alguns segundos).
    3. Depois disso, a cortina se abre: a maioria das fitas voa para fora —
       metade para cima, metade para baixo — e as DUAS fitas centrais
       encolhem exatamente onde cada inicial do casal vai aparecer,
       desaparecendo no instante em que a letra "pousa" ali.
    4. Assim que a revelação termina, a aplicação navega automaticamente para
       a Home — igual a uma plataforma de streaming, a abertura entrega
       direto o conteúdo, sem uma tela de "pôster" intermediária pedindo
       outro clique.
  O som (assets/js/utils/sound.js) é um "riser" sintetizado, agendado para
  crescer junto com a abertura da cortina — tudo gerado em código, sem
  nenhum arquivo de áudio externo.

  Por que existe um botão "Toque para começar": navegadores só permitem
  iniciar áudio a partir de um gesto do usuário — não é possível tocar som
  sincronizado automaticamente no carregamento da página.

  A abertura toca por inteiro sempre — não pula em visitas repetidas. O único
  caso que pula direto para o estado final (e navega para a Home em seguida)
  é "reduzir movimento" ativado no sistema operacional (acessibilidade, não
  conveniência).
*/
(function (App) {
  'use strict';
  var dom = App.utils.dom;

  var STRIP_COUNT = 14;
  var STRIP_EXIT_DELAY_STEP_MS = 45;
  var HOLD_DURATION_MS = 2600; // tempo que a cortina fica "viva" antes de começar a se abrir
  var NAVIGATE_DELAY_MS = HOLD_DURATION_MS + 2300; // tempo total até navegar para a Home
  var REDUCED_MOTION_NAVIGATE_DELAY_MS = 500;
  // As duas fitas centrais (0-based) são as que "viram" as iniciais.
  var LETTER_STRIP_INDEXES = [Math.floor(STRIP_COUNT / 2) - 1, Math.floor(STRIP_COUNT / 2)];

  function getInitial(name) {
    if (!name) return '';
    var match = String(name).match(/\p{L}/u);
    return match ? match[0].toUpperCase() : '';
  }

  function buildStrips() {
    var strips = [];
    for (var i = 0; i < STRIP_COUNT; i++) {
      var isLetterStrip = LETTER_STRIP_INDEXES.indexOf(i) !== -1;
      var classes = 'intro-screen__strip' + (isLetterStrip ? ' intro-screen__strip--letter' : '');
      var strip = dom.el('div', { class: classes });

      // Balanço ocioso (ativo o tempo todo, inclusive antes do toque):
      // cada fita tem timing levemente diferente, para o movimento parecer
      // orgânico em vez de sincronizado/mecânico.
      strip.style.setProperty('--idle-delay', ((i * 70) % 900) + 'ms');
      strip.style.setProperty('--idle-duration', (2200 + (i % 5) * 220) + 'ms');
      var idleSign = i % 2 === 0 ? 1 : -1;
      strip.style.setProperty('--idle-drift-y', (idleSign * (8 + (i % 4) * 4)) + 'px');
      strip.style.setProperty('--idle-rotate', (idleSign * (1 + (i % 3))) + 'deg');

      if (isLetterStrip) {
        strip.style.setProperty('--strip-delay', (i * STRIP_EXIT_DELAY_STEP_MS) + 'ms');
        // Desloca a fita até o centro exato da tela (ela já está perto, por
        // ser uma das duas centrais), onde vai encolher e sumir no lugar da letra.
        var stripCenterVw = (i + 0.5) * (100 / STRIP_COUNT);
        strip.style.setProperty('--strip-center-drift', (50 - stripCenterVw).toFixed(2) + 'vw');
      } else {
        strip.style.setProperty('--strip-delay', (i * STRIP_EXIT_DELAY_STEP_MS) + 'ms');
        // Metade das fitas sobe, metade desce — cobrindo a tela toda com
        // fitas indo em direções opostas quando a cortina se abre.
        var goesUp = i % 2 === 0;
        var sign = goesUp ? -1 : 1;
        strip.style.setProperty('--strip-direction-y', goesUp ? '-115%' : '115%');
        strip.style.setProperty('--strip-drift', (sign * (12 + (i % 5) * 7)) + 'px');
        strip.style.setProperty('--strip-rotate', (sign * (1 + (i % 4))) + 'deg');
      }
      strips.push(strip);
    }
    return strips;
  }

  function IntroScreen(container, ctx) {
    var couple = ctx.data.couple || {};

    function render() {
      dom.clear(container);

      var initial1 = getInitial(couple.partner1 && couple.partner1.name) || '♥';
      var initial2 = getInitial(couple.partner2 && couple.partner2.name) || '♥';

      var section = dom.el('section', { class: 'intro-screen', role: 'region', 'aria-label': 'Abertura' });
      var pendingTimeouts = [];

      function goToHome() {
        // Aviso para quem usa leitor de tela: a troca de tela é só visual
        // até aqui — sem isso, o usuário fica em silêncio até a Home
        // carregar, sem entender o que está acontecendo.
        App.core.a11y.announce('Carregando a página inicial…');
        App.core.router.navigate('/home');
      }

      function forceFinalState() {
        pendingTimeouts.forEach(window.clearTimeout);
        pendingTimeouts = [];
        section.classList.remove('intro-screen--playing');
        section.classList.add('intro-screen--started', 'intro-screen--skipped');
        pendingTimeouts.push(window.setTimeout(goToHome, REDUCED_MOTION_NAVIGATE_DELAY_MS));
      }

      function startSequence() {
        section.classList.add('intro-screen--started');
        if (App.utils.sound) App.utils.sound.playRevealSound(HOLD_DURATION_MS / 1000);
        pendingTimeouts.push(window.setTimeout(function () {
          section.classList.add('intro-screen--playing');
        }, HOLD_DURATION_MS));
        pendingTimeouts.push(window.setTimeout(goToHome, NAVIGATE_DELAY_MS));
      }

      var gateButton = dom.el('button', {
        class: 'intro-screen__gate',
        type: 'button',
        onClick: startSequence
      }, ['▸ Toque para começar']);

      var backdrop = dom.el('div', { class: 'intro-screen__backdrop' });
      var glow = dom.el('div', { class: 'intro-screen__glow', 'aria-hidden': 'true' });
      var letterboxTop = dom.el('div', { class: 'intro-screen__letterbox intro-screen__letterbox--top', 'aria-hidden': 'true' });
      var letterboxBottom = dom.el('div', { class: 'intro-screen__letterbox intro-screen__letterbox--bottom', 'aria-hidden': 'true' });
      var curtain = dom.el('div', { class: 'intro-screen__curtain', 'aria-hidden': 'true' }, buildStrips());

      var openingSequence = dom.el('div', { class: 'opening-sequence', 'aria-hidden': 'true' }, [
        dom.el('div', { class: 'opening-sequence__logo' }, [
          dom.el('span', { class: 'opening-sequence__initial' }, [initial1]),
          dom.el('span', { class: 'opening-sequence__ampersand' }, ['&']),
          dom.el('span', { class: 'opening-sequence__initial opening-sequence__initial--second' }, [initial2])
        ])
      ]);

      var stage = dom.el('div', { class: 'intro-screen__stage' }, [openingSequence]);

      [backdrop, glow, letterboxTop, letterboxBottom, stage, curtain, gateButton].forEach(function (node) {
        section.appendChild(node);
      });

      container.appendChild(section);

      if (App.core.a11y.prefersReducedMotion()) {
        forceFinalState();
      } else {
        // Foco no portão: permite iniciar a sequência (e o som) via teclado
        // imediatamente, sem precisar navegar até lá com Tab.
        gateButton.focus();
      }

      container._introTimeouts = pendingTimeouts;
    }

    function destroy() {
      (container._introTimeouts || []).forEach(window.clearTimeout);
      dom.clear(container);
    }

    return { render: render, destroy: destroy };
  }

  App.components = App.components || {};
  App.components.IntroScreen = IntroScreen;
})(window.WeddingApp = window.WeddingApp || {});
