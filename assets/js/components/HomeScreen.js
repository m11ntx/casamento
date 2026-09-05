/*
  HomeScreen — orquestra a "home estilo streaming": monta, em sequência,
  todas as seções da página em containers próprios.

  Ordem: Header (fixo) → Hero (com botão Assistir) → Sinopse → Informações da
  história → Galeria (cards de álbum) → Episódios (carrossel) →
  Trilha sonora (cards de álbum) → Tempo juntos → Encerramento.

  Momentos, Linha do Tempo, Pessoas Importantes (Elenco de Apoio) e o filtro
  de Categorias foram removidos da Home — os componentes (Moments.js,
  Timeline.js, PeopleSection.js, CategoryFilter.js) continuam no projeto, só
  não são mais montados aqui; reativar é só voltar a chamar mountSection()
  para eles. O CategoryFilter ficou redundante depois que a Galeria virou
  cards de álbum (cada card já representa uma categoria).
*/
(function (App) {
  'use strict';
  var dom = App.utils.dom;

  function HomeScreen(container, ctx) {
    var children = [];

    function mountSection(ComponentFactory, className) {
      var sectionContainer = dom.el('div', { class: className });
      container.appendChild(sectionContainer);
      var instance = ComponentFactory(sectionContainer, ctx);
      children.push(instance);
      if (instance.render) instance.render();
    }

    function render() {
      dom.clear(container);
      children = [];
      mountSection(App.components.Header, 'home-header-wrap');
      mountSection(App.components.HeroBanner, 'home-hero-wrap');
      mountSection(App.components.Synopsis, 'home-section');
      mountSection(App.components.StoryInfo, 'home-section home-section--tight');
      mountSection(App.components.Gallery, 'home-section');
      mountSection(App.components.EpisodeList, 'home-section');
      mountSection(App.components.SoundtrackList, 'home-section');
      mountSection(App.components.TimeCounter, 'home-section');
      mountSection(App.components.OutroScreen, 'home-section');
      // Espaço reservado no fim da página para a barra fixa do player global
      // não cobrir o encerramento.
      container.appendChild(dom.el('div', { class: 'home-player-spacer', 'aria-hidden': 'true' }));
    }

    function destroy() {
      children.forEach(function (child) { if (child.destroy) child.destroy(); });
      children = [];
      dom.clear(container);
    }

    return { render: render, destroy: destroy };
  }

  App.components = App.components || {};
  App.components.HomeScreen = HomeScreen;
})(window.WeddingApp = window.WeddingApp || {});
