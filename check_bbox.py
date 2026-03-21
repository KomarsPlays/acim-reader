from PIL import Image, ImageChops

img_path = r"C:\Users\skopv\.gemini\antigravity\brain\f92ca70a-32b0-4963-bf5a-f6948a6485ce\tall_book_cover_1774124659443.png"
img = Image.open(img_path).convert("RGB")
w, h = img.size

# Ищем границы: всё, что не близко к белому цвету (255, 255, 255)
bg = Image.new("RGB", img.size, (255, 255, 255))
diff = ImageChops.difference(img, bg)
bbox = diff.getbbox()

print(f"Original size: {w}x{h}")
if bbox:
    bw = bbox[2] - bbox[0]
    bh = bbox[3] - bbox[1]
    print(f"Book bbox: {bbox}")
    print(f"Book dimensions: {bw}x{bh} (Aspect ratio: {bw/bh:.2f})")
    print(f"Target 9:16 width for {bh} height is: {int(bh * 9 / 16)}")
else:
    print("No non-white pixels found!")
