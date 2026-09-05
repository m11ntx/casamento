/*
  eventBus — comunicação desacoplada entre componentes.
  Uso: App.core.eventBus.on('evento', handler) / App.core.eventBus.emit('evento', payload)
*/
(function (App) {
  'use strict';

  var listeners = Object.create(null);

  function on(event, handler) {
    if (!listeners[event]) listeners[event] = [];
    listeners[event].push(handler);
    return function off() {
      listeners[event] = listeners[event].filter(function (h) { return h !== handler; });
    };
  }

  function emit(event, payload) {
    (listeners[event] || []).slice().forEach(function (handler) {
      try {
        handler(payload);
      } catch (err) {
        console.error('[eventBus] erro no listener de "' + event + '":', err);
      }
    });
  }

  App.core = App.core || {};
  App.core.eventBus = { on: on, emit: emit };
})(window.WeddingApp = window.WeddingApp || {});
