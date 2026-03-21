import os
from PIL import Image

in_splash = r"C:\Users\skopv\.gemini\antigravity\brain\f92ca70a-32b0-4963-bf5a-f6948a6485ce\media__1774127462469.jpg"
in_avatar = r"C:\Users\skopv\.gemini\antigravity\brain\f92ca70a-32b0-4963-bf5a-f6948a6485ce\media__1774127089470.png"
work_dir = r"C:\Users\skopv\Documents\ANTYGRAVITY\SKOPVA SPACE\Work\acim-reader"

try:
    # 1. ЗАСТАВКА: сохраним её ИМЕННО в тех пропорциях, что дала Саша. 
    # Не будем жестко кропать в 9:16. Просто подгоним размер без обрезки.
    img_splash = Image.open(in_splash).convert("RGB")
    # Пропорциональное изменение размера (чтобы макс. сторона была 1920)
    img_splash.thumbnail((1080, 1920), Image.Resampling.LANCZOS)
    img_splash.save(os.path.join(work_dir, "splash.png"), quality=100)
    print("SPLASH RESIZED PROPORTIONALLY")

    # 2. АВАТАР: исправляем прозрачность и маски.
    img_avatar = Image.open(in_avatar).convert("RGBA")
    
    # Для Android манифеста (оставляем прозрачность, PWA-маски уберем в json)
    img_avatar.resize((192, 192), Image.Resampling.LANCZOS).save(os.path.join(work_dir, "icons", "icon-app-192.png"))
    img_avatar.resize((512, 512), Image.Resampling.LANCZOS).save(os.path.join(work_dir, "icons", "icon-app-512.png"))

    # Для APPLE (iOS): они ненавидят прозрачность (заливают черным и сжимают). 
    # Сделаем подложку цвета FAF7F2 (фон приложения)
    bg = Image.new("RGBA", img_avatar.size, (250, 247, 242, 255)) # FAF7F2 (Слоновая кость)
    apple_avatar = Image.alpha_composite(bg, img_avatar).convert("RGB")
    apple_avatar.resize((180, 180), Image.Resampling.LANCZOS).save(os.path.join(work_dir, "icons", "icon-app-180.png"))
    print("AVATAR FIXED FOR APPLE AND ANDROID")

except Exception as e:
    print(f"ERROR: {e}")
