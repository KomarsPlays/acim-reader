import os
from PIL import Image

in_avatar = r"C:\Users\skopv\.gemini\antigravity\brain\f92ca70a-32b0-4963-bf5a-f6948a6485ce\media__1774127089470.png"
icons_dir = r"C:\Users\skopv\Documents\ANTYGRAVITY\SKOPVA SPACE\Work\acim-reader\icons"

try:
    img = Image.open(in_avatar).convert("RGBA")
    
    # Перезаписываем те самые новые переименованные файлы, чтобы туда легла твоя круглая иконка
    img.resize((180, 180), resample=Image.Resampling.LANCZOS).save(os.path.join(icons_dir, "icon-app-180.png"))
    img.resize((192, 192), resample=Image.Resampling.LANCZOS).save(os.path.join(icons_dir, "icon-app-192.png"))
    img.resize((512, 512), resample=Image.Resampling.LANCZOS).save(os.path.join(icons_dir, "icon-app-512.png"))
    print("AVATAR UPDATED LOCALLY")
except Exception as e:
    print(f"Error: {e}")
