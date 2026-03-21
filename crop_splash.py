from PIL import Image

img_path = r"C:\Users\skopv\.gemini\antigravity\brain\f92ca70a-32b0-4963-bf5a-f6948a6485ce\tall_book_cover_1774124659443.png"
out_path = r"C:\Users\skopv\Documents\ANTYGRAVITY\SKOPVA SPACE\Work\acim-reader\splash.png"

img = Image.open(img_path).convert("RGB")
w, h = img.size

# Мы сгенерировали узкую книгу по центру белого квадрата 1024x1024
# Формат мобильного экрана 9:16. Высота = 1024, ширина нужна 1024 * 9 / 16 = 576
target_w = int(h * 9 / 16)
left = (w - target_w) // 2

cropped = img.crop((left, 0, left + target_w, h))
cropped.save(out_path, quality=100)
print(f"Обрезано до {target_w}x{h} и сохранено в splash.png")
