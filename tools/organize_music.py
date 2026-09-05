#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Organiza assets/music/ em data/soundtrack.json, preservando o agrupamento em
pastas (cada pasta de álbum vira um grupo na seção "Trilha Sonora").

Estrutura esperada em assets/music/:
  Diversas/Artista - Título.mp3            (faixas soltas, artista variado)
  <Artista>/<Álbum>/NN faixa.mp3           (álbuns completos, uma pasta por artista/álbum)

Ajuste ARTIST_FOLDERS e DIVERSAS_OVERRIDES abaixo conforme necessário.
Rode: python tools/organize_music.py  (a partir da raiz do projeto)
Nunca modifica os arquivos de música.
"""
import os
import re
import json
from urllib.parse import quote

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MUSIC_DIR = os.path.join(ROOT, "assets", "music")
DATA_DIR = os.path.join(ROOT, "data")

TRACK_NUM_RE = re.compile(r"^\s*(\d+)[\.\s\-]*\s*")

# pasta-artista -> nome canônico do artista (corrige variações tipo "e"/"&")
ARTIST_FOLDERS = {
    "Edson e Hudson": "Edson & Hudson",
    "Rosa de Saron": "Rosa de Saron",
}

DIVERSAS_OVERRIDES = {
    "I Won't Give Up (traducao) - Jason Mraz.mp3": ("Jason Mraz", "I Won't Give Up (tradução)"),
}


def rel_url(abs_path):
    rel = os.path.relpath(abs_path, ROOT).replace("\\", "/")
    return "/".join(quote(seg) for seg in rel.split("/"))


def parse_track_number(name):
    m = TRACK_NUM_RE.match(name)
    if m:
        return TRACK_NUM_RE.sub("", name, count=1)
    return name


def main():
    tracks = []
    order = 0

    diversas_dir = os.path.join(MUSIC_DIR, "Diversas")
    if os.path.isdir(diversas_dir):
        for fname in sorted(f for f in os.listdir(diversas_dir) if f.lower().endswith(".mp3")):
            order += 1
            stem = fname[:-4]
            if fname in DIVERSAS_OVERRIDES:
                artist, title = DIVERSAS_OVERRIDES[fname]
            elif " - " in stem:
                artist, title = stem.split(" - ", 1)
            else:
                artist, title = "", stem
            tracks.append({
                "id": "track-%03d" % order, "title": title.strip(), "artist": artist.strip(),
                "album": "Diversas", "file": rel_url(os.path.join(diversas_dir, fname)),
                "cover": None, "order": order
            })

    for folder, artist_name in ARTIST_FOLDERS.items():
        artist_dir = os.path.join(MUSIC_DIR, folder)
        if not os.path.isdir(artist_dir):
            continue
        for album in sorted(os.listdir(artist_dir)):
            album_dir = os.path.join(artist_dir, album)
            if not os.path.isdir(album_dir):
                continue
            cover_path = None
            for cover_name in ("Folder.jpg", "folder.jpg", "cover.jpg", "Cover.jpg"):
                if os.path.isfile(os.path.join(album_dir, cover_name)):
                    cover_path = rel_url(os.path.join(album_dir, cover_name))
                    break
            for fname in sorted(f for f in os.listdir(album_dir) if f.lower().endswith(".mp3")):
                order += 1
                stem = fname[:-4]
                rest = parse_track_number(stem).strip(" .-")
                rest = re.sub(r"^%s\s*-\s*" % re.escape(artist_name), "", rest, flags=re.IGNORECASE)
                rest = re.sub(r"\s*-\s*%s\s*$" % re.escape(artist_name), "", rest, flags=re.IGNORECASE)
                tracks.append({
                    "id": "track-%03d" % order, "title": rest.strip(), "artist": artist_name,
                    "album": album, "file": rel_url(os.path.join(album_dir, fname)),
                    "cover": cover_path, "order": order
                })

    with open(os.path.join(DATA_DIR, "soundtrack.json"), "w", encoding="utf-8") as f:
        json.dump(tracks, f, ensure_ascii=False, indent=2)

    print("Total de faixas:", len(tracks))


if __name__ == "__main__":
    main()
