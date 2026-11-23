import os
import sys
import zipfile
from PIL import Image, ImageDraw, ImageFont, ImageFilter

FONT_PATH = "/System/Library/Fonts/HelveticaNeue.ttc"
BASE_DIR = "/Users/mustafa/Desktop/cod/KocumBenimMobileApp/app-store-assets"
RAW_DIR = os.path.join(BASE_DIR, "raw")
PROJECT_ROOT = "/Users/mustafa/Desktop/cod/KocumBenimMobileApp"

SCREENS = [
    {
        "id": "01_anasayfa",
        "raw_file": "01_anasayfa.png",
        "badge": "GÜNLÜK ÇALIŞMA PLANI",
        "title": "Kişisel Sınav Rehberin",
        "subtitle": "Günlük odaklanma, soru hedefleri ve akıllı çalışma takibi tek ekranda.",
        "mascot": "assets/images/mascot-wave.png",
        "corner": "right",
    },
    {
        "id": "02_odevlerim",
        "raw_file": "02_odevlerim.png",
        "badge": "GÖREV & ODAKLANMA",
        "title": "Akıllı Görev ve Pomodoro Takibi",
        "subtitle": "Konu çalışma, soru hedefleri ve otomatik tamamlanan odaklanma seansları.",
        "mascot": "assets/images/mascot-happy.png",
        "corner": "left",
    },
    {
        "id": "03_rapor_analiz",
        "raw_file": "03_rapor_analiz.png",
        "badge": "PERFORMANS VE İSTATİSTİK",
        "title": "Detaylı Soru ve Net Analizleri",
        "subtitle": "Ders ve konu bazlı başarı grafikleri ile eksiklerini anında keşfet.",
        "mascot": "assets/images/mascot-think.png",
        "corner": "right",
    },
    {
        "id": "04_kocum_ai",
        "raw_file": "04_kocum_ai.png",
        "badge": "YAPAY ZEKA REHBERLİK",
        "title": "Yapay Zeka Birebir Koçluk",
        "subtitle": "Eksiklerine ve Maarif müfredatına göre kişiselleştirilmiş yönlendirmeler.",
        "mascot": "assets/images/kocum-benim-app-maskot.png",
        "corner": "left",
    },
    {
        "id": "05_sorularim",
        "raw_file": "05_sorularim.png",
        "badge": "ŞİPŞAK SORU ÇÖZÜMÜ",
        "title": "Takıldığın Soruyu Çek, Anında Çöz",
        "subtitle": "Sokratik ipuçları ve çözümlerle takıldığın hiçbir konu kalmasın.",
        "mascot": "assets/images/mascot-think.png",
        "corner": "right",
    },
    {
        "id": "06_profil",
        "raw_file": "06_profil.png",
        "badge": "GELİŞİM VE MOTİVASYON",
        "title": "Seviye, Rozet ve Lig Sistemi",
        "subtitle": "İstikrarlı çalışarak unvanını yükselt, hedeflerine adım adım ulaş.",
        "mascot": "assets/images/mascot-cheer.png",
        "corner": "left",
    },
    {
        "id": "07_derslerim",
        "raw_file": "07_derslerim.png",
        "badge": "GÜNCEL MÜFREDAT",
        "title": "Türkiye Yüzyılı Maarif Modeli",
        "subtitle": "Okulda işlediğin konuları seç, sadece güncel kazanımlarla ilerle.",
        "mascot": "assets/images/mascot-wave.png",
        "corner": "right",
    },
    {
        "id": "08_seviye_yolculugu",
        "raw_file": "08_seviye_yolculugu.png",
        "badge": "OYUNLAŞTIRMA & SEVİYELER",
        "title": "Adım Adım Zirve Yolculuğu",
        "subtitle": "Çalıştıkça XP kazan, yeni karakterlerin ve unvanların kilidini aç.",
        "mascot": "assets/images/mascot-cheer.png",
        "corner": "left",
    },
]

TARGET_SIZES = [
    # Portrait iPhone
    {
        "name": "iphone-6.3-1206x2622",
        "w": 1206,
        "h": 2622,
        "is_landscape": False,
        "is_tablet": False,
        "badge_size": 28,
        "title_size": 76,
        "sub_size": 38,
        "screen_w": 930,
        "bezel": 14,
        "phone_top": 660,
    },
    {
        "name": "iphone-6.1-1179x2556",
        "w": 1179,
        "h": 2556,
        "is_landscape": False,
        "is_tablet": False,
        "badge_size": 27,
        "title_size": 74,
        "sub_size": 37,
        "screen_w": 910,
        "bezel": 14,
        "phone_top": 645,
    },
    {
        "name": "iphone-6.7-1290x2796",
        "w": 1290,
        "h": 2796,
        "is_landscape": False,
        "is_tablet": False,
        "badge_size": 30,
        "title_size": 82,
        "sub_size": 40,
        "screen_w": 990,
        "bezel": 15,
        "phone_top": 700,
    },
    # Portrait iPad
    {
        "name": "ipad-12.9-2048x2732",
        "w": 2048,
        "h": 2732,
        "is_landscape": False,
        "is_tablet": True,
        "badge_size": 36,
        "title_size": 104,
        "sub_size": 50,
        "screen_w": 1120,
        "bezel": 18,
        "phone_top": 660,
    },
    {
        "name": "ipad-13-2064x2752",
        "w": 2064,
        "h": 2752,
        "is_landscape": False,
        "is_tablet": True,
        "badge_size": 37,
        "title_size": 106,
        "sub_size": 51,
        "screen_w": 1130,
        "bezel": 18,
        "phone_top": 665,
    },
    {
        "name": "ipad-duo-2007x2853",
        "w": 2007,
        "h": 2853,
        "is_landscape": False,
        "is_tablet": True,
        "badge_size": 36,
        "title_size": 104,
        "sub_size": 50,
        "screen_w": 1110,
        "bezel": 18,
        "phone_top": 680,
    },
    # Landscape & Marketing Asset Sizes
    {
        "name": "landscape-5244x2950",
        "w": 5244,
        "h": 2950,
        "is_landscape": True,
        "is_tablet": False,
    },
    {
        "name": "landscape-3840x2560",
        "w": 3840,
        "h": 2560,
        "is_landscape": True,
        "is_tablet": False,
    },
    {
        "name": "landscape-3840x1646",
        "w": 3840,
        "h": 1646,
        "is_landscape": True,
        "is_tablet": False,
    },
    {
        "name": "landscape-1920x1280",
        "w": 1920,
        "h": 1280,
        "is_landscape": True,
        "is_tablet": False,
    },
]

def make_gradient(width, height, top_color, bottom_color):
    top_r, top_g, top_b = top_color
    bot_r, bot_g, bot_b = bottom_color
    grad = Image.new("RGBA", (1, height))
    for y in range(height):
        ratio = y / float(height)
        r = int(top_r + (bot_r - top_r) * ratio)
        g = int(top_g + (bot_g - top_g) * ratio)
        b = int(top_b + (bot_b - top_b) * ratio)
        grad.putpixel((0, y), (r, g, b, 255))
    return grad.resize((width, height), Image.Resampling.BILINEAR)

def draw_rounded_mask(width, height, radius):
    ss = 2
    mask = Image.new("L", (width * ss, height * ss), 0)
    draw = ImageDraw.Draw(mask)
    draw.rounded_rectangle([0, 0, width * ss, height * ss], radius=radius * ss, fill=255)
    return mask.resize((width, height), Image.Resampling.LANCZOS)

def wrap_text(text, font, max_width, draw):
    words = text.split()
    lines = []
    current_line = []
    for word in words:
        test_line = " ".join(current_line + [word])
        bbox = draw.textbbox((0, 0), test_line, font=font)
        if bbox[2] - bbox[0] <= max_width or not current_line:
            current_line.append(word)
        else:
            lines.append(" ".join(current_line))
            current_line = [word]
    if current_line:
        lines.append(" ".join(current_line))
    return lines

def render_portrait_banner(spec, target):
    W, H = target["w"], target["h"]
    is_tablet = target["is_tablet"]
    
    # 1. Canvas and Background gradient
    canvas = make_gradient(W, H, (253, 248, 243), (245, 230, 214))
    
    # Subtle ambient warm glows
    glow = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    glow_draw = ImageDraw.Draw(glow)
    if is_tablet:
        glow_draw.ellipse([W//2 - 700, 600, W//2 + 700, 2000], fill=(255, 141, 84, 25))
        glow_draw.ellipse([W//2 - 500, 400, W//2 + 500, 1400], fill=(254, 215, 170, 35))
        blur_rad = 140
    else:
        glow_draw.ellipse([W//2 - 500, 700, W//2 + 500, 1700], fill=(255, 141, 84, 25))
        glow_draw.ellipse([W//2 - 350, 400, W//2 + 350, 1100], fill=(254, 215, 170, 35))
        blur_rad = 100
        
    glow = glow.filter(ImageFilter.GaussianBlur(blur_rad))
    canvas.alpha_composite(glow)
    
    draw = ImageDraw.Draw(canvas)
    
    # 2. Typography
    font_badge = ImageFont.truetype(FONT_PATH, target["badge_size"], index=1)
    font_title = ImageFont.truetype(FONT_PATH, target["title_size"], index=1)
    font_subtitle = ImageFont.truetype(FONT_PATH, target["sub_size"], index=10)
    
    badge_text = spec["badge"]
    title_text = spec["title"]
    subtitle_text = spec["subtitle"]
    
    # Badge Pill
    badge_bbox = draw.textbbox((0, 0), badge_text, font=font_badge)
    btw = badge_bbox[2] - badge_bbox[0]
    bth = badge_bbox[3] - badge_bbox[1]
    bp_x = int(36 if is_tablet else 26)
    bp_y = int(16 if is_tablet else 12)
    bw = btw + bp_x * 2
    bh = bth + bp_y * 2
    bx = (W - bw) // 2
    by = int(130 if is_tablet else (135 * (H / 2622)))
    
    outline_w = 3 if is_tablet else 2
    draw.rounded_rectangle([bx, by, bx + bw, by + bh], radius=bh // 2, fill=(248, 233, 220), outline=(228, 198, 168), width=outline_w)
    tx = bx + (bw - btw) // 2 - badge_bbox[0]
    ty = by + (bh - bth) // 2 - badge_bbox[1]
    draw.text((tx, ty), badge_text, font=font_badge, fill=(185, 71, 24))
    
    # Title
    title_y = by + bh + int(45 if is_tablet else 40)
    max_title_w = int(W * 0.88)
    title_lines = wrap_text(title_text, font_title, max_title_w, draw)
    curr_y = title_y
    for line in title_lines:
        bbox = draw.textbbox((0, 0), line, font=font_title)
        lw = bbox[2] - bbox[0]
        draw.text(((W - lw) // 2 - bbox[0], curr_y), line, font=font_title, fill=(43, 22, 8))
        curr_y += (bbox[3] - bbox[1]) + int(22 if is_tablet else 18)
        
    # Subtitle
    curr_y += int(14 if is_tablet else 10)
    max_sub_w = int(W * 0.82)
    sub_lines = wrap_text(subtitle_text, font_subtitle, max_sub_w, draw)
    for line in sub_lines:
        bbox = draw.textbbox((0, 0), line, font=font_subtitle)
        lw = bbox[2] - bbox[0]
        draw.text(((W - lw) // 2 - bbox[0], curr_y), line, font=font_subtitle, fill=(124, 67, 34))
        curr_y += (bbox[3] - bbox[1]) + int(16 if is_tablet else 14)
        
    # 3. Device Mockup
    phone_top_y = target["phone_top"]
    raw_path = os.path.join(RAW_DIR, spec["raw_file"])
    raw_img = Image.open(raw_path).convert("RGBA")
    
    screen_w = target["screen_w"]
    screen_h = int(screen_w * (raw_img.height / raw_img.width))
    resized_screen = raw_img.resize((screen_w, screen_h), Image.Resampling.LANCZOS)
    
    bezel = target["bezel"]
    frame_w = screen_w + bezel * 2
    frame_h = screen_h + bezel * 2
    frame_x = (W - frame_w) // 2
    frame_y = phone_top_y
    
    # Shadows
    shadow_canvas = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    shadow_draw = ImageDraw.Draw(shadow_canvas)
    
    corner_rad = int(76 if is_tablet else 68)
    screen_rad = int(60 if is_tablet else 52)
    
    # Layer 1: Contact shadow
    s1_blur = int(40 if is_tablet else 32)
    shadow_draw.rounded_rectangle(
        [frame_x + 12, frame_y + 35, frame_x + frame_w - 12, frame_y + frame_h + 35],
        radius=corner_rad,
        fill=(59, 34, 20, 100)
    )
    shadow_1 = shadow_canvas.filter(ImageFilter.GaussianBlur(s1_blur))
    
    # Layer 2: Ambient soft shadow
    ambient_canvas = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    ambient_draw = ImageDraw.Draw(ambient_canvas)
    s2_blur = int(80 if is_tablet else 65)
    ambient_draw.rounded_rectangle(
        [frame_x, frame_y + 55, frame_x + frame_w, frame_y + frame_h + 55],
        radius=corner_rad + 8,
        fill=(43, 22, 8, 65)
    )
    shadow_2 = ambient_canvas.filter(ImageFilter.GaussianBlur(s2_blur))
    
    canvas.alpha_composite(shadow_2)
    canvas.alpha_composite(shadow_1)
    
    # Outer frame
    frame_img = Image.new("RGBA", (frame_w, frame_h), (0, 0, 0, 0))
    frame_draw = ImageDraw.Draw(frame_img)
    # Chassis
    frame_draw.rounded_rectangle([0, 0, frame_w, frame_h], radius=corner_rad, fill=(35, 32, 30))
    # Outer metallic rim
    frame_draw.rounded_rectangle([0, 0, frame_w, frame_h], radius=corner_rad, outline=(85, 78, 74), width=outline_w)
    # Inner screen border
    frame_draw.rounded_rectangle([bezel - 2, bezel - 2, frame_w - bezel + 2, frame_h - bezel + 2], radius=screen_rad + 2, outline=(15, 14, 13), width=2)
    
    # Mask screen
    screen_mask = draw_rounded_mask(screen_w, screen_h, screen_rad)
    frame_img.paste(resized_screen, (bezel, bezel), screen_mask)
    
    # Composite frame
    canvas.paste(frame_img, (frame_x, frame_y), frame_img)
    
    # 4. Mascot Overlay
    mascot_rel = spec.get("mascot")
    if mascot_rel:
        mascot_path = os.path.join(PROJECT_ROOT, mascot_rel)
        if os.path.exists(mascot_path):
            mascot_img = Image.open(mascot_path).convert("RGBA")
            mw = int(820 if is_tablet else (530 * (W / 1206)))
            mh = int(mw * (mascot_img.height / mascot_img.width))
            mascot_resized = mascot_img.resize((mw, mh), Image.Resampling.LANCZOS)
            
            corner = spec.get("corner", "right")
            if corner == "right":
                if is_tablet:
                    mx = frame_x + frame_w - int(mw * 0.42)
                else:
                    mx = frame_x + frame_w - mw + int(60 * (W / 1206))
            else:
                if is_tablet:
                    mx = frame_x - int(mw * 0.58)
                else:
                    mx = frame_x - int(60 * (W / 1206))
                    
            my = H - mh - int(25 * (H / 2622))
            
            # Mascot ground shadow
            m_shadow = Image.new("RGBA", (W, H), (0, 0, 0, 0))
            m_draw = ImageDraw.Draw(m_shadow)
            m_draw.ellipse(
                [mx + int(mw * 0.12), my + mh - int(mh * 0.08), mx + mw - int(mw * 0.12), my + mh + int(mh * 0.05)],
                fill=(43, 22, 8, 130)
            )
            m_shadow = m_shadow.filter(ImageFilter.GaussianBlur(int(26 * (W / 1206))))
            canvas.alpha_composite(m_shadow)
            canvas.paste(mascot_resized, (mx, my), mascot_resized)
            
    return canvas.convert("RGB")

def render_landscape_banner(spec, target):
    W, H = target["w"], target["h"]
    scale = H / 1280.0
    
    # 1. Canvas and Background gradient
    canvas = make_gradient(W, H, (253, 248, 243), (245, 230, 214))
    
    # Ambient warm glow
    glow = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    glow_draw = ImageDraw.Draw(glow)
    glow_draw.ellipse([int(W*0.6) - int(500*scale), H//2 - int(400*scale), int(W*0.6) + int(500*scale), H//2 + int(400*scale)], fill=(255, 141, 84, 30))
    glow_draw.ellipse([int(W*0.25) - int(300*scale), H//2 - int(200*scale), int(W*0.25) + int(300*scale), H//2 + int(200*scale)], fill=(254, 215, 170, 40))
    glow = glow.filter(ImageFilter.GaussianBlur(int(100 * scale)))
    canvas.alpha_composite(glow)
    
    # 2. Layout Proportions
    raw_path = os.path.join(RAW_DIR, spec["raw_file"])
    raw_img = Image.open(raw_path).convert("RGBA")
    
    target_screen_h = int(H * 0.84)
    target_screen_w = int(target_screen_h * (raw_img.width / raw_img.height))
    
    bezel = int(12 * scale)
    frame_w = target_screen_w + bezel * 2
    frame_h = target_screen_h + bezel * 2
    frame_x = W - frame_w - int(W * 0.07)
    frame_y = (H - frame_h) // 2
    
    left_x = int(W * 0.07)
    max_text_w = frame_x - left_x - int(W * 0.05)
    
    # 3. Typography
    badge_size = int(24 * scale)
    title_size = int(58 * scale)
    sub_size = int(28 * scale)
    
    font_badge = ImageFont.truetype(FONT_PATH, badge_size, index=1)
    font_title = ImageFont.truetype(FONT_PATH, title_size, index=1)
    font_subtitle = ImageFont.truetype(FONT_PATH, sub_size, index=10)
    
    draw = ImageDraw.Draw(canvas)
    
    badge_text = spec["badge"]
    title_text = spec["title"]
    subtitle_text = spec["subtitle"]
    
    # Badge Pill
    badge_bbox = draw.textbbox((0, 0), badge_text, font=font_badge)
    btw = badge_bbox[2] - badge_bbox[0]
    bth = badge_bbox[3] - badge_bbox[1]
    bp_x, bp_y = int(22 * scale), int(10 * scale)
    bw = btw + bp_x * 2
    bh = bth + bp_y * 2
    bx = left_x
    by = int(H * 0.14)
    
    outline_w = max(2, int(2.5 * scale))
    draw.rounded_rectangle([bx, by, bx + bw, by + bh], radius=bh // 2, fill=(248, 233, 220), outline=(228, 198, 168), width=outline_w)
    tx = bx + (bw - btw) // 2 - badge_bbox[0]
    ty = by + (bh - bth) // 2 - badge_bbox[1]
    draw.text((tx, ty), badge_text, font=font_badge, fill=(185, 71, 24))
    
    # Title
    title_y = by + bh + int(34 * scale)
    title_lines = wrap_text(title_text, font_title, max_text_w, draw)
    curr_y = title_y
    for line in title_lines:
        bbox = draw.textbbox((0, 0), line, font=font_title)
        draw.text((left_x - bbox[0], curr_y), line, font=font_title, fill=(43, 22, 8))
        curr_y += (bbox[3] - bbox[1]) + int(16 * scale)
        
    # Subtitle
    curr_y += int(14 * scale)
    sub_lines = wrap_text(subtitle_text, font_subtitle, max_text_w, draw)
    for line in sub_lines:
        bbox = draw.textbbox((0, 0), line, font=font_subtitle)
        draw.text((left_x - bbox[0], curr_y), line, font=font_subtitle, fill=(124, 67, 34))
        curr_y += (bbox[3] - bbox[1]) + int(12 * scale)
        
    # 4. Device Mockup on Right
    resized_screen = raw_img.resize((target_screen_w, target_screen_h), Image.Resampling.LANCZOS)
    
    corner_rad = int(58 * scale)
    screen_rad = int(48 * scale)
    
    shadow_canvas = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    shadow_draw = ImageDraw.Draw(shadow_canvas)
    shadow_draw.rounded_rectangle(
        [frame_x + int(15*scale), frame_y + int(25*scale), frame_x + frame_w - int(15*scale), frame_y + frame_h + int(25*scale)],
        radius=corner_rad,
        fill=(59, 34, 20, 110)
    )
    shadow_1 = shadow_canvas.filter(ImageFilter.GaussianBlur(int(28 * scale)))
    
    ambient_canvas = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    ambient_draw = ImageDraw.Draw(ambient_canvas)
    ambient_draw.rounded_rectangle(
        [frame_x, frame_y + int(40*scale), frame_x + frame_w, frame_y + frame_h + int(40*scale)],
        radius=corner_rad + 6,
        fill=(43, 22, 8, 70)
    )
    shadow_2 = ambient_canvas.filter(ImageFilter.GaussianBlur(int(50 * scale)))
    
    canvas.alpha_composite(shadow_2)
    canvas.alpha_composite(shadow_1)
    
    # Outer frame
    frame_img = Image.new("RGBA", (frame_w, frame_h), (0, 0, 0, 0))
    frame_draw = ImageDraw.Draw(frame_img)
    frame_draw.rounded_rectangle([0, 0, frame_w, frame_h], radius=corner_rad, fill=(35, 32, 30))
    frame_draw.rounded_rectangle([0, 0, frame_w, frame_h], radius=corner_rad, outline=(85, 78, 74), width=outline_w)
    frame_draw.rounded_rectangle([bezel - 2, bezel - 2, frame_w - bezel + 2, frame_h - bezel + 2], radius=screen_rad + 2, outline=(15, 14, 13), width=2)
    
    screen_mask = draw_rounded_mask(target_screen_w, target_screen_h, screen_rad)
    frame_img.paste(resized_screen, (bezel, bezel), screen_mask)
    canvas.paste(frame_img, (frame_x, frame_y), frame_img)
    
    # 5. Mascot Placement in Landscape
    mascot_rel = spec.get("mascot")
    if mascot_rel:
        mascot_path = os.path.join(PROJECT_ROOT, mascot_rel)
        if os.path.exists(mascot_path):
            mascot_img = Image.open(mascot_path).convert("RGBA")
            mw = int(640 * scale)
            mh = int(mw * (mascot_img.height / mascot_img.width))
            mascot_resized = mascot_img.resize((mw, mh), Image.Resampling.LANCZOS)
            
            # Position at bottom-left below text
            mx = left_x + int(20 * scale)
            my = H - mh - int(H * 0.04)
            
            # Ground shadow
            m_shadow = Image.new("RGBA", (W, H), (0, 0, 0, 0))
            m_draw = ImageDraw.Draw(m_shadow)
            m_draw.ellipse(
                [mx + int(mw * 0.12), my + mh - int(mh * 0.08), mx + mw - int(mw * 0.12), my + mh + int(mh * 0.05)],
                fill=(43, 22, 8, 130)
            )
            m_shadow = m_shadow.filter(ImageFilter.GaussianBlur(int(28 * scale)))
            canvas.alpha_composite(m_shadow)
            canvas.paste(mascot_resized, (mx, my), mascot_resized)
            
    return canvas.convert("RGB")

def render_banner(spec, target):
    if target["is_landscape"]:
        return render_landscape_banner(spec, target)
    else:
        return render_portrait_banner(spec, target)

def main():
    print("Building App Store and Marketing Assets...")
    out_dirs = {}
    for target in TARGET_SIZES:
        d = os.path.join(BASE_DIR, target["name"])
        os.makedirs(d, exist_ok=True)
        out_dirs[target["name"]] = d
        
    total_images = len(SCREENS) * len(TARGET_SIZES)
    count = 0
    
    for target in TARGET_SIZES:
        t_name = target["name"]
        print(f"\nProcessing tier: {t_name} ({target['w']}x{target['h']})")
        for spec in SCREENS:
            count += 1
            out_filename = f"{spec['id']}.png"
            out_path = os.path.join(out_dirs[t_name], out_filename)
            img = render_banner(spec, target)
            img.save(out_path, quality=95)
            print(f"[{count}/{total_images}] Saved: {t_name}/{out_filename}")
            
    # Create zip bundle
    zip_path = os.path.join(BASE_DIR, "kocumbenim-appstore-bundle.zip")
    print(f"\nPackaging into zip archive: {zip_path}")
    with zipfile.ZipFile(zip_path, "w", zipfile.ZIP_DEFLATED) as zf:
        for root, dirs, files in os.walk(BASE_DIR):
            for file in files:
                if file.endswith(".zip") or file.startswith("."):
                    continue
                file_path = os.path.join(root, file)
                rel_path = os.path.relpath(file_path, BASE_DIR)
                zf.write(file_path, rel_path)
                
    print(f"\nSuccessfully finished! Total bundle size: {os.path.getsize(zip_path) / (1024*1024):.2f} MB")

if __name__ == "__main__":
    main()
