import urllib.request
import urllib.error
import json
import time

api_key = "YOUR_GEMINI_API_KEY"
models = ["gemini-3.6-flash", "gemini-3.5-flash", "gemini-3.1-flash-lite"]

for model in models:
    url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={api_key}"
    body = {
        "contents": [{"parts": [{"text": "Say ok"}]}]
    }
    req = urllib.request.Request(url, data=json.dumps(body).encode('utf-8'), headers={"Content-Type": "application/json"}, method="POST")
    try:
        with urllib.request.urlopen(req) as resp:
            print(f"Success with {model}!")
            print(resp.read().decode('utf-8'))
            break
    except urllib.error.HTTPError as e:
        print(f"Failed with {model}: {e.code} - {e.read().decode('utf-8')}")
        time.sleep(1)
