#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Gera data/episodes.json a partir dos vídeos em assets/video/clips — cada
clipe numerado (ex.: "3-Nome do vídeo.mp4") vira um episódio/card, na ordem
do número. Ajuste os títulos/legendas gerados abaixo conforme necessário.

Rode: python tools/build_episodes.py  (a partir da raiz do projeto)
Nunca modifica os arquivos de vídeo.
"""
import os
import re
import json
from urllib.parse import quote

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
VIDEO_DIR = os.path.join(ROOT, "assets", "video", "clips")
DATA_DIR = os.path.join(ROOT, "data")
COVER_IMG = "assets/img/photos/covers/casamento.jpg"
WEDDING_DATE = "2014-09-06"

NUM_RE = re.compile(r"^(\d+)-(.+)\.(mp4|mpg|webm)$", re.IGNORECASE)


def rel_url(abs_path):
    rel = os.path.relpath(abs_path, ROOT).replace("\\", "/")
    return "/".join(quote(seg) for seg in rel.split("/"))


def main():
    files = []
    for fname in os.listdir(VIDEO_DIR):
        m = NUM_RE.match(fname)
        if m:
            files.append((int(m.group(1)), fname, m.group(3).lower()))
    files.sort(key=lambda t: t[0])

    episodes = []
    incompatible = []
    for num, fname, ext in files:
        raw_title = re.sub(r"^\d+-", "", fname)
        raw_title = re.sub(r"\.(mp4|mpg|webm)$", "", raw_title, flags=re.IGNORECASE)

        episodes.append({
            "id": "ep-%02d" % num,
            "order": num,
            "title": "Episódio %d: %s" % (num, raw_title),
            "subtitle": "",
            "cover": COVER_IMG,
            "date": WEDDING_DATE,
            "video": rel_url(os.path.join(VIDEO_DIR, fname)),
            "synopsis": ""
        })
        if ext == "mpg":
            incompatible.append(fname)

    with open(os.path.join(DATA_DIR, "episodes.json"), "w", encoding="utf-8") as f:
        json.dump(episodes, f, ensure_ascii=False, indent=2)

    print("Episódios gerados:", len(episodes))
    if incompatible:
        print("\nATENÇÃO — formato .mpg não roda em nenhum navegador (sem suporte nativo).")
        print("Converta para .mp4 (H.264 + AAC) antes de publicar. Com ffmpeg instalado:")
        for f in incompatible:
            print('  ffmpeg -i "assets/video/clips/%s" -vf yadif -c:v libx264 -preset medium '
                  '-crf 21 -pix_fmt yuv420p -c:a aac -b:a 192k -movflags +faststart '
                  '"assets/video/clips/%s.mp4"' % (f, os.path.splitext(f)[0]))


if __name__ == "__main__":
    main()
