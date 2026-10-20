import os
from PIL import Image, ImageDraw, ImageFont, ImageFilter

public_dir = r"c:\campusconnectcep\frontend\public"
app_dir = r"c:\campusconnectcep\frontend\src\app"
os.makedirs(public_dir, exist_ok=True)

def draw_pulse_wave(draw, cx, cy, radius, stroke_width, color):
    # ECG Pulse Wave Coordinates relative to center
    # flat line, slight dip, sharp peak up, sharp drop down, rebound, flat line
    points = [
        (cx - radius * 0.75, cy),
        (cx - radius * 0.40, cy),
        (cx - radius * 0.25, cy + radius * 0.15),
        (cx - radius * 0.08, cy - radius * 0.65),
        (cx + radius * 0.12, cy + radius * 0.55),
        (cx + radius * 0.28, cy - radius * 0.18),
        (cx + radius * 0.42, cy),
        (cx + radius * 0.75, cy),
    ]
    for i in range(len(points) - 1):
        draw.line([points[i], points[i+1]], fill=color, width=stroke_width, joint="round")
    # Draw glowing end dots
    dot_r = max(stroke_width * 0.7, 2)
    draw.ellipse([points[0][0] - dot_r, points[0][1] - dot_r, points[0][0] + dot_r, points[0][1] + dot_r], fill=color)
    draw.ellipse([points[-1][0] - dot_r, points[-1][1] - dot_r, points[-1][0] + dot_r, points[-1][1] + dot_r], fill=color)

def create_brand_icon(size=512):
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    margin = int(size * 0.08)
    corner_radius = int(size * 0.24)
    x0, y0 = margin, margin
    x1, y1 = size - margin, size - margin

    # Draw gradient rounded square
    # Create base gradient image
    gradient = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    g_draw = ImageDraw.Draw(gradient)

    # Diagonal gradient from (06b6d4) to (4f46e5) to (7c3aed)
    for y in range(size):
        ratio = y / size
        # Mix cyan (6, 182, 212) -> indigo (79, 70, 229) -> violet (124, 58, 237)
        if ratio < 0.5:
            t = ratio * 2
            r = int(6 * (1 - t) + 79 * t)
            g = int(182 * (1 - t) + 70 * t)
            b = int(212 * (1 - t) + 229 * t)
        else:
            t = (ratio - 0.5) * 2
            r = int(79 * (1 - t) + 124 * t)
            g = int(70 * (1 - t) + 58 * t)
            b = int(229 * (1 - t) + 237 * t)
        g_draw.line([(0, y), (size, y)], fill=(r, g, b, 255))

    # Mask for rounded rectangle
    mask = Image.new("L", (size, size), 0)
    m_draw = ImageDraw.Draw(mask)
    m_draw.rounded_rectangle([x0, y0, x1, y1], radius=corner_radius, fill=255)

    img.paste(gradient, (0, 0), mask)

    # Border highlight
    border_draw = ImageDraw.Draw(img)
    border_width = max(int(size * 0.025), 2)
    border_draw.rounded_rectangle([x0, y0, x1, y1], radius=corner_radius, outline=(165, 243, 252, 140), width=border_width)

    # Draw ECG Pulse Wave
    cx = size // 2
    cy = size // 2
    radius = (x1 - x0) // 2
    wave_stroke = max(int(size * 0.065), 3)

    # Pulse wave glow (cyan soft highlight)
    draw_pulse_wave(border_draw, cx, cy, radius, wave_stroke + 4, (165, 243, 252, 90))
    # Pulse wave solid white/cyan line
    draw_pulse_wave(border_draw, cx, cy, radius, wave_stroke, (240, 253, 250, 255))

    return img

# Generate icons
icon_512 = create_brand_icon(512)
icon_512.save(os.path.join(public_dir, "android-chrome-512x512.png"))

icon_192 = icon_512.resize((192, 192), Image.Resampling.LANCZOS)
icon_192.save(os.path.join(public_dir, "android-chrome-192x192.png"))

icon_180 = icon_512.resize((180, 180), Image.Resampling.LANCZOS)
icon_180.save(os.path.join(public_dir, "apple-touch-icon.png"))

icon_32 = icon_512.resize((32, 32), Image.Resampling.LANCZOS)
icon_32.save(os.path.join(public_dir, "favicon-32x32.png"))

icon_16 = icon_512.resize((16, 16), Image.Resampling.LANCZOS)
icon_16.save(os.path.join(public_dir, "favicon-16x16.png"))

# Multi-resolution ICO
icon_512.save(
    os.path.join(public_dir, "favicon.ico"),
    format="ICO",
    sizes=[(16, 16), (32, 32), (48, 48), (64, 64)]
)
icon_512.save(
    os.path.join(app_dir, "favicon.ico"),
    format="ICO",
    sizes=[(16, 16), (32, 32), (48, 48), (64, 64)]
)

# Generate 1200x630 Open Graph Image
def create_og_image():
    width = 1200
    height = 630
    bg = Image.new("RGBA", (width, height), (2, 6, 23, 255)) # slate-950
    draw = ImageDraw.Draw(bg)

    # Subtle cyan and violet radial glow effects
    glow = Image.new("RGBA", (width, height), (0, 0, 0, 0))
    glow_draw = ImageDraw.Draw(glow)
    # Cyan glow top-left
    glow_draw.ellipse([100, -100, 700, 500], fill=(6, 182, 212, 45))
    # Violet glow right
    glow_draw.ellipse([700, 150, 1300, 750], fill=(124, 58, 237, 40))
    glow = glow.filter(ImageFilter.GaussianBlur(80))
    bg.alpha_composite(glow)

    # Draw grid lines
    grid_color = (15, 23, 42, 160)
    for x in range(0, width, 50):
        draw.line([(x, 0), (x, height)], fill=grid_color, width=1)
    for y in range(0, height, 50):
        draw.line([(0, y), (width, y)], fill=grid_color, width=1)

    # Border frame
    draw.rectangle([20, 20, width - 20, height - 20], outline=(6, 182, 212, 60), width=2)
    # Corner cyber accents
    corner_len = 30
    for cx, cy in [(20, 20), (width-20, 20), (20, height-20), (width-20, height-20)]:
        draw.rectangle([cx - 4, cy - 4, cx + 4, cy + 4], fill=(34, 211, 238, 200))

    # Paste Logo Mark on the right
    logo = create_brand_icon(360)
    bg.paste(logo, (770, 135), logo)

    # Use standard system fonts or default
    try:
        font_large = ImageFont.truetype("arialbd.ttf", 68)
        font_sub = ImageFont.truetype("arial.ttf", 26)
        font_badge = ImageFont.truetype("arialbd.ttf", 18)
        font_tag = ImageFont.truetype("arialbd.ttf", 16)
    except:
        font_large = ImageFont.load_default()
        font_sub = ImageFont.load_default()
        font_badge = ImageFont.load_default()
        font_tag = ImageFont.load_default()

    # Draw Category Badge
    badge_text = "PICT PUNE CAMPUS INTELLIGENCE NODE"
    draw.rounded_rectangle([80, 95, 520, 135], radius=8, fill=(6, 182, 212, 35), outline=(34, 211, 238, 120), width=1)
    draw.text((100, 106), badge_text, font=font_badge, fill=(34, 211, 238, 255))

    # Main Title
    draw.text((80, 165), "CampusConnect", font=font_large, fill=(255, 255, 255, 255))
    draw.text((80, 245), "Infrastructure Tracker & AI Triage", font=ImageFont.truetype("arialbd.ttf", 36), fill=(34, 211, 238, 255))

    # Description
    desc = (
        "Next-generation campus infrastructure management and automated\n"
        "issue resolution platform for PICT students, faculty, and administration."
    )
    draw.text((80, 315), desc, font=font_sub, fill=(203, 213, 225, 240), spacing=8)

    # Feature pills at bottom
    features = ["AI Deduplication Engine", "Live Status Tracking", "Authority Priority Hub", "Student Portal"]
    pill_x = 80
    for feat in features:
        bbox = draw.textbbox((0, 0), feat, font=font_tag)
        tw = bbox[2] - bbox[0] + 30
        draw.rounded_rectangle([pill_x, 470, pill_x + tw, 510], radius=8, fill=(15, 23, 42, 200), outline=(51, 65, 85, 220), width=1)
        draw.text((pill_x + 15, 482), feat, font=font_tag, fill=(148, 163, 184, 255))
        pill_x += tw + 16

    draw.text((80, 560), "Pune Institute of Computer Technology • https://campusconnectproject-nu.vercel.app", font=font_tag, fill=(100, 116, 139, 255))

    bg.convert("RGB").save(os.path.join(public_dir, "og-image.png"), quality=95)
    print("Generated all brand icons and og-image.png successfully.")

create_og_image()
