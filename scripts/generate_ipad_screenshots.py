import os
from PIL import Image, ImageDraw, ImageFont

OUTPUT_DIR = r"D:\uzvaj_app\ipad_screenshots"
os.makedirs(OUTPUT_DIR, exist_ok=True)

WIDTH, HEIGHT = 2048, 2732

FONT_REGULAR_PATH = r"D:\uzvaj_app\uzvaj_application\assets\fonts\Poppins-Regular.ttf"
FONT_MEDIUM_PATH = r"D:\uzvaj_app\uzvaj_application\assets\fonts\Poppins-Medium.ttf"
FONT_BOLD_PATH = r"D:\uzvaj_app\uzvaj_application\assets\fonts\Poppins-Black.ttf"
ICON_PATH = r"D:\uzvaj_app\uzvaj_application\assets\SVG\app_icon_smile.png"

def get_font(path, size):
    try:
        return ImageFont.truetype(path, size)
    except Exception:
        return ImageFont.load_default()

font_title = get_font(FONT_BOLD_PATH, 88)
font_subtitle = get_font(FONT_MEDIUM_PATH, 46)
font_badge = get_font(FONT_BOLD_PATH, 34)
font_h1 = get_font(FONT_BOLD_PATH, 52)
font_h2 = get_font(FONT_BOLD_PATH, 42)
font_body = get_font(FONT_REGULAR_PATH, 32)
font_small = get_font(FONT_MEDIUM_PATH, 28)
font_tiny = get_font(FONT_REGULAR_PATH, 24)

def create_gradient(width, height, color_top, color_bottom):
    base = Image.new("RGB", (width, height), color_top)
    top_r, top_g, top_b = color_top
    bot_r, bot_g, bot_b = color_bottom
    
    # Simple vertical gradient
    gradient = Image.new("RGB", (1, height))
    for y in range(height):
        factor = y / float(height)
        r = int(top_r + (bot_r - top_r) * factor)
        g = int(top_g + (bot_g - top_g) * factor)
        b = int(top_b + (bot_b - top_b) * factor)
        gradient.putpixel((0, y), (r, g, b))
    
    gradient = gradient.resize((width, height), Image.Resampling.BILINEAR)
    return gradient

def draw_rounded_rect(draw, bbox, radius, fill=None, outline=None, width=1):
    draw.rounded_rectangle(bbox, radius=radius, fill=fill, outline=outline, width=width)

def draw_device_mockup(draw, img, screen_type):
    # Device dimensions inside 2048x2732 canvas
    dev_x0 = 180
    dev_y0 = 620
    dev_x1 = WIDTH - 180
    dev_y1 = HEIGHT - 60
    corner_radius = 64
    
    # Outer dark shadow simulation
    for i in range(15, 0, -3):
        alpha_bbox = (dev_x0 - i*2, dev_y0 - i, dev_x1 + i*2, dev_y1 + i*3)
        draw.rounded_rectangle(alpha_bbox, radius=corner_radius + i, outline=(15, 30, 70), width=3)
    
    # Outer Bezel
    bezel_box = (dev_x0, dev_y0, dev_x1, dev_y1)
    draw.rounded_rectangle(bezel_box, radius=corner_radius, fill=(28, 30, 36), outline=(60, 65, 78), width=6)
    
    # Screen Area
    screen_padding = 24
    sx0 = dev_x0 + screen_padding
    sy0 = dev_y0 + screen_padding
    sx1 = dev_x1 - screen_padding
    sy1 = dev_y1 - screen_padding
    screen_radius = 44
    
    draw.rounded_rectangle((sx0, sy0, sx1, sy1), radius=screen_radius, fill=(248, 250, 252))
    
    # Status bar
    time_str = "9:41"
    draw.text((sx0 + 60, sy0 + 30), time_str, font=font_small, fill=(15, 23, 42))
    draw.text((sx1 - 180, sy0 + 30), "5G  100%", font=font_small, fill=(15, 23, 42))
    
    # App Top Header
    app_head_y = sy0 + 90
    draw.text((sx0 + 60, app_head_y), "Uživaj", font=font_h1, fill=(13, 110, 253))
    draw.text((sx0 + 60, app_head_y + 65), "📍 Zagreb, Croatia", font=font_small, fill=(100, 116, 139))
    
    # Profile avatar circle
    draw.ellipse((sx1 - 140, app_head_y, sx1 - 60, app_head_y + 80), fill=(224, 231, 255), outline=(13, 110, 253), width=3)
    draw.text((sx1 - 115, app_head_y + 20), "AU", font=font_small, fill=(13, 110, 253))
    
    # Search Box
    search_y = app_head_y + 130
    draw.rounded_rectangle((sx0 + 60, search_y, sx1 - 60, search_y + 90), radius=26, fill=(255, 255, 255), outline=(226, 232, 240), width=2)
    draw.text((sx0 + 100, search_y + 26), "🔍  Search partner restaurants, cafes, offers...", font=font_body, fill=(148, 163, 184))
    
    # Category Pills
    cat_y = search_y + 120
    categories = [("All", True), ("Casual Dining", False), ("Fine Dining", False), ("Cafes & Bars", False), ("Fast Food", False)]
    curr_x = sx0 + 60
    for name, active in categories:
        pill_w = len(name) * 22 + 50
        bg_col = (13, 110, 253) if active else (255, 255, 255)
        txt_col = (255, 255, 255) if active else (71, 85, 105)
        border_col = (13, 110, 253) if active else (226, 232, 240)
        draw.rounded_rectangle((curr_x, cat_y, curr_x + pill_w, cat_y + 65), radius=32, fill=bg_col, outline=border_col, width=2)
        draw.text((curr_x + 25, cat_y + 16), name, font=font_small, fill=txt_col)
        curr_x += pill_w + 24
        if curr_x > sx1 - 180:
            break
            
    content_y = cat_y + 100
    
    if screen_type == 1:
        # SCREEN 1: Restaurant List Cards
        draw.text((sx0 + 60, content_y), "Featured Establishments", font=font_h2, fill=(15, 23, 42))
        
        venues = [
            ("Konoba Dalmacija", "Casual Dining • Mediterranean", "4.9 ★ (128)", "Open Now • 10:00 - 23:00", "20% OFF Entire Bill", (240, 253, 244), (22, 101, 52)),
            ("Boutique Wine Bar & Grill", "Wine Bar • European", "4.8 ★ (94)", "Open Now • 12:00 - 00:00", "BUY 1 GET 1 FREE Mains", (239, 246, 255), (29, 78, 216)),
            ("Piazza Bistro & Lounge", "Italian • Artisan Pasta", "4.9 ★ (210)", "Open Now • 09:00 - 22:30", "15% OFF Total Order", (254, 242, 242), (185, 28, 28))
        ]
        
        card_y = content_y + 60
        for title, subtitle, rating, timing, badge, badge_bg, badge_txt in venues:
            # Card Container
            draw.rounded_rectangle((sx0 + 60, card_y, sx1 - 60, card_y + 360), radius=28, fill=(255, 255, 255), outline=(226, 232, 240), width=2)
            
            # Simulated Image Banner
            draw.rounded_rectangle((sx0 + 60, card_y, sx1 - 60, card_y + 180), radius=28, fill=(224, 231, 255))
            draw.text((sx0 + 100, card_y + 60), "🍽️  " + title, font=font_h2, fill=(30, 58, 138))
            
            # Badge overlay on image
            draw.rounded_rectangle((sx1 - 380, card_y + 25, sx1 - 90, card_y + 80), radius=20, fill=badge_bg, outline=badge_txt, width=2)
            draw.text((sx1 - 360, card_y + 36), badge, font=font_small, fill=badge_txt)
            
            # Details below image
            draw.text((sx0 + 100, card_y + 205), title, font=font_h2, fill=(15, 23, 42))
            draw.text((sx0 + 100, card_y + 260), subtitle, font=font_body, fill=(100, 116, 139))
            draw.text((sx0 + 100, card_y + 305), "🕒 " + timing + "  •  " + rating, font=font_small, fill=(71, 85, 105))
            
            card_y += 395
            if card_y > sy1 - 100:
                break

    elif screen_type == 2:
        # SCREEN 2: Offer Detail / Voucher Redemption
        draw.text((sx0 + 60, content_y), "Exclusive Dining Offer", font=font_h2, fill=(15, 23, 42))
        
        card_y = content_y + 60
        draw.rounded_rectangle((sx0 + 60, card_y, sx1 - 60, card_y + 1100), radius=32, fill=(255, 255, 255), outline=(226, 232, 240), width=3)
        
        # Voucher Header
        draw.rounded_rectangle((sx0 + 60, card_y, sx1 - 60, card_y + 300), radius=32, fill=(13, 110, 253))
        draw.text((sx0 + 120, card_y + 60), "Konoba Dalmacija", font=font_h1, fill=(255, 255, 255))
        draw.text((sx0 + 120, card_y + 130), "2-for-1 Main Course or 25% Off Food Bill", font=font_subtitle, fill=(255, 243, 205))
        draw.text((sx0 + 120, card_y + 200), "⭐ Verified Partner Establishment", font=font_small, fill=(255, 255, 255))
        
        # Offer Details Table
        body_y = card_y + 360
        draw.text((sx0 + 120, body_y), "Offer Information", font=font_h2, fill=(15, 23, 42))
        draw.text((sx0 + 120, body_y + 65), "• Valid: Monday - Friday (12:00 PM - 10:30 PM)", font=font_body, fill=(71, 85, 105))
        draw.text((sx0 + 120, body_y + 125), "• Discount: Equal or lesser value main course free", font=font_body, fill=(71, 85, 105))
        draw.text((sx0 + 120, body_y + 185), "• Average Estimated Savings: €16.50 per visit", font=font_body, fill=(22, 101, 52))
        draw.text((sx0 + 120, body_y + 245), "• Address: Trg kralja Tomislava 18, Zagreb", font=font_body, fill=(71, 85, 105))
        
        # Digital Voucher Redemption Box
        code_box_y = body_y + 340
        draw.rounded_rectangle((sx0 + 120, code_box_y, sx1 - 120, code_box_y + 240), radius=24, fill=(248, 250, 252), outline=(13, 110, 253), width=3)
        draw.text((sx0 + 180, code_box_y + 40), "FOUR-DIGIT REDEMPTION CODE", font=font_small, fill=(100, 116, 139))
        draw.text((sx0 + 180, code_box_y + 90), "UZIV - 8928", font=get_font(FONT_BOLD_PATH, 68), fill=(13, 110, 253))
        draw.text((sx0 + 180, code_box_y + 175), "Show this code to restaurant staff to redeem voucher", font=font_small, fill=(71, 85, 105))

    elif screen_type == 3:
        # SCREEN 3: Savings Dashboard & Membership
        draw.text((sx0 + 60, content_y), "Your Membership & Total Savings", font=font_h2, fill=(15, 23, 42))
        
        # Big Savings Stat Banner
        stat_y = content_y + 60
        draw.rounded_rectangle((sx0 + 60, stat_y, sx1 - 60, stat_y + 320), radius=32, fill=(13, 110, 253))
        draw.text((sx0 + 120, stat_y + 50), "TOTAL DINING SAVINGS", font=font_small, fill=(224, 231, 255))
        draw.text((sx0 + 120, stat_y + 100), "€ 184.50", font=get_font(FONT_BOLD_PATH, 88), fill=(255, 255, 255))
        draw.text((sx0 + 120, stat_y + 215), "14 Vouchers Successfully Claimed  •  Active Member", font=font_body, fill=(254, 240, 138))
        
        # History list
        hist_y = stat_y + 380
        draw.text((sx0 + 60, hist_y), "Recent Vouchers Redeemed", font=font_h2, fill=(15, 23, 42))
        
        redemptions = [
            ("Konoba Dalmacija", "2-for-1 Main Course", "+ €17.00 Saved", "Yesterday"),
            ("Piazza Bistro & Lounge", "20% Total Order", "+ €14.50 Saved", "Nov 22, 2026"),
            ("Boutique Wine Bar", "Complimentary Appetizer", "+ €12.00 Saved", "Nov 19, 2026"),
            ("Dubrovnik Grill House", "25% Food Discount", "+ €22.00 Saved", "Nov 14, 2026")
        ]
        
        item_y = hist_y + 65
        for name, offer, saved, date in redemptions:
            draw.rounded_rectangle((sx0 + 60, item_y, sx1 - 60, item_y + 140), radius=22, fill=(255, 255, 255), outline=(226, 232, 240), width=2)
            draw.text((sx0 + 100, item_y + 30), name, font=font_h2, fill=(15, 23, 42))
            draw.text((sx0 + 100, item_y + 85), offer + " • " + date, font=font_small, fill=(100, 116, 139))
            
            # Saved Badge
            draw.rounded_rectangle((sx1 - 380, item_y + 35, sx1 - 100, item_y + 105), radius=16, fill=(240, 253, 244), outline=(22, 101, 52), width=1)
            draw.text((sx1 - 350, item_y + 48), saved, font=font_small, fill=(22, 101, 52))
            
            item_y += 165

def generate_screenshots():
    screens_data = [
        (
            1,
            "Discover Partner Establishments",
            "Find the best restaurants, cafes, and bars across Croatia",
            "ipad_01_discover.png"
        ),
        (
            2,
            "Exclusive Dining Discounts",
            "Enjoy 2-for-1 meals and special member offers every day",
            "ipad_02_offers.png"
        ),
        (
            3,
            "Instant Digital Redemption",
            "Redeem vouchers seamlessly & track your dining savings",
            "ipad_03_savings.png"
        )
    ]
    
    for screen_type, title, subtitle, filename in screens_data:
        # Base background: clean royal blue to navy gradient
        img = create_gradient(WIDTH, HEIGHT, (10, 80, 200), (8, 40, 120))
        draw = ImageDraw.Draw(img)
        
        # Decorative top pill badge
        badge_text = "UŽIVAJ DINING & LIFESTYLE"
        bw = len(badge_text) * 19 + 60
        bx0 = (WIDTH - bw) // 2
        draw.rounded_rectangle((bx0, 120, bx0 + bw, 185), radius=32, fill=(255, 255, 255, 40), outline=(255, 255, 255), width=2)
        draw.text((bx0 + 30, 135), badge_text, font=font_badge, fill=(255, 255, 255))
        
        # Main Title (centered)
        title_bbox = draw.textbbox((0, 0), title, font=font_title)
        title_w = title_bbox[2] - title_bbox[0]
        draw.text(((WIDTH - title_w) // 2, 230), title, font=font_title, fill=(255, 255, 255))
        
        # Subtitle (centered)
        sub_bbox = draw.textbbox((0, 0), subtitle, font=font_subtitle)
        sub_w = sub_bbox[2] - sub_bbox[0]
        draw.text(((WIDTH - sub_w) // 2, 350), subtitle, font=font_subtitle, fill=(224, 231, 255))
        
        # Draw iPad Mockup & App UI
        draw_device_mockup(draw, img, screen_type)
        
        out_path = os.path.join(OUTPUT_DIR, filename)
        # Ensure RGB (no alpha)
        rgb_img = img.convert("RGB")
        rgb_img.save(out_path, format="PNG", quality=100)
        print(f"Generated: {out_path} ({rgb_img.size[0]}x{rgb_img.size[1]})")

if __name__ == "__main__":
    generate_screenshots()
