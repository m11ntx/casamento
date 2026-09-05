/*
  HeroBanner — destaque principal da Home, estilo streaming premium.

  Banner dinâmico: em vez de uma única foto fixa, alterna entre as capas dos
  álbuns (uma por categoria em data/categories.json, imagens em
  assets/img/photos/covers/), em ordem embaralhada — sempre começando pela
  capa configurada em config.hero.image (o casamento), para o primeiro
  carregamento ser previsível e rápido (é a candidata a LCP). Crossfade entre
  duas camadas, uma foto nova a cada ROTATE_INTERVAL_MS. Desativado (mostra
  só a primeira foto, sem troca) com prefers-reduced-motion.

  Fotos sem cortar: muitas fotos (principalmente as de celular) não têm a
  proporção larga do banner — preenchê-las com object-fit:cover cortaria
  cabeças/pés. Por isso cada "slide" tem duas camadas: um fundo desfocado da
  própria foto (preenche o banner todo, sem se importar em cortar, já que é
  só uma ambientação) e a foto real por cima, inteira, sem cortar nenhuma
  parte (object-fit:contain).

  Demais campos configuráveis via JSON: título (nomes do casal), subtítulo
  (synopsis.tagline), sinopse curta (synopsis.synopsis, cortada visualmente),
  data (couple.weddingDate), categoria (synopsis.genres) e o botão principal
  ("Assistir").
*/
(function (App) {
  'use strict';
  var dom = App.utils.dom;
  var format = App.utils.format;

  var ROTATE_INTERVAL_MS = 7000;

  function shuffle(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = a[i]; a[i] = a[j]; a[j] = tmp;
    }
    return a;
  }

  function HeroBanner(container, ctx) {
    var data = ctx.data;
    var config = data.config;
    var couple = data.couple;
    var synopsis = data.synopsis;
    var categories = data.categories || [];
    var hero = config.hero || {};
    var onScroll = null;
    var rotateTimer = null;
    var mediaEl = null;
    var slideEls = []; // [{ wrap, bg, fg }]
    var activeSlideIndex = 0;
    var slideDataIndex = 0;

    function buildSlideData() {
      var first = { src: hero.image || 'assets/img/placeholders/hero-placeholder.svg', alt: hero.alt || 'Foto de destaque do casal' };
      // Arte comemorativa dos 12 anos — posição fixa (2ª foto), não embaralhada
      // com o resto, para sempre aparecer cedo na rotação.
      var anniversary = { src: 'assets/img/photos/covers/aniversario.jpg', alt: '12 anos de casados' };
      var rest = categories
        .filter(function (c) { return ('assets/img/photos/covers/' + c.id + '.jpg') !== first.src; })
        .map(function (c) { return { src: 'assets/img/photos/covers/' + c.id + '.jpg', alt: 'Foto de destaque — ' + c.label }; });
      return [first, anniversary].concat(shuffle(rest));
    }

    function createSlide() {
      var bg = dom.el('div', { class: 'hero-banner__slide-bg' });
      var fg = dom.el('img', { class: 'hero-banner__slide-fg', alt: '' });
      var wrap = dom.el('div', { class: 'hero-banner__slide' }, [bg, fg]);
      return { wrap: wrap, bg: bg, fg: fg };
    }

    function setSlideImage(slide, data, highPriority) {
      slide.bg.style.backgroundImage = 'url(' + data.src + ')';
      slide.fg.alt = data.alt || '';
      if (highPriority) slide.fg.setAttribute('fetchpriority', 'high');
      slide.fg.src = data.src;
    }

    function render() {
      dom.clear(container);
      if (rotateTimer) { clearInterval(rotateTimer); rotateTimer = null; }

      var slidesData = buildSlideData();
      slideDataIndex = 0;
      activeSlideIndex = 0;

      var genres = synopsis.genres || [];
      var dateLabel = couple.weddingDate ? format.formatDate(couple.weddingDate, { year: 'numeric' }) : '';

      var slideA = createSlide();
      var slideB = createSlide();
      slideEls = [slideA, slideB];
      // Candidata a LCP (maior elemento visível no primeiro carregamento da
      // Home) — sinaliza prioridade alta e nunca deve ser lazy.
      setSlideImage(slideA, slidesData[0], true);
      slideA.wrap.classList.add('is-active');

      mediaEl = dom.el('div', { class: 'hero-banner__media' }, [slideA.wrap, slideB.wrap]);

      var section = dom.el('section', { class: 'hero-banner', id: 'home-hero', 'aria-label': 'Destaque principal' }, [
        mediaEl,
        dom.el('div', { class: 'hero-banner__vignette' }),
        dom.el('div', { class: 'hero-banner__gradient' }),
        dom.el('div', { class: 'hero-banner__content' }, [
          dom.el('p', { class: 'hero-banner__badge hero-banner__reveal', style: 'animation-delay:80ms' }, [
            'Original • ' + genres.join(' · ')
          ]),
          dom.el('h1', { class: 'hero-banner__title hero-banner__reveal', style: 'animation-delay:160ms' }, [
            couple.partner1.name + ' & ' + couple.partner2.name
          ]),
          dom.el('p', { class: 'hero-banner__subtitle hero-banner__reveal', style: 'animation-delay:240ms' }, [
            synopsis.tagline || ''
          ]),
          dom.el('div', { class: 'hero-banner__meta-row hero-banner__reveal', style: 'animation-delay:320ms' }, [
            dateLabel ? dom.el('span', { class: 'hero-banner__meta-item' }, [dateLabel]) : null,
            dom.el('span', { class: 'hero-banner__meta-item' }, [synopsis.rating || '']),
            genres.slice(0, 3).map(function (genre) {
              return dom.el('span', { class: 'hero-banner__pill' }, [genre]);
            })
          ].reduce(function (flat, item) { return flat.concat(item); }, [])),
          dom.el('p', { class: 'hero-banner__synopsis hero-banner__reveal', style: 'animation-delay:400ms' }, [
            synopsis.synopsis || ''
          ]),
          dom.el('button', {
            class: 'btn btn--primary hero-banner__cta hero-banner__reveal',
            style: 'animation-delay:480ms',
            type: 'button',
            onClick: function () {
              var episodesSection = document.getElementById('home-episodes');
              if (episodesSection) {
                episodesSection.scrollIntoView({
                  behavior: App.core.a11y.prefersReducedMotion() ? 'auto' : 'smooth',
                  block: 'start'
                });
              }
            }
          }, ['▶ Assistir'])
        ])
      ]);

      container.appendChild(section);

      var reduced = App.core.a11y.prefersReducedMotion();

      // Pré-carrega as próximas fotos em segundo plano, para a troca de
      // camada não esperar o download.
      if (!reduced) {
        slidesData.slice(1).forEach(function (s) { var img = new Image(); img.src = s.src; });
      }

      function showNextSlide() {
        if (slidesData.length < 2) return;
        slideDataIndex = (slideDataIndex + 1) % slidesData.length;
        var nextIndex = activeSlideIndex === 0 ? 1 : 0;
        var nextSlide = slideEls[nextIndex];
        setSlideImage(nextSlide, slidesData[slideDataIndex], false);
        // troca no próximo frame, depois que o navegador já reservou o layout
        window.requestAnimationFrame(function () {
          slideEls[activeSlideIndex].wrap.classList.remove('is-active');
          nextSlide.wrap.classList.add('is-active');
          activeSlideIndex = nextIndex;
        });
      }

      if (!reduced && slidesData.length > 1) {
        rotateTimer = window.setInterval(showNextSlide, ROTATE_INTERVAL_MS);
      }

      if (!reduced) {
        var ticking = false;
        function applyParallax() {
          var offset = Math.min(window.scrollY, 600) * 0.15;
          if (mediaEl) mediaEl.style.transform = 'translate3d(0, ' + offset + 'px, 0) scale(1.08)';
          ticking = false;
        }
        // Agrupado em requestAnimationFrame: no máximo uma escrita de estilo
        // por frame, mesmo que o navegador dispare 'scroll' várias vezes.
        onScroll = function () {
          if (!ticking) {
            ticking = true;
            window.requestAnimationFrame(applyParallax);
          }
        };
        window.addEventListener('scroll', onScroll, { passive: true });
        applyParallax();
      }
    }

    function destroy() {
      if (onScroll) window.removeEventListener('scroll', onScroll);
      if (rotateTimer) clearInterval(rotateTimer);
      dom.clear(container);
    }

    return { render: render, destroy: destroy };
  }

  App.components = App.components || {};
  App.components.HeroBanner = HeroBanner;
})(window.WeddingApp = window.WeddingApp || {});
