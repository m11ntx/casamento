/*
  Header — barra superior fixa, estilo plataforma de streaming: começa
  transparente sobre o hero e ganha fundo sólido ao rolar a página.
*/
(function (App) {
  'use strict';
  var dom = App.utils.dom;

  var SOLID_SCROLL_THRESHOLD = 80;

  function getInitial(name) {
    if (!name) return '';
    var match = String(name).match(/\p{L}/u);
    return match ? match[0].toUpperCase() : '';
  }

  var NAV_LINKS = [
    { label: 'Linha do Tempo', target: 'home-timeline' },
    { label: 'Galeria', target: 'home-gallery' },
    { label: 'Episódios', target: 'home-episodes' },
    { label: 'Trilha Sonora', target: 'home-soundtrack' }
  ];

  function Header(container, ctx) {
    var couple = ctx.data.couple || {};
    var config = ctx.data.config || {};
    var onScroll = null;

    function scrollToSection(id) {
      var target = document.getElementById(id);
      if (!target) return;
      target.scrollIntoView({
        behavior: App.core.a11y.prefersReducedMotion() ? 'auto' : 'smooth',
        block: 'start'
      });
    }

    function render() {
      dom.clear(container);

      var initial1 = getInitial(couple.partner1 && couple.partner1.name) || '♥';
      var initial2 = getInitial(couple.partner2 && couple.partner2.name) || '♥';

      var brand = dom.el('div', { class: 'site-header__brand' }, [
        dom.el('span', { class: 'site-header__monogram' }, [initial1 + ' & ' + initial2]),
        dom.el('span', { class: 'site-header__title' }, [(config.site && config.site.title) || 'Nossa História'])
      ]);

      var nav = dom.el('nav', { class: 'site-header__nav', 'aria-label': 'Navegação da página' },
        NAV_LINKS.map(function (link) {
          return dom.el('button', {
            class: 'site-header__link',
            type: 'button',
            onClick: function () { scrollToSection(link.target); }
          }, [link.label]);
        })
      );

      var header = dom.el('header', { class: 'site-header', id: 'home-header' }, [brand, nav]);
      container.appendChild(header);

      var ticking = false;
      function applyScrollState() {
        header.classList.toggle('site-header--solid', window.scrollY > SOLID_SCROLL_THRESHOLD);
        ticking = false;
      }
      // Agrupado em requestAnimationFrame: no máximo uma leitura/escrita por frame.
      onScroll = function () {
        if (!ticking) {
          ticking = true;
          window.requestAnimationFrame(applyScrollState);
        }
      };
      window.addEventListener('scroll', onScroll, { passive: true });
      applyScrollState();
    }

    function destroy() {
      if (onScroll) window.removeEventListener('scroll', onScroll);
      dom.clear(container);
    }

    return { render: render, destroy: destroy };
  }

  App.components = App.components || {};
  App.components.Header = Header;
})(window.WeddingApp = window.WeddingApp || {});
