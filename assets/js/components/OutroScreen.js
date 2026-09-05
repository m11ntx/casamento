/*
  OutroScreen — encerramento cinematográfico (créditos), a partir de
  config.json (credits.outroMessage / credits.producedBy).
*/
(function (App) {
  'use strict';
  var dom = App.utils.dom;

  function OutroScreen(container, ctx) {
    var config = ctx.data.config || {};
    var couple = ctx.data.couple || {};

    function render() {
      dom.clear(container);
      var credits = config.credits || {};
      var section = dom.el('section', { class: 'outro-screen', 'aria-label': 'Encerramento' }, [
        dom.el('p', { class: 'outro-screen__eyebrow' }, ['FIM (por enquanto)']),
        dom.el('h2', { class: 'outro-screen__message' }, [credits.outroMessage || 'E a história continua...']),
        dom.el('p', { class: 'outro-screen__credit' }, [credits.producedBy || (couple.partner1.name + ' & ' + couple.partner2.name)]),
        dom.el('button', {
          class: 'btn btn--ghost outro-screen__replay',
          type: 'button',
          onClick: function () {
            window.scrollTo({ top: 0, behavior: App.core.a11y.prefersReducedMotion() ? 'auto' : 'smooth' });
          }
        }, ['▲ Voltar ao topo'])
      ]);
      container.appendChild(section);
    }

    function destroy() { dom.clear(container); }
    return { render: render, destroy: destroy };
  }

  App.components = App.components || {};
  App.components.OutroScreen = OutroScreen;
})(window.WeddingApp = window.WeddingApp || {});
