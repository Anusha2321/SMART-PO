import urllib.request
import json

url = "https://jnnjzgwgqjncjeunfcis.supabase.co/rest/v1/products?select=id"
headers = {
    "apikey": "sb_publishable_3G7Gdw4E2DKW_SGmZEEmoA_tv3r3BRf",
    "Authorization": "Bearer sb_publishable_3G7Gdw4E2DKW_SGmZEEmoA_tv3r3BRf"
}

req = urllib.request.Request(url, headers=headers)
try:
    with urllib.request.urlopen(req) as response:
        data = response.read().decode('utf-8')
        items = json.loads(data)
        print("Total products currently in Supabase:", len(items))
except Exception as e:
    print("Error querying Supabase:", e)
