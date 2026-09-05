# Ferramentas de organização

Scripts Python usados para gerar o conteúdo do site a partir dos arquivos
brutos (fotos, vídeos, músicas). Não são carregados pelo site — são só para
você rodar de novo quando adicionar mais conteúdo. Nunca modificam os
arquivos originais, só leem deles e escrevem os resultados em `data/*.json`
e em pastas novas dentro de `assets/`.

Requer Python 3 com Pillow instalado:
```
pip install pillow
```

Rode sempre a partir da raiz do projeto (a pasta que tem o `index.html`).

## Fotos

```
python tools/organize_photos.py   # lê assets/img/photos/full/<álbum>/...
python tools/optimize_full.py     # gera as versões leves usadas no lightbox
```

`organize_photos.py` varre cada pasta dentro de `assets/img/photos/full/`
(uma pasta = uma categoria/álbum), ordena as fotos pela data real (EXIF, com
o nome do arquivo como último recurso) e gera `data/categories.json` e
`data/gallery.json`, além das miniaturas (`assets/img/photos/thumb/`) e da
capa de cada álbum (`assets/img/photos/covers/`). Para adicionar um álbum
novo: crie a pasta, adicione uma entrada em `CATEGORIES` no topo do script,
rode os dois scripts de novo.

`optimize_full.py` gera versões redimensionadas (~2200px) das fotos para uso
no lightbox, em `assets/img/photos/full-web/`, evitando que o site carregue
os arquivos originais em alta resolução (que podem ser dezenas de MB cada).

## Vídeos → Episódios

```
python tools/build_episodes.py    # lê assets/video/clips/*.mp4
```

Cada vídeo numerado (`"3-Nome.mp4"`) vira um card na seção Episódios, na
ordem do número. Gera `data/episodes.json` do zero — se você já personalizou
títulos/legendas manualmente, edite o JSON depois de rodar, ou ajuste antes
de rodar de novo.

Se aparecer um aviso sobre arquivo `.mpg`: nenhum navegador reproduz esse
formato — o script já sugere o comando `ffmpeg` para converter para `.mp4`.

## Músicas → Trilha Sonora

```
python tools/organize_music.py    # lê assets/music/...
```

Espera duas formas de organização dentro de `assets/music/`:
- `Diversas/Artista - Título.mp3` — faixas soltas, artista variado.
- `<Nome do Artista>/<Álbum>/NN Faixa.mp3` — álbuns completos.

Gera `data/soundtrack.json` do zero, com o campo `album` preservando o
agrupamento por pasta (exibido como um carrossel por álbum na Home). Ajuste
`ARTIST_FOLDERS` no topo do script se adicionar um artista/pasta novo.
