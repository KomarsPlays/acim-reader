from PIL import Image

try:
    img = Image.open(r"C:\Users\skopv\Documents\ANTYGRAVITY\SKOPVA SPACE\Work\acim-reader\icons\apple-touch-icon.png")
    print(f"Format: {img.format}, Mode: {img.mode}, Size: {img.size}")
    if img.mode == 'RGBA':
        extrema = img.getextrema()
        if extrema[3][0] < 255:
            print("WARNING: Image has transparency! iOS hates this.")
        else:
            print("Image is fully opaque.")
    else:
        print("Image is opaque (no alpha channel).")
except Exception as e:
    print(e)
