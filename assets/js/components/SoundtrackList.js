/*
  SoundtrackList — seção "Trilha Sonora" da Home: um card por álbum/pasta
  (ex.: "Diversas", "Despedida", "Horizonte Vivo Distante"), preservando o
  agrupamento original dos arquivos em assets/music/. Ao clicar num card,
  define store.activeAlbum — SoundtrackAlbumDetail.js reage a isso mostrando
  todas as faixas daquele álbum.
*/
(function (App) {
  'use strict';
  var dom = App.utils.dom;
  var store = App.core.store;
  var player = App.core.musicPlayer;

  function groupByAlbum(tracks) {
    var order = [];
    var byAlbum = {};
    tracks.forEach(function (track) {
      var album = track.album || 'Trilha Sonora';
      if (!byAlbum[album]) {
        byAlbum[album] = [];
        order.push(album);
      }
      byAlbum[album].push(track);
    });
    return order.map(function (album) { return { album: album, tracks: byAlbum[album] }; });
  }

  function SoundtrackList(container, ctx) {
    player.init(ctx.data.soundtrack || []); // idempotente — não recria a playlist se já inicializada
    var groups = groupByAlbum(player.getTracks());

    function renderCard(group) {
      var cover = group.tracks.reduce(function (found, t) { return found || t.cover; }, null);
      // Se todas as faixas forem do mesmo artista, mostra o nome dele; senão
      // (compilação, ex.: "Diversas"), mostra "Vários artistas".
      var sameArtist = group.tracks.every(function (t) { return t.artist === group.tracks[0].artist; });
      var artistLabel = sameArtist ? group.tracks[0].artist : 'Vários artistas';
      return dom.el('button', {
        class: 'album-card',
        type: 'button',
        'aria-label': 'Abrir álbum: ' + group.album + ' (' + group.tracks.length + ' faixas)',
        onClick: function () { store.setState({ activeAlbum: group.album }); }
      }, [
        dom.el('div', { class: 'album-card__cover-wrap album-card__cover-wrap--square' }, [
          dom.el('img', {
            class: 'album-card__cover',
            src: cover || 'assets/img/placeholders/music-cover-placeholder.svg',
            alt: '',
            loading: 'lazy'
          }),
          dom.el('span', { class: 'album-card__count' }, [group.tracks.length + ' faixas'])
        ]),
        dom.el('h3', { class: 'album-card__title' }, [group.album]),
        dom.el('p', { class: 'album-card__subtitle' }, [artistLabel])
      ]);
    }

    function render() {
      dom.clear(container);

      var body = groups.length
        ? App.utils.carousel.build(groups.map(renderCard), { label: 'Álbuns da trilha sonora' }).wrapper
        : dom.el('p', { class: 'soundtrack__empty' }, ['Nenhuma faixa cadastrada ainda.']);

      var section = dom.el('section', { class: 'soundtrack', id: 'home-soundtrack', 'aria-label': 'Trilha sonora' }, [
        dom.el('h2', { class: 'section-title' }, ['Trilha Sonora']),
        body
      ]);
      container.appendChild(section);
    }

    function destroy() { dom.clear(container); }

    return { render: render, destroy: destroy };
  }

  App.components = App.components || {};
  App.components.SoundtrackList = SoundtrackList;
})(window.WeddingApp = window.WeddingApp || {});
