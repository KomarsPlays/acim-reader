import os
from PIL import Image, ImageFilter, ImageOps

dir_path = r"C:\Users\skopv\.gemini\antigravity\brain\f92ca70a-32b0-4963-bf5a-f6948a6485ce"
files = ["media__1774127083690.jpg", "media__1774127089470.png"]

out_splash = r"C:\Users\skopv\Documents\ANTYGRAVITY\SKOPVA SPACE\Work\acim-reader\splash.png"

try:
    for f in files:
        img_path = os.path.join(dir_path, f)
        img = Image.open(img_path).convert("RGB")
        w, h = img.size
        
        # Заставка будет иметь вытянутые пропорции
        if h > w:
            print(f"Processing {f} as splash screen ({w}x{h})...")
            
            # Подгоняем строго под 1080x1920 (кропнет излишки, если пропорция не ровно 9:16)
            resized = ImageOps.fit(img, (1080, 1920), method=Image.Resampling.LANCZOS)
            print("Upscaled to 1080x1920.")
            
            # Применяем улучшение резкости, так как картинка вероятно была меньше 1080 по ширине
            sharpened = resized.filter(ImageFilter.UnsharpMask(radius=2, percent=150, threshold=3))
            
            sharpened.save(out_splash, quality=95)
            print("Perfect splash generated!")
except Exception as e:
    print(f"ERROR: {e}")
