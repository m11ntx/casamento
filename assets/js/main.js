/*
  main.js — bootstrap da aplicação: carrega os dados, monta o roteador e os
  overlays/persistentes (Lightbox, EpisodeDetail, GlobalPlayer), e trata o
  cenário de abertura via file:// com uma tela explicativa amigável.
*/
(function (App) {
  'use strict';
  var dom = App.utils.dom;
  var router = App.core.router;
  var store = App.core.store;

  document.addEventListener('DOMContentLoaded', function () {
    var root = document.getElementById('app-root');

    App.core.dataLoader.loadAll()
      .then(boot)
      .catch(function (err) {
        if (err && err.message === 'FILE_PROTOCOL') renderLocalServerNotice(root);
        else renderLoadError(root, err);
      });

    function boot(data) {
      store.setState({ data: data });
      var ctx = { data: data };

      dom.clear(root);
      var screenContainer = dom.el('main', { id: 'screen-root' });
      var overlayLayer = dom.el('div', { id: 'overlay-root' });
      root.appendChild(screenContainer);
      root.appendChild(overlayLayer);

      // Ordem importa: cada overlay pinta por cima dos anteriores (mesmo
      // z-index, decide o DOM). O Lightbox abre direto na primeira foto do
      // álbum; um botão "Ver todas as fotos" dentro dele liga
      // store.albumGridOpen, e a grade (AlbumGrid) precisa aparecer POR CIMA
      // do Lightbox nesse momento — por isso vem depois no DOM.
      var episodeDetailContainer = dom.el('div', { class: 'overlay-slot' });
      var albumDetailContainer = dom.el('div', { class: 'overlay-slot' });
      var lightboxContainer = dom.el('div', { class: 'overlay-slot' });
      var albumGridContainer = dom.el('div', { class: 'overlay-slot' });
      var globalPlayerContainer = dom.el('div', { class: 'global-player-slot' });
      overlayLayer.appendChild(episodeDetailContainer);
      overlayLayer.appendChild(albumDetailContainer);
      overlayLayer.appendChild(lightboxContainer);
      overlayLayer.appendChild(albumGridContainer);
      overlayLayer.appendChild(globalPlayerContainer);
      App.components.EpisodeDetail(episodeDetailContainer, ctx);
      App.components.SoundtrackAlbumDetail(albumDetailContainer, ctx);
      App.components.Lightbox(lightboxContainer, ctx);
      App.components.AlbumGrid(albumGridContainer, ctx);
      var globalPlayer = App.components.GlobalPlayer(globalPlayerContainer, ctx);
      globalPlayer.render();

      var currentScreen = null;

      function mountScreen(ComponentFactory) {
        if (currentScreen && currentScreen.destroy) currentScreen.destroy();
        dom.clear(screenContainer);
        currentScreen = ComponentFactory(screenContainer, ctx);
        currentScreen.render();
        window.scrollTo(0, 0);
      }

      // O player global só aparece na Home — durante a abertura cinematográfica
      // a tela é imersiva e tem seu próprio som (separado da trilha sonora).
      router.register('/', function () {
        mountScreen(App.components.IntroScreen);
        globalPlayerContainer.classList.add('is-route-hidden');
      });
      router.register('/home', function () {
        mountScreen(App.components.HomeScreen);
        globalPlayerContainer.classList.remove('is-route-hidden');
        // Tenta iniciar a trilha em destaque (Jason Mraz) assim que a Home
        // aparece — aproveita o toque que o usuário já deu no portão da
        // abertura (mesmo documento/sessão). Se o navegador recusar (ex.:
        // usuário entrou direto em #/home, sem gesto nenhum na sessão), a
        // faixa só fica visível e pronta, sem insistir.
        App.core.musicPlayer.play();
      });
      router.setNotFound(function () { router.navigate('/'); });
      router.start();

      if (data.config.site) {
        var title = data.config.site.title;
        var description = data.config.site.description;
        if (title) document.title = title;
        // Sincroniza description + Open Graph/Twitter Card em tempo de
        // execução. Isso não substitui manter as tags estáticas do
        // index.html atualizadas (ver comentário lá) — a maioria dos
        // robôs de prévia de link não executa JavaScript.
        [
          'meta[name="description"]',
          'meta[property="og:title"]',
          'meta[property="og:description"]',
          'meta[name="twitter:title"]',
          'meta[name="twitter:description"]'
        ].forEach(function (selector) {
          var el = document.querySelector(selector);
          if (!el) return;
          var isTitle = selector.indexOf('title') !== -1;
          var value = isTitle ? title : description;
          if (value) el.setAttribute('content', value);
        });
      }
    }

    function renderLocalServerNotice(rootEl) {
      dom.clear(rootEl);
      var notice = dom.el('div', { class: 'local-server-notice' }, [
        dom.el('h1', {}, ['Quase lá! 🎬']),
        dom.el('p', {}, [
          'Por segurança, os navegadores bloqueiam a leitura de arquivos locais (JSON) quando a página é aberta ',
          dom.el('strong', {}, ['diretamente por duplo clique']),
          '. Isso não é um erro do site — é uma proteção padrão de todo navegador para páginas abertas via "file://".'
        ]),
        dom.el('p', {}, [
          'Para visualizar localmente, abra um terminal nesta pasta e rode um dos comandos abaixo, depois acesse ',
          dom.el('code', {}, ['http://localhost:8000']),
          ':'
        ]),
        dom.el('pre', {}, [dom.el('code', {}, ['python -m http.server 8000'])]),
        dom.el('pre', {}, [dom.el('code', {}, ['npx serve .'])]),
        dom.el('p', {}, ['Ou publique a pasta no GitHub Pages — lá o site funciona normalmente, sem nenhuma configuração extra.'])
      ]);
      rootEl.appendChild(notice);
    }

    function renderLoadError(rootEl, err) {
      dom.clear(rootEl);
      var notice = dom.el('div', { class: 'local-server-notice local-server-notice--error' }, [
        dom.el('h1', {}, ['Não foi possível carregar o conteúdo']),
        dom.el('p', {}, ['Verifique se os arquivos em /data existem e são JSON válido.']),
        dom.el('pre', {}, [dom.el('code', {}, [String((err && err.message) || err)])])
      ]);
      rootEl.appendChild(notice);
      console.error(err);
    }
  });
})(window.WeddingApp = window.WeddingApp || {});
