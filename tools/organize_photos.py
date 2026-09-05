#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Organiza as fotos reais de assets/img/photos/full em:
  - data/categories.json
  - data/gallery.json (fotos)
  - capas otimizadas em assets/img/photos/covers/<categoria>.jpg (~1920px)
  - thumbnails em assets/img/photos/thumb/<categoria>/<seq>.jpg (~640px)

NUNCA modifica os arquivos originais em assets/img/photos/full — só lê deles
e escreve arquivos novos em outros lugares.

Como usar:
  1. Rode primeiro RENOMEANDO ou verificando as pastas dentro de
     assets/img/photos/full/ — cada uma vira uma categoria/álbum. Ajuste a
     lista CATEGORIES abaixo se adicionar, remover ou renomear álbuns.
  2. Rode: python tools/organize_photos.py  (a partir da raiz do projeto)
  3. Depois rode tools/optimize_full.py para gerar as versões otimizadas
     usadas no lightbox (o campo "full" do gallery.json).

Requer Python 3 com Pillow instalado (pip install pillow).
"""
import os
import json
import datetime
from urllib.parse import quote
from PIL import Image, ExifTags, ImageOps

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FULL_DIR = os.path.join(ROOT, "assets", "img", "photos", "full")
THUMB_DIR = os.path.join(ROOT, "assets", "img", "photos", "thumb")
COVER_DIR = os.path.join(ROOT, "assets", "img", "photos", "covers")
DATA_DIR = os.path.join(ROOT, "data")

THUMB_MAX = 640
COVER_MAX = 1920
THUMB_QUALITY = 78
COVER_QUALITY = 84

# Uma entrada por pasta dentro de assets/img/photos/full/. "dir" precisa
# bater exatamente com o nome da pasta.
CATEGORIES = [
    {"id": "onde-comecou", "label": "Onde Começou", "color": "#8a3b52", "dir": "1-Onde comecou"},
    {"id": "namoro", "label": "Meses de Namoro", "color": "#c9a15a", "dir": "2-Meses de namoro"},
    {"id": "viagens", "label": "Viagens", "color": "#4d7a8a", "dir": "3-Viagens"},
    {"id": "ensaio-casamento", "label": "Ensaio de Casamento", "color": "#a35d3b", "dir": "4-Ensaio Casamento"},
    {"id": "casamento", "label": "Casamento", "color": "#b3667a", "dir": "5-Casamento"},
    {"id": "ensaio-gestacao", "label": "Ensaio Gestação", "color": "#6fae8c", "dir": "6-Ensaio Gestacao"},
    {"id": "filha", "label": "Giovana", "color": "#d4a5c9", "dir": "7-Filha"},
]

# Arquivo (dentro da própria pasta) a usar como capa, quando não deve ser a
# foto mais antiga por data. "casamento" é tratado à parte (pasta 0-Capa).
EXPLICIT_COVERS = {
    "ensaio-casamento": "1-Capa.jpg",
}

os.makedirs(THUMB_DIR, exist_ok=True)
os.makedirs(COVER_DIR, exist_ok=True)


def rel_url(abs_path):
    rel = os.path.relpath(abs_path, ROOT).replace("\\", "/")
    return "/".join(quote(seg) for seg in rel.split("/"))


def exif_date(path):
    try:
        im = Image.open(path)
        exif = im._getexif()
        if exif:
            for tag, val in exif.items():
                if ExifTags.TAGS.get(tag, tag) == "DateTimeOriginal":
                    return datetime.datetime.strptime(val, "%Y:%m:%d %H:%M:%S")
    except Exception:
        pass
    return datetime.datetime.fromtimestamp(os.path.getmtime(path))


def save_resized(src_path, dst_path, max_dim, quality):
    im = ImageOps.exif_transpose(Image.open(src_path)).convert("RGB")
    w, h = im.size
    scale = min(1.0, max_dim / float(max(w, h)))
    if scale < 1.0:
        im = im.resize((max(1, int(w * scale)), max(1, int(h * scale))), Image.LANCZOS)
    os.makedirs(os.path.dirname(dst_path), exist_ok=True)
    im.save(dst_path, "JPEG", quality=quality, optimize=True)


def list_photos(dir_path):
    out = []
    for root, dirs, files in os.walk(dir_path):
        for f in files:
            if f.lower().endswith((".jpg", ".jpeg")):
                out.append(os.path.join(root, f))
    return out


def main():
    gallery_entries = []
    categories_out = []

    for cat in CATEGORIES:
        cat_id = cat["id"]
        cat_dir = os.path.join(FULL_DIR, cat["dir"])
        categories_out.append({"id": cat_id, "label": cat["label"], "color": cat["color"]})

        if cat_id == "casamento":
            capa_dir = os.path.join(cat_dir, "0-Capa")
            capa_files = [os.path.join(capa_dir, f) for f in os.listdir(capa_dir)] if os.path.isdir(capa_dir) else []
            capa_path = capa_files[0] if capa_files else None
            photo_paths = [p for p in list_photos(cat_dir) if os.path.dirname(p) != capa_dir]
        else:
            photo_paths = list_photos(cat_dir)
            capa_path = None
            explicit = EXPLICIT_COVERS.get(cat_id)
            if explicit:
                candidate = os.path.join(cat_dir, explicit)
                if os.path.isfile(candidate):
                    capa_path = candidate

        dated = sorted(((exif_date(p), p) for p in photo_paths), key=lambda t: t[0])

        seq = 0
        for dt, p in dated:
            seq += 1
            thumb_path = os.path.join(THUMB_DIR, cat_id, "%03d.jpg" % seq)
            save_resized(p, thumb_path, THUMB_MAX, THUMB_QUALITY)
            gallery_entries.append({
                "id": "%s-%03d" % (cat_id, seq),
                "type": "photo",
                "categoryIds": [cat_id],
                "thumb": rel_url(thumb_path),
                "full": rel_url(p),  # rode tools/optimize_full.py depois para otimizar isto
                "alt": "Aline e Julio — %s" % cat["label"],
                "title": cat["label"],
                "date": dt.strftime("%Y-%m-%d")
            })

        cover_source = capa_path or (dated[0][1] if dated else None)
        if cover_source:
            save_resized(cover_source, os.path.join(COVER_DIR, cat_id + ".jpg"), COVER_MAX, COVER_QUALITY)

        print(cat_id, "->", len(dated), "fotos")

    with open(os.path.join(DATA_DIR, "categories.json"), "w", encoding="utf-8") as f:
        json.dump(categories_out, f, ensure_ascii=False, indent=2)
    with open(os.path.join(DATA_DIR, "gallery.json"), "w", encoding="utf-8") as f:
        json.dump(gallery_entries, f, ensure_ascii=False, indent=2)

    print("\nTotal de fotos no gallery.json:", len(gallery_entries))
    print("Lembrete: rode tools/optimize_full.py em seguida.")


if __name__ == "__main__":
    main()
