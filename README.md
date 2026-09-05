# Aline & Julio — Nossa História

Site estático, inspirado na experiência visual de plataformas de streaming premium,
dedicado à história de Aline e Julio. 100% HTML/CSS/JS sem frameworks, sem backend, sem
banco de dados — pronto para GitHub Pages.

**Status atual:** abertura cinematográfica, Home estilo streaming (header, hero
com parallax sutil, sinopse, informações da história, categorias, carrosséis de
galeria/episódios, trilha sonora, contador de tempo juntos e encerramento) e
sistema de fotos/vídeos/músicas com conteúdo **real** (1264 fotos, 8 vídeos do
casamento, 113 faixas de música).

## Princípio fundamental

Todo o conteúdo (nomes, datas, textos, fotos, músicas, episódios) vive em
`/data/*.json`. **Nenhuma informação pessoal do casal está no código** — os
arquivos em `assets/js` e `assets/css` não devem precisar ser editados para
atualizar o conteúdo do site.

## Estrutura do projeto

```
/
├── index.html                 # ponto de entrada único (SPA)
├── 404.html                    # redireciona para index.html (necessário no GitHub Pages)
├── favicon.svg
├── .gitignore                  # exclui os originais em alta resolução (ver seção de fotos)
├── assets/
│   ├── css/                    # tokens.css, base.css, layout.css + css por componente
│   ├── js/
│   │   ├── core/                # router, store, dataLoader, eventBus, a11y, musicPlayer
│   │   ├── utils/                # dom, format, imageLoader, transitions, sound, carousel
│   │   ├── components/            # um arquivo por seção da experiência
│   │   └── main.js                # bootstrap da aplicação
│   ├── img/
│   │   ├── placeholders/          # imagens de exemplo (não usadas no conteúdo real)
│   │   ├── social/                 # imagem de compartilhamento (Open Graph)
│   │   ├── icons/                  # favicon PNG e apple-touch-icon
│   │   └── photos/
│   │       ├── full/                # fotos ORIGINAIS em alta resolução (não vai pro Git — ver .gitignore)
│   │       ├── full-web/             # versões otimizadas (~2200px) usadas no lightbox
│   │       ├── thumb/                # miniaturas (~640px) usadas nos carrosséis
│   │       └── covers/               # capa de cada álbum/categoria (~1920px)
│   ├── music/                  # faixas da trilha sonora (MP3), organizadas por pasta/álbum
│   └── video/clips/             # vídeos dos episódios (MP4)
├── data/                     # todo o conteúdo do site, em JSON
│   ├── config.json             # título, descrição, foto de destaque, textos de encerramento
│   ├── couple.json              # nomes, datas (namoro/casamento)
│   ├── synopsis.json            # sinopse, tagline, gêneros
│   ├── categories.json          # categorias/álbuns de fotos
│   ├── gallery.json             # fotos da galeria (1264 itens)
│   ├── episodes.json            # episódios = vídeos do casamento (8 itens)
│   ├── soundtrack.json          # faixas da trilha sonora (113 itens)
│   ├── timeline.json            # não usado na Home atualmente (seção removida)
│   └── people.json              # pessoas importantes (hoje só Giovana; seção removida da Home)
└── tools/                    # scripts Python para reorganizar fotos/vídeos/músicas
    ├── organize_photos.py
    ├── optimize_full.py
    ├── organize_music.py
    ├── build_episodes.py
    └── README.md               # como usar cada script
```

## Como está organizado o conteúdo real

### Fotos → Galeria

As fotos vêm de `assets/img/photos/full/`, onde cada pasta é um álbum/categoria:

| Pasta | Categoria | Fotos |
|---|---|---|
| `1-Onde comecou` | Onde Começou | 6 |
| `2-Meses de namoro` | Meses de Namoro | 22 |
| `3-Viagens` | Viagens | 22 |
| `4-Ensaio Casamento` | Ensaio de Casamento | 134 |
| `5-Casamento` (+ subpastas, exceto `0-Capa`) | Casamento | 950 |
| `6-Ensaio Gestacao` | Ensaio Gestação | 47 |
| `7-Filha` | Giovana | 83 |

Dentro de cada pasta, as fotos são ordenadas pela **data real** (metadado EXIF
de cada foto — não pelo nome do arquivo). A capa de cada álbum é a foto mais
antiga, exceto:
- **Casamento**: usa a foto de `5-Casamento/0-Capa/` (excluída da galeria comum).
- **Ensaio de Casamento**: usa `4-Ensaio Casamento/1-Capa.jpg`.

Gerado por `tools/organize_photos.py` + `tools/optimize_full.py` — veja
`tools/README.md` para reprocessar ao adicionar mais fotos.

**Importante sobre os arquivos originais:** as fotos em `assets/img/photos/full/`
somam ~2,7GB — grande demais para um repositório Git confortável, e o site não
precisa delas diretamente (usa as versões otimizadas). Por isso estão no
`.gitignore` e **não vão para o GitHub**. Mantenha esses originais em backup
separado (HD externo, nuvem) — eles não fazem parte do histórico do repositório.

### Vídeos → Episódios

Os 8 vídeos do casamento, em `assets/video/clips/`, viram os cards da seção
"Episódios" (cada um abre e reproduz o vídeo em `EpisodeDetail.js`). O clipe
"1-Clip Aline e Julio" original estava em `.mpg` (MPEG-2, sem suporte em
nenhum navegador) e foi convertido para `.mp4` (H.264 + AAC) com `ffmpeg`; o
`.mpg` original ficou no `.gitignore`.

### Músicas → Trilha Sonora

As 113 faixas em `assets/music/` (pasta "Diversas" + álbuns completos de
Edson & Hudson e Rosa de Saron) aparecem agrupadas por pasta/álbum na seção
"Trilha Sonora" — um carrossel por álbum, tocando na barra fixa do player
global. Gerado por `tools/organize_music.py`.

## Como editar o conteúdo

- **Nomes e datas do casal** → `data/couple.json` (`relationshipStartDate` =
  início do namoro, `weddingDate` = casamento; alimentam o monograma da
  abertura, o Hero e o contador de tempo juntos).
- **Título, descrição e textos de encerramento do site** → `data/config.json`.
- **Foto de destaque (hero)** → `config.json` → `hero.image` + `hero.alt`
  (caminho direto para um arquivo de imagem — não precisa existir em
  `gallery.json`; hoje aponta para a capa do álbum "Casamento").
- **Sinopse / textos de apresentação** → `data/synopsis.json` (ainda com texto
  de exemplo — combinamos ver isso depois).
- **Fotos** → adicione um objeto em `gallery.json` (ou rode
  `tools/organize_photos.py` de novo depois de adicionar fotos/álbuns em
  `assets/img/photos/full/`). Campos: `type: "photo"`, `categoryIds`, `thumb`,
  `full`, `title`, `alt`, `date`.
- **Vídeos/Episódios** → adicione um objeto em `episodes.json` (ou rode
  `tools/build_episodes.py` depois de adicionar vídeos numerados em
  `assets/video/clips/`, formato **MP4** obrigatório).
- **Trilha sonora** → adicione um objeto em `soundtrack.json` com `id`,
  `title`, `artist`, `album` (grupo/carrossel), `file`, `cover` (opcional),
  `order`; coloque o MP3 em `assets/music/` (ou rode
  `tools/organize_music.py`).
- **Pessoas importantes** → `people.json` (seção removida da Home por ora,
  mas os dados continuam aqui — hoje só Giovana).

Depois de editar qualquer JSON, é só recarregar a página (servida via servidor
local ou GitHub Pages) — nenhuma outra etapa é necessária.

## Como visualizar localmente

O site carrega os dados via `fetch()`, o que exige que a página seja servida por
`http://` — **não** por duplo clique direto no arquivo (`file://`). Isso é uma
restrição de segurança padrão de todo navegador moderno (Chrome, Firefox, Edge),
não uma limitação deste projeto. Se você abrir `index.html` diretamente, o site
detecta essa situação e mostra uma tela explicando o que fazer.

Para rodar localmente, na pasta do projeto:

```bash
# Opção 1 — Python (normalmente já instalado)
python -m http.server 8000

# Opção 2 — Node.js
npx serve .
```

Depois acesse `http://localhost:8000` no navegador.

Alternativa: a extensão **Live Server** do VS Code também funciona perfeitamente.

## Publicando no GitHub Pages

1. Crie um repositório no GitHub e envie estes arquivos para a branch `main`
   (o `.gitignore` já cuida de deixar de fora os originais em alta resolução
   e o `.mpg` — sem eles, o envio é bem mais rápido).
2. Em **Settings → Pages**, defina a origem como a branch `main` (pasta raiz `/`).
3. Aguarde alguns minutos — o site ficará disponível em
   `https://<seu-usuario>.github.io/<nome-do-repositorio>/`.

Nenhuma configuração adicional é necessária: o roteamento é feito por hash
(`#/home`), o que evita qualquer problema com caminhos/subpastas do GitHub Pages,
e todos os caminhos de assets são relativos.

**Atenção ao tamanho do repositório mesmo sem os originais:** mesmo com o
`.gitignore`, o projeto ainda soma centenas de MB (thumbnails + fotos
otimizadas + 113 músicas + 8 vídeos). Isso funciona no GitHub Pages, mas o
push inicial pode demorar um pouco dependendo da sua internet.

## Arquitetura (resumo)

- **Sem build step, sem bundler.** Scripts JS clássicos (não ES modules) carregados
  em ordem via `<script defer>`, usando um namespace global único (`window.WeddingApp`)
  para evitar poluir o escopo global e, ao mesmo tempo, evitar os bloqueios de CORS
  que módulos ES sofrem quando abertos via `file://`.
- **Roteamento** via hash (`core/router.js`) — hoje só `/` (abertura) e `/home`
  (página principal); foto ampliada e detalhe de episódio são overlays controlados
  por estado, não rotas separadas.
- **Estado global mínimo** (`core/store.js`) — padrão pub/sub simples, sem
  dependências externas.
- **Carregamento de imagens**: `loading="lazy"` nativo + `IntersectionObserver`
  (`utils/imageLoader.js`) — a foto otimizada (`full`, ~2200px) só é buscada
  quando o lightbox abre, nunca antes.
- **Centenas de fotos sem travar**: a galeria (`Gallery.js`) renderiza em
  lotes de 24 itens, carregando o próximo lote só quando o usuário rola o
  carrossel até perto do fim (`IntersectionObserver` numa sentinela no final da
  trilha) — o DOM inicial fica pequeno independentemente de quantos itens
  existam em `gallery.json` (hoje, 1264).
- **Carrosséis** (`utils/carousel.js`): scroll nativo (funciona por toque em
  qualquer celular, sem JS extra) e sem barra de rolagem visível em nenhum
  navegador; setas aparecem só no hover em desktop.
- **Lightbox**: contador de posição, título/data, navegação por
  teclado (← →, Esc) e por swipe (toque, mobile), foco preso enquanto aberto.
- **Episódios com vídeo real**: `EpisodeDetail.js` toca o vídeo (`<video controls>`)
  com o pôster do episódio; se o formato não for suportado ou o arquivo faltar,
  mostra um aviso em vez de falhar silenciosamente.
- **Trilha sonora**: motor único (`core/musicPlayer.js`) dono do `<audio>` e de
  toda a lógica de play/pause/próxima/anterior/volume/progresso; a interface é
  dividida em duas partes que só chamam esse motor — a barra fixa
  (`GlobalPlayer.js`, persistente em toda a Home, sobrevive à navegação) e os
  carrosséis agrupados por álbum na seção "Trilha Sonora" (`SoundtrackList.js`).
  Nenhuma chamada a `play()` acontece automaticamente — sempre a partir de um
  clique do usuário, respeitando a política de autoplay dos navegadores sem
  nenhuma tentativa de contorná-la.
- **Acessibilidade**: HTML semântico, `alt` vindo do próprio JSON, foco preso em
  modais (lightbox e detalhe de episódio) com o restante da página marcado
  `inert` enquanto abertos, navegação por teclado, região `aria-live` para
  anúncios, respeito a `prefers-reduced-motion`, contraste revisado (WCAG AA).

## Próximos passos sugeridos

1. Escrever a sinopse/textos de apresentação reais em `data/synopsis.json` e
   decidir a foto/texto principal do Hero com calma (combinamos ver isso depois).
2. Revisar os títulos/legendas gerados automaticamente para fotos e episódios
   (hoje usam o nome do álbum/arquivo — pode personalizar em `gallery.json`/`episodes.json`).
3. Conferir se quer reativar as seções removidas (Momentos, Linha do Tempo,
   Pessoas Importantes) — os componentes continuam no projeto, só não estão
   montados em `HomeScreen.js` (ver comentário nesse arquivo).
