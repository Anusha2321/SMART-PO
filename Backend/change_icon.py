from PIL import Image
import os

uploaded_img_path = "icon.png" # You can put your icon file here and name it icon.png
res_dir = r"..\Frontend\app\src\main\res"

# 2. Resize and write mipmaps
densities = {
    "mipmap-mdpi": (48, 48),
    "mipmap-hdpi": (72, 72),
    "mipmap-xhdpi": (96, 96),
    "mipmap-xxhdpi": (144, 144),
    "mipmap-xxxhdpi": (192, 192)
}

img = Image.open(uploaded_img_path)

for folder_name, size in densities.items():
    folder_path = os.path.join(res_dir, folder_name)
    os.makedirs(folder_path, exist_ok=True)
    
    # Resize image
    resized_img = img.resize(size, Image.Resampling.LANCZOS)
    
    # Save as ic_launcher.webp
    launcher_path = os.path.join(folder_path, "ic_launcher.webp")
    resized_img.save(launcher_path, "WEBP")
    
    # Save as ic_launcher_round.webp
    round_launcher_path = os.path.join(folder_path, "ic_launcher_round.webp")
    resized_img.save(round_launcher_path, "WEBP")
    
    print(f"Saved icons for {folder_name} ({size[0]}x{size[1]})")

print("App icon replacement completed successfully!")
