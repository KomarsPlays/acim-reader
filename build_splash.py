from PIL import Image, ImageFilter
import os

try:
    img_path = r"C:\Users\skopv\.gemini\antigravity\brain\f92ca70a-32b0-4963-bf5a-f6948a6485ce\acim_splash_center_1774123172204.png"
    img = Image.open(img_path)

    # Создаём фон: растягиваем до полного размера телефона и сильно размываем
    bg_img = img.resize((1080, 1920), Image.Resampling.LANCZOS)
    bg_img = bg_img.filter(ImageFilter.GaussianBlur(60))

    # Слегка затемняем фон для контраста
    bg_img = bg_img.point(lambda p: p * 0.7)

    # Ресайзим основную книгу, чтобы она была по центру с отступами
    size = 900
    img_resized = img.resize((size, size), Image.Resampling.LANCZOS)
    
    # Смягчаем края основной картинки для плавного перехода (опционально, но сделаем просто паст)
    # Накладываем в центр
    offset = ((1080 - size) // 2, (1920 - size) // 2)
    bg_img.paste(img_resized, offset)

    out_path = r"C:\Users\skopv\.gemini\antigravity\brain\f92ca70a-32b0-4963-bf5a-f6948a6485ce\mobile_splash_rendered.png"
    bg_img.save(out_path)
    print("SUCCESS")
except Exception as e:
    print(f"ERROR: {e}")
