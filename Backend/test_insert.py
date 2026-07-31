import urllib.request
import urllib.error
import json

url = "https://jnnjzgwgqjncjeunfcis.supabase.co/rest/v1/products"
item = {
    "name": "Test Item RLS",
    "category": "OTHERS",
    "price_per_kg": 10.0,
    "unit": "pcs"
}

def try_insert(auth_header):
    headers = {
        "apikey": "sb_publishable_3G7Gdw4E2DKW_SGmZEEmoA_tv3r3BRf",
        "Authorization": auth_header,
        "Content-Type": "application/json",
        "Prefer": "return=minimal"
    }
    req = urllib.request.Request(url, data=json.dumps(item).encode('utf-8'), headers=headers, method="POST")
    try:
        with urllib.request.urlopen(req) as resp:
            print(f"Success with {auth_header}: status {resp.status}")
            return True
    except urllib.error.HTTPError as e:
        print(f"Failed with {auth_header}: {e.code} - {e.read().decode('utf-8')}")
        return False

print("1. Trying with SUPABASE_KEY...")
try_insert("Bearer sb_publishable_3G7Gdw4E2DKW_SGmZEEmoA_tv3r3BRf")

print("\n2. Trying with dummy_token...")
try_insert("Bearer dummy_token")
