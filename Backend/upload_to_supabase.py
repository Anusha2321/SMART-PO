import json
import urllib.request
import urllib.error

import os

script_dir = os.path.dirname(os.path.abspath(__file__))
json_path = os.path.join(script_dir, "extracted_items.json")

# Load extracted items
with open(json_path, "r") as f:
    items = json.load(f)

# Format for Supabase
# Columns: name, category, price_per_kg, unit
formatted_items = []
for it in items:
    formatted_items.append({
        "name": it["name"],
        "category": it["category"],
        "price_per_kg": float(it["price"]),
        "unit": it["unit"]
    })

url = "https://jnnjzgwgqjncjeunfcis.supabase.co/rest/v1/products"
headers = {
    "apikey": "sb_publishable_3G7Gdw4E2DKW_SGmZEEmoA_tv3r3BRf",
    "Authorization": "Bearer sb_publishable_3G7Gdw4E2DKW_SGmZEEmoA_tv3r3BRf",
    "Content-Type": "application/json",
    "Prefer": "return=minimal"
}

# Upload in batches of 100
batch_size = 100
total_items = len(formatted_items)
print(f"Starting upload of {total_items} items to Supabase...")

for i in range(0, total_items, batch_size):
    batch = formatted_items[i:i+batch_size]
    data_bytes = json.dumps(batch).encode('utf-8')
    req = urllib.request.Request(url, data=data_bytes, headers=headers, method="POST")
    try:
        with urllib.request.urlopen(req) as response:
            status = response.status
            print(f"Uploaded batch {i // batch_size + 1}/{(total_items + batch_size - 1) // batch_size} (Items {i} to {min(i+batch_size, total_items)}). Status: {status}")
    except urllib.error.HTTPError as e:
        print(f"Error on batch starting at {i}: {e.code} - {e.read().decode('utf-8')}")
        break
    except Exception as e:
        print(f"General error on batch starting at {i}: {e}")
        break

print("Upload process completed.")
