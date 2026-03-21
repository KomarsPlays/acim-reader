import os
from PIL import Image, ImageOps, ImageDraw, ImageFont

img_path = r"C:\Users\skopv\.gemini\antigravity\brain\f92ca70a-32b0-4963-bf5a-f6948a6485ce\blank_book_cover_1774124956025.png"
out_path = r"C:\Users\skopv\Documents\ANTYGRAVITY\SKOPVA SPACE\Work\acim-reader\splash.png"

try:
    img = Image.open(img_path).convert("RGB")
    w, h = img.size

    # Создаём холст для мобильного формата (9:16)
    target_w = w
    target_h = int(w * 16 / 9)
    out = Image.new("RGB", (target_w, target_h))

    # Размер угловой рамки "шапки" и "подвала" (20% от высоты)
    slice_h = int(h * 0.25)
    
    top = img.crop((0, 0, w, slice_h))
    bottom = img.crop((0, h - slice_h, w, h))

    # Вырезаем тайл из середины (высотой 5% от высоты), чтобы забить его в разрыв
    tile_h = max(slice_h // 2, 2)
    # берём тайл чуть ниже верхней шапки
    tile = img.crop((0, slice_h, w, slice_h + tile_h))
    tile_flipped = ImageOps.flip(tile)

    # вставляем макушку
    out.paste(top, (0, 0))
    # вставляем дно
    out.paste(bottom, (0, target_h - slice_h))

    # тайлим разрыв, чередуя нормальный и отзеркаленный (для бесшовности)
    curr_y = slice_h
    use_flipped = False
    while curr_y < (target_h - slice_h):
        t = tile_flipped if use_flipped else tile
        # Не вылезаем за подвал
        h_to_paste = min(tile_h, target_h - slice_h - curr_y)
        if h_to_paste < tile_h:
            t = t.crop((0, 0, w, h_to_paste))
            
        out.paste(t, (0, curr_y))
        curr_y += tile_h
        use_flipped = not use_flipped

    # ПИШЕШЬ ТЕКСТ "КЧ" и "Учебник для студентов"
    draw = ImageDraw.Draw(out)
    
    # Пытаемся взять классические шрифты Windows
    font_files = ["georgiab.ttf", "timesbd.ttf", "arialbd.ttf"]
    font_big = None
    font_small = None
    
    for f in font_files:
        try:
            font_big = ImageFont.truetype(f, int(target_w * 0.25))
            font_small = ImageFont.truetype(f, int(target_w * 0.05))
            break
        except Exception:
            pass
            
    if font_big and font_small:
        gold_color = (212, 163, 115) # D4A373
        
        # Рендерим "КЧ" по центру (чуть выше середины)
        text1 = "КЧ"
        bbox1 = draw.textbbox((0, 0), text1, font=font_big)
        tw1, th1 = bbox1[2] - bbox1[0], bbox1[3] - bbox1[1]
        x1 = (target_w - tw1) // 2
        y1 = (target_h // 2) - th1 - int(target_h * 0.05)
        
        # Рендерим тень и текст
        draw.text((x1 + 4, y1 + 4), text1, fill=(0, 0, 0, 150), font=font_big)
        draw.text((x1, y1), text1, fill=gold_color, font=font_big)
        
        # Рендерим "Учебник для студентов"
        text2 = "Учебник для студентов"
        bbox2 = draw.textbbox((0, 0), text2, font=font_small)
        tw2, th2 = bbox2[2] - bbox2[0], bbox2[3] - bbox2[1]
        x2 = (target_w - tw2) // 2
        y2 = y1 + th1 + int(target_h * 0.04)
        
        draw.text((x2 + 2, y2 + 2), text2, fill=(0, 0, 0, 150), font=font_small)
        draw.text((x2, y2), text2, fill=gold_color, font=font_small)
        
    out.save(out_path, quality=100)
    print("SUCCESS")
except Exception as e:
    print(f"ERROR: {e}")
