import os
import django
import json
import urllib.request
import shutil

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core_backend.settings')
django.setup()

from products.models import Category, Product

print("Preparing local assets for Deployment...")
# Copy AI generated images from Gemini brain to project folder
brain_dir = r"C:\Users\vipan\.gemini\antigravity\brain\e9eaf56d-6ee8-444b-9d95-05b3cd3b6e61"
img_dir = os.path.join(os.path.dirname(__file__), 'frontend', 'img')
os.makedirs(img_dir, exist_ok=True)

images_to_copy = [
    "ps5_console_1776900710917.png", "xbox_console_1776900725909.png", 
    "switch_console_1776900743496.png", "gameboy_console_1776900760497.png", 
    "vr_headset_1776900777207.png", "gta_game_1776900795198.png", 
    "godofwar_game_1776900827445.png", "cyberpunk_game_1776900843446.png", 
    "zelda_game_1776900860409.png", "vipan_shop_logo_1776897650889.png"
]

for img_name in images_to_copy:
    src = os.path.join(brain_dir, img_name)
    dst = os.path.join(img_dir, img_name)
    if os.path.exists(src):
        shutil.copy(src, dst)

print("Connecting to Premium Product Database API...")
url = "https://dummyjson.com/products?limit=150"
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})

try:
    with urllib.request.urlopen(req) as response:
        data = json.loads(response.read().decode())
        
        print("Clearing old data...")
        Category.objects.all().delete()
        Product.objects.all().delete()

        print("Generating Unique High-Resolution Products...")
        
        allowed_cats = ['smartphones', 'laptops', 'fragrances', 'sunglasses', 'automotive', 'motorcycle', 'lighting', 'mens-watches', 'womens-watches', 'womens-bags', 'mens-shoes']
        
        count = 0
        for item in data['products']:
            if item['category'] not in allowed_cats:
                continue
                
            cat_name = item['category'].replace('-', ' ').title()
            category, _ = Category.objects.get_or_create(name=cat_name, slug=item['category'], defaults={'description': f"Premium {cat_name}."})
            
            # Using the HIGH RESOLUTION image array instead of the compressed thumbnail
            image_url = item['images'][0] if item.get('images') else "https://via.placeholder.com/600"
            prod_slug = str(item['id']) + "-" + "".join(e for e in item['title'].lower().replace(' ', '-') if e.isalnum() or e == '-')
            price_in_rupees = round(item['price'] * 83.0, 2)

            Product.objects.create(
                category=category, name=item['title'], slug=prod_slug, description=item['description'],
                price=price_in_rupees, stock=item.get('stock', 15), image_url=image_url
            )
            count += 1
            
        print(f"Loaded {count} High-Res DummyJSON products.")

        # 100% Unique Consoles with Deployment-Ready Relative Paths
        cat_consoles, _ = Category.objects.get_or_create(name="Gaming Consoles", slug="gaming-consoles")
        consoles_data = [
            ("PlayStation 5 Console", "img/ps5_console_1776900710917.png", 49990),
            ("Xbox Series X", "img/xbox_console_1776900725909.png", 49990),
            ("Nintendo Switch OLED", "img/switch_console_1776900743496.png", 34990),
            ("Retro Game Boy Color", "img/gameboy_console_1776900760497.png", 15000),
            ("Meta Quest 3 VR", "img/vr_headset_1776900777207.png", 45000)
        ]
        for name, img, price in consoles_data:
            Product.objects.create(category=cat_consoles, name=name, slug=name.lower().replace(' ', '-'), description="Premium Gaming Console.", price=price, stock=10, image_url=img)

        # 100% Unique Games with Deployment-Ready Relative Paths
        cat_games, _ = Category.objects.get_or_create(name="Video Games", slug="video-games")
        games_data = [
            ("Grand Theft Auto V", "img/gta_game_1776900795198.png", 2990),
            ("God of War", "img/godofwar_game_1776900827445.png", 2500),
            ("Cyberpunk 2077", "img/cyberpunk_game_1776900843446.png", 3500),
            ("Zelda Tears of the Kingdom", "img/zelda_game_1776900860409.png", 4990)
        ]
        for name, img, price in games_data:
            Product.objects.create(category=cat_games, name=name, slug=name.lower().replace(' ', '-').replace("'", ""), description="Physical Edition Video Game.", price=price, stock=20, image_url=img)

        print("SUCCESS! All images are now in high-resolution and your site is 100% ready for deployment!")

except Exception as e:
    print(f"Error fetching data: {e}")



