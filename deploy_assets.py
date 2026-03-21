from PIL import Image
import shutil
import os

icon_src = r"C:\Users\skopv\.gemini\antigravity\brain\f92ca70a-32b0-4963-bf5a-f6948a6485ce\acim_app_icon_1774123300721.png"
splash_src = r"C:\Users\skopv\.gemini\antigravity\brain\f92ca70a-32b0-4963-bf5a-f6948a6485ce\mobile_splash_rendered.png"
dest_dir = r"C:\Users\skopv\Documents\ANTYGRAVITY\SKOPVA SPACE\Work\acim-reader"

try:
    shutil.copy(splash_src, os.path.join(dest_dir, "splash.png"))

    img = Image.open(icon_src)
    os.makedirs(os.path.join(dest_dir, "icons"), exist_ok=True)
    img.resize((192, 192), Image.Resampling.LANCZOS).save(os.path.join(dest_dir, "icons", "icon-192.png"))
    img.resize((512, 512), Image.Resampling.LANCZOS).save(os.path.join(dest_dir, "icons", "icon-512.png"))
    img.resize((180, 180), Image.Resampling.LANCZOS).save(os.path.join(dest_dir, "icons", "apple-touch-icon.png"))

    print("ASSETS_DEPLOYED")
except Exception as e:
    print(f"Error: {e}")
