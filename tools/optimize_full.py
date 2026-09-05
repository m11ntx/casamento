#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Gera versões otimizadas (~2200px, JPEG 85) das fotos referenciadas em
data/gallery.json, a partir dos originais, e salva em
assets/img/photos/full-web/<categoria>/<seq>.jpg. Atualiza o campo "full" de
cada entrada para apontar para a versão otimizada em vez do arquivo original.

Rode DEPOIS de tools/organize_photos.py. NUNCA modifica os originais — só lê
deles. Requer Python 3 com Pillow instalado (pip install pillow).
"""
import os
import json
from urllib.parse import quote, unquote
from PIL import Image, ImageOps

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(ROOT, "data")
FULLWEB_DIR = os.path.join(ROOT, "assets", "img", "photos", "full-web")

MAX_DIM = 2200
QUALITY = 85


def rel_url(abs_path):
    rel = os.path.relpath(abs_path, ROOT).replace("\\", "/")
    return "/".join(quote(seg) for seg in rel.split("/"))


def save_resized(src_path, dst_path, max_dim, quality):
    im = ImageOps.exif_transpose(Image.open(src_path)).convert("RGB")
    w, h = im.size
    scale = min(1.0, max_dim / float(max(w, h)))
    if scale < 1.0:
        im = im.resize((max(1, int(w * scale)), max(1, int(h * scale))), Image.LANCZOS)
    os.makedirs(os.path.dirname(dst_path), exist_ok=True)
    im.save(dst_path, "JPEG", quality=quality, optimize=True)


def main():
    gallery_path = os.path.join(DATA_DIR, "gallery.json")
    with open(gallery_path, encoding="utf-8") as f:
        gallery = json.load(f)

    done = 0
    skipped = 0
    for item in gallery:
        if item.get("type") != "photo":
            continue
        src_rel = unquote(item["full"])
        # já otimizada nesta pasta? não reprocessa
        if "/full-web/" in src_rel:
            continue
        src_abs = os.path.join(ROOT, src_rel.replace("/", os.sep))
        if not os.path.isfile(src_abs):
            skipped += 1
            continue
        cat = item["categoryIds"][0]
        seq = item["id"].split("-")[-1]
        dst_abs = os.path.join(FULLWEB_DIR, cat, seq + ".jpg")
        save_resized(src_abs, dst_abs, MAX_DIM, QUALITY)
        item["full"] = rel_url(dst_abs)
        done += 1
        if done % 200 == 0:
            print("...", done, "processadas")

    with open(gallery_path, "w", encoding="utf-8") as f:
        json.dump(gallery, f, ensure_ascii=False, indent=2)

    print("Concluído. Otimizadas:", done, "| puladas (arquivo não encontrado):", skipped)


if __name__ == "__main__":
    main()
