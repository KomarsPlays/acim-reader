import os
from PIL import Image

in_avatar = r"C:\Users\skopv\.gemini\antigravity\brain\f92ca70a-32b0-4963-bf5a-f6948a6485ce\media__1774127089470.png"
work_dir = r"C:\Users\skopv\Documents\ANTYGRAVITY\SKOPVA SPACE\Work\acim-reader"

try:
    img_avatar = Image.open(in_avatar).convert("RGBA")
    
    # Чтобы iOS и Android не обрезали "тик-в-тик" нарисованный логотип своими системными масками (squircle),
    # нам нужно программно создать "безопасную зону" (safe area padding) в 15% от краев.
    
    # 1. Android иконки (сохраняем прозрачный фон, маска ОС отрежет прозрачные края)
    for size, name in [(192, "icon-app-192.png"), (512, "icon-app-512.png")]:
        canvas = Image.new("RGBA", (size, size), (0, 0, 0, 0)) # Прозрачный холст
        safe_size = int(size * 0.82) # 82% полезной площади, 18% - отступы
        resized = img_avatar.resize((safe_size, safe_size), Image.Resampling.LANCZOS)
        offset = (size - safe_size) // 2
        canvas.paste(resized, (offset, offset), resized) # Вклеиваем с сохранением альфы
        canvas.save(os.path.join(work_dir, "icons", name))

    # 2. Apple иконка (без альфа-канала, фон FAF7F2)
    ap_size = 180
    bg = Image.new("RGBA", (ap_size, ap_size), (250, 247, 242, 255)) # FAF7F2
    safe_size = int(ap_size * 0.82)
    resized = img_avatar.resize((safe_size, safe_size), Image.Resampling.LANCZOS)
    offset = (ap_size - safe_size) // 2
    bg.paste(resized, (offset, offset), resized)
    apple_out = bg.convert("RGB")
    apple_out.save(os.path.join(work_dir, "icons", "icon-app-180.png"))

    print("AVATAR PADDED AND SAVED")

except Exception as e:
    print(f"ERROR: {e}")
