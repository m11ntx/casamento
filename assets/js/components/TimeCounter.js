/*
  TimeCounter — contador de tempo juntos, calculado a partir de
  couple.relationshipStartDate e couple.weddingDate (couple.json).
  Se a data estiver no futuro, mostra uma contagem regressiva.

  Performance: a cada minuto, só o texto dos valores é atualizado — a seção
  não é destruída/reconstruída (evita reflow desnecessário para uma mudança
  de dois números).
*/
(function (App) {
  'use strict';
  var dom = App.utils.dom;
  var format = App.utils.format;

  function TimeCounter(container, ctx) {
    var couple = ctx.data.couple || {};
    var intervalId = null;
    var valueEls = []; // [{ el, dateStr }]

    function computeValue(dateStr) {
      var parts = format.diffParts(dateStr, new Date());
      return parts.isFuture
        ? (parts.totalDays + ' dias para o grande momento')
        : (parts.years + ' anos, ' + parts.months + ' meses e ' + parts.days + ' dias');
    }

    function counterBlock(label, dateStr) {
      if (!dateStr) return null;
      var valueEl = dom.el('p', { class: 'time-counter__value' }, [computeValue(dateStr)]);
      valueEls.push({ el: valueEl, dateStr: dateStr });
      return dom.el('div', { class: 'time-counter__block' }, [
        dom.el('p', { class: 'time-counter__label' }, [label]),
        valueEl
      ]);
    }

    function render() {
      dom.clear(container);
      valueEls = [];
      var section = dom.el('section', { class: 'time-counter', 'aria-label': 'Contador de tempo juntos' }, [
        dom.el('h2', { class: 'section-title' }, ['Tempo Juntos']),
        counterBlock('Desde o primeiro dia', couple.relationshipStartDate),
        couple.weddingDate ? counterBlock('Desde o casamento', couple.weddingDate) : null
      ]);
      container.appendChild(section);
    }

    function updateValues() {
      valueEls.forEach(function (item) {
        item.el.textContent = computeValue(item.dateStr);
      });
    }

    function destroy() {
      if (intervalId) clearInterval(intervalId);
      dom.clear(container);
    }

    render();
    // Atualiza só os números a cada minuto — suficiente para uma contagem em
    // dias/meses/anos, sem reconstruir a seção inteira.
    intervalId = window.setInterval(updateValues, 60000);

    return { render: render, destroy: destroy };
  }

  App.components = App.components || {};
  App.components.TimeCounter = TimeCounter;
})(window.WeddingApp = window.WeddingApp || {});
