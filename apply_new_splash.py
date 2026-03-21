from PIL import Image, ImageOps

in_path = r"C:\Users\skopv\.gemini\antigravity\brain\f92ca70a-32b0-4963-bf5a-f6948a6485ce\media__1774127462469.jpg"
out_path = r"C:\Users\skopv\Documents\ANTYGRAVITY\SKOPVA SPACE\Work\acim-reader\splash.png"

try:
    img = Image.open(in_path).convert("RGB")
    # Гарантируем идеальный PWA размер без искажений (режет строго по центру пропорцию 9:16)
    img = ImageOps.fit(img, (1080, 1920), method=Image.Resampling.LANCZOS)
    img.save(out_path, quality=100)
    print("SPLASH_APPLIED")
except Exception as e:
    print(f"ERROR: {e}")
