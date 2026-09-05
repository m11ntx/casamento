/*
  store — estado global mínimo, com padrão pub/sub simples (sem dependências externas).
  Todo componente que precisa reagir a mudanças de estado deve usar store.subscribe().
*/
(function (App) {
  'use strict';

  function createStore(initialState) {
    var state = Object.assign({}, initialState);
    var subscribers = [];

    function getState() { return state; }

    function setState(patch) {
      state = Object.assign({}, state, typeof patch === 'function' ? patch(state) : patch);
      subscribers.slice().forEach(function (fn) { fn(state); });
    }

    function subscribe(fn) {
      subscribers.push(fn);
      return function unsubscribe() {
        subscribers = subscribers.filter(function (s) { return s !== fn; });
      };
    }

    return { getState: getState, setState: setState, subscribe: subscribe };
  }

  App.core = App.core || {};
  App.core.createStore = createStore;
  App.core.store = createStore({
    currentScreen: 'intro',
    activeCategory: 'all',
    currentPhotoId: null,
    activeEpisodeId: null,
    activeAlbum: null,
    albumGridOpen: false,
    currentTrackId: null,
    isPlaying: false,
    data: null
  });
})(window.WeddingApp = window.WeddingApp || {});
