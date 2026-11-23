import os
import zipfile
from PIL import Image, ImageDraw, ImageFont, ImageFilter

FONT_PATH = "/System/Library/Fonts/HelveticaNeue.ttc"
RAW_DIR = "/Users/mustafa/Desktop/cod/KocumBenimMobileApp/app-store-assets/raw"
PROJECT_ROOT = "/Users/mustafa/Desktop/cod/KocumBenimMobileApp"
OUTPUT_DIR = "/Users/mustafa/Desktop/cod/KocumBenimMobileApp/app-store-assets/showcase-banners"
os.makedirs(OUTPUT_DIR, exist_ok=True)

BANNER_SIZES = [
    {
        "id": "search-result-5244x2950",
        "title_badge": "SEARCH RESULT BANNER",
        "w": 5244,
        "h": 2950,
        "phone_h_ratio": 0.72,
    },
    {
        "id": "header-5244x2950",
        "title_badge": "APP STORE HEADER",
        "w": 5244,
        "h": 2950,
        "phone_h_ratio": 0.72,
    },
    {
        "id": "header-3840x1646",
        "title_badge": "APP STORE HEADER ULTRAWIDE",
        "w": 3840,
        "h": 1646,
        "phone_h_ratio": 0.78,
    },
    {
        "id": "search-3840x2560",
        "title_badge": "SEARCH RESULT 3:2",
        "w": 3840,
        "h": 2560,
        "phone_h_ratio": 0.72,
    },
    {
        "id": "search-1920x1280",
        "title_badge": "SEARCH RESULT STANDARD",
        "w": 1920,
        "h": 1280,
        "phone_h_ratio": 0.72,
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

def build_phone_mockup(raw_image_path, target_h):
    raw_img = Image.open(raw_image_path).convert("RGBA")
    screen_h = target_h
    screen_w = int(screen_h * (raw_img.width / raw_img.height))
    resized_screen = raw_img.resize((screen_w, screen_h), Image.Resampling.LANCZOS)
    
    bezel = max(8, int(screen_h * 0.012))
    frame_w = screen_w + bezel * 2
    frame_h = screen_h + bezel * 2
    
    corner_rad = int(frame_w * 0.16)
    screen_rad = int(screen_w * 0.14)
    outline_w = max(2, int(screen_h * 0.003))
    
    frame_img = Image.new("RGBA", (frame_w, frame_h), (0, 0, 0, 0))
    frame_draw = ImageDraw.Draw(frame_img)
    frame_draw.rounded_rectangle([0, 0, frame_w, frame_h], radius=corner_rad, fill=(32, 29, 28))
    frame_draw.rounded_rectangle([0, 0, frame_w, frame_h], radius=corner_rad, outline=(85, 78, 74), width=outline_w)
    frame_draw.rounded_rectangle([bezel - 2, bezel - 2, frame_w - bezel + 2, frame_h - bezel + 2], radius=screen_rad + 2, outline=(15, 14, 13), width=2)
    
    screen_mask = draw_rounded_mask(screen_w, screen_h, screen_rad)
    frame_img.paste(resized_screen, (bezel, bezel), screen_mask)
    return frame_img

def paste_rotated_with_shadow(canvas, img, center_x, center_y, angle, shadow_blur=40, shadow_offset=(0, 35), shadow_alpha=110):
    rotated = img.rotate(angle, resample=Image.Resampling.BICUBIC, expand=True)
    rw, rh = rotated.size
    
    alpha = rotated.split()[3]
    s_img = Image.new("RGBA", (rw, rh), (43, 22, 8, shadow_alpha))
    s_img.putalpha(alpha)
    
    pad = shadow_blur * 2
    padded_s = Image.new("RGBA", (rw + pad * 2, rh + pad * 2), (0, 0, 0, 0))
    padded_s.paste(s_img, (pad, pad))
    blurred_shadow = padded_s.filter(ImageFilter.GaussianBlur(shadow_blur))
    
    tl_x = int(center_x - rw // 2)
    tl_y = int(center_y - rh // 2)
    
    sx = tl_x - pad + shadow_offset[0]
    sy = tl_y - pad + shadow_offset[1]
    canvas.alpha_composite(blurred_shadow, (sx, sy))
    canvas.alpha_composite(rotated, (tl_x, tl_y))

def render_showcase(cfg):
    W, H = cfg["w"], cfg["h"]
    scale = H / 2950.0
    is_ultrawide = (W / H) > 2.0
    
    # 1. Background Canvas
    canvas = make_gradient(W, H, (253, 248, 243), (245, 230, 214))
    
    # Ambient warm glows
    glow = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    glow_draw = ImageDraw.Draw(glow)
    glow_draw.ellipse([int(W*0.70) - int(1000*scale), H//2 - int(900*scale), int(W*0.70) + int(1000*scale), H//2 + int(900*scale)], fill=(255, 141, 84, 35))
    glow_draw.ellipse([int(W*0.25) - int(700*scale), H//2 - int(600*scale), int(W*0.25) + int(700*scale), H//2 + int(600*scale)], fill=(254, 215, 170, 45))
    glow = glow.filter(ImageFilter.GaussianBlur(int(200 * scale)))
    canvas.alpha_composite(glow)
    
    # 2. Right Side: Fanned Cards Mockups (Shifted right for safety margin)
    phone_h = int(H * cfg["phone_h_ratio"])
    phone_anasayfa = build_phone_mockup(os.path.join(RAW_DIR, "01_anasayfa.png"), phone_h)
    phone_rapor = build_phone_mockup(os.path.join(RAW_DIR, "03_rapor_analiz.png"), int(phone_h * 0.92))
    phone_kocum = build_phone_mockup(os.path.join(RAW_DIR, "04_kocum_ai.png"), int(phone_h * 0.95))
    phone_soru = build_phone_mockup(os.path.join(RAW_DIR, "05_sorularim.png"), int(phone_h * 0.90))
    
    right_center_x = int(W * (0.76 if is_ultrawide else 0.74))
    right_center_y = int(H * 0.52)
    
    # Card 1: Back-left (Rapor)
    paste_rotated_with_shadow(
        canvas, phone_rapor,
        center_x=right_center_x - int(760 * scale),
        center_y=right_center_y + int(60 * scale),
        angle=11,
        shadow_blur=int(45 * scale),
        shadow_offset=(int(-10 * scale), int(45 * scale)),
        shadow_alpha=120
    )
    
    # Card 2: Back-right (Soru)
    paste_rotated_with_shadow(
        canvas, phone_soru,
        center_x=right_center_x + int(760 * scale),
        center_y=right_center_y + int(80 * scale),
        angle=-12,
        shadow_blur=int(45 * scale),
        shadow_offset=(int(10 * scale), int(45 * scale)),
        shadow_alpha=120
    )
    
    # Card 3: Middle-right (Koçum AI)
    paste_rotated_with_shadow(
        canvas, phone_kocum,
        center_x=right_center_x + int(420 * scale),
        center_y=right_center_y + int(30 * scale),
        angle=-5,
        shadow_blur=int(55 * scale),
        shadow_offset=(int(5 * scale), int(50 * scale)),
        shadow_alpha=130
    )
    
    # Card 4: Front center (Anasayfa)
    paste_rotated_with_shadow(
        canvas, phone_anasayfa,
        center_x=right_center_x - int(120 * scale),
        center_y=right_center_y - int(20 * scale),
        angle=3,
        shadow_blur=int(75 * scale),
        shadow_offset=(int(0 * scale), int(60 * scale)),
        shadow_alpha=150
    )
    
    # 3. Left Side: Brand, Slogan, Description & Mascot
    draw = ImageDraw.Draw(canvas)
    
    left_x = int(W * 0.065)
    # Reduced max width so text wraps to 3 lines without touching the phones!
    max_text_w = int(W * (0.33 if is_ultrawide else 0.31))
    
    # 3.1 App Icon (Enlarged)
    icon_size = int(340 * scale)
    icon_path = os.path.join(PROJECT_ROOT, "assets/images/icon.png")
    app_icon = Image.open(icon_path).convert("RGBA").resize((icon_size, icon_size), Image.Resampling.LANCZOS)
    icon_mask = draw_rounded_mask(icon_size, icon_size, int(74 * scale))
    
    icon_shadow = Image.new("RGBA", (icon_size + int(80*scale), icon_size + int(80*scale)), (0, 0, 0, 0))
    is_draw = ImageDraw.Draw(icon_shadow)
    is_draw.rounded_rectangle([int(20*scale), int(25*scale), icon_size + int(20*scale), icon_size + int(25*scale)], radius=int(74*scale), fill=(43, 22, 8, 90))
    icon_shadow = icon_shadow.filter(ImageFilter.GaussianBlur(int(26 * scale)))
    
    icon_top_y = int(170 * scale)
    canvas.alpha_composite(icon_shadow, (left_x - int(20*scale), icon_top_y - int(12*scale)))
    
    framed_icon = Image.new("RGBA", (icon_size, icon_size), (0, 0, 0, 0))
    framed_icon.paste(app_icon, (0, 0), icon_mask)
    fi_draw = ImageDraw.Draw(framed_icon)
    fi_draw.rounded_rectangle([0, 0, icon_size, icon_size], radius=int(74*scale), outline=(228, 198, 168), width=max(3, int(4*scale)))
    canvas.alpha_composite(framed_icon, (left_x, icon_top_y))
    
    # Brand Text beside icon
    font_brand_title = ImageFont.truetype(FONT_PATH, int(118 * scale), index=1)
    font_brand_sub = ImageFont.truetype(FONT_PATH, int(46 * scale), index=10)
    
    brand_text_x = left_x + icon_size + int(50 * scale)
    
    sub_line1 = "YKS, LGS Yapay Zeka Destekli"
    sub_line2 = "Özel Ders ve Koçluk"
    
    b_title = draw.textbbox((0, 0), "Koçum Benim", font=font_brand_title)
    b_sub1 = draw.textbbox((0, 0), sub_line1, font=font_brand_sub)
    
    # Vertically centered beside the icon
    app_title_y = icon_top_y + int(36 * scale)
    draw.text((brand_text_x, app_title_y), "Koçum Benim", font=font_brand_title, fill=(43, 22, 8))
    
    sub1_y = app_title_y + (b_title[3] - b_title[1]) + int(24 * scale)
    draw.text((brand_text_x, sub1_y), sub_line1, font=font_brand_sub, fill=(185, 71, 24))
    
    sub2_y = sub1_y + (b_sub1[3] - b_sub1[1]) + int(14 * scale)
    draw.text((brand_text_x, sub2_y), sub_line2, font=font_brand_sub, fill=(185, 71, 24))
    
    # 3.2 Hero Slogan (Increased padding and generous line-height)
    font_slogan = ImageFont.truetype(FONT_PATH, int(170 * scale), index=1)
    slogan_y = icon_top_y + icon_size + int(105 * scale)
    line1 = "Hedeflerine Akıllı"
    line2 = "Adımlarla Yürü"
    
    bbox1 = draw.textbbox((0, 0), line1, font=font_slogan)
    draw.text((left_x - bbox1[0], slogan_y), line1, font=font_slogan, fill=(43, 22, 8))
    
    slogan_y2 = slogan_y + (bbox1[3] - bbox1[1]) + int(38 * scale)
    bbox2 = draw.textbbox((0, 0), line2, font=font_slogan)
    draw.text((left_x - bbox2[0], slogan_y2), line2, font=font_slogan, fill=(185, 71, 24))
    
    # 3.3 Description Paragraph (Increased line spacing and safe max width)
    font_desc = ImageFont.truetype(FONT_PATH, int(54 * scale), index=10)
    desc_text = "Birebir yapay zeka rehberliği, sokratik soru çözümleri, akıllı Pomodoro takibi ve güncel Maarif müfredatına tam uyumlu kişisel çalışma planı."
    curr_y = slogan_y2 + (bbox2[3] - bbox2[1]) + int(65 * scale)
    desc_lines = wrap_text(desc_text, font_desc, max_text_w, draw)
    for line in desc_lines:
        bbox = draw.textbbox((0, 0), line, font=font_desc)
        draw.text((left_x - bbox[0], curr_y), line, font=font_desc, fill=(124, 67, 34))
        curr_y += (bbox[3] - bbox[1]) + int(28 * scale)
        
    # 3.4 Feature Highlights Pills (Increased paddings and breathing room)
    curr_y += int(50 * scale)
    features = ["Kişisel Çalışma Planı", "Şipşak Soru Çözümü", "Seviye & Lig Sistemi"]
    pill_font = ImageFont.truetype(FONT_PATH, int(38 * scale), index=1)
    pill_x = left_x
    for feat in features:
        fb = draw.textbbox((0, 0), feat, font=pill_font)
        fw = fb[2] - fb[0]
        fh = fb[3] - fb[1]
        pw = fw + int(52 * scale)
        ph = fh + int(30 * scale)
        draw.rounded_rectangle([pill_x, curr_y, pill_x + pw, curr_y + ph], radius=ph // 2, fill=(255, 253, 249), outline=(226, 204, 181), width=max(2, int(2.5 * scale)))
        draw.text((pill_x + int(26*scale) - fb[0], curr_y + int(15*scale) - fb[1]), feat, font=pill_font, fill=(43, 22, 8))
        pill_x += pw + int(26 * scale)
        
    # 3.5 Mascot Underneath (Prominently enlarged, perfectly proportioned)
    mascot_path = os.path.join(PROJECT_ROOT, "assets/images/mascot-wave.png")
    mascot_img = Image.open(mascot_path).convert("RGBA")
    
    mw = int(1480 * scale if not is_ultrawide else 1220 * scale)
    mh = int(mw * (mascot_img.height / mascot_img.width))
    mascot_resized = mascot_img.resize((mw, mh), Image.Resampling.LANCZOS)
    
    mx = left_x + int(40 * scale)
    my = H - mh - int(35 * scale)
    
    # Ground shadow
    m_shadow = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    ms_draw = ImageDraw.Draw(m_shadow)
    ms_draw.ellipse(
        [mx + int(mw * 0.12), my + mh - int(mh * 0.08), mx + mw - int(mw * 0.12), my + mh + int(mh * 0.05)],
        fill=(43, 22, 8, 140)
    )
    m_shadow = m_shadow.filter(ImageFilter.GaussianBlur(int(45 * scale)))
    canvas.alpha_composite(m_shadow)
    canvas.alpha_composite(mascot_resized, (mx, my))
    
    return canvas.convert("RGB")

def main():
    print("Building Showcase Header & Search Banners with updated spacing and clean typography...")
    for cfg in BANNER_SIZES:
        out_name = f"{cfg['id']}.png"
        out_path = os.path.join(OUTPUT_DIR, out_name)
        print(f"Rendering: {out_name} ({cfg['w']}x{cfg['h']})...")
        img = render_showcase(cfg)
        img.save(out_path, quality=94)
        print(f"Saved: {out_path} ({os.path.getsize(out_path) / (1024*1024):.2f} MB)")
        
    # Rebuild clean zip archive
    zip_path = os.path.join(PROJECT_ROOT, "app-store-assets/kocumbenim-appstore-bundle.zip")
    if os.path.exists(zip_path):
        os.remove(zip_path)
    base_dir = os.path.join(PROJECT_ROOT, "app-store-assets")
    print(f"\nRebuilding complete clean zip archive: {zip_path}")
    with zipfile.ZipFile(zip_path, "w", zipfile.ZIP_DEFLATED) as zf:
        for root, dirs, files in os.walk(base_dir):
            for file in files:
                if file.endswith(".zip") or file.startswith("."):
                    continue
                file_path = os.path.join(root, file)
                rel_path = os.path.relpath(file_path, base_dir)
                zf.write(file_path, rel_path)
                
    print(f"\nFinished! Archive rebuilt. Final size: {os.path.getsize(zip_path) / (1024*1024):.2f} MB")

if __name__ == "__main__":
    main()
