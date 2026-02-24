import urllib.request
try:
    url = "https://civic-voice-project.vercel.app/assets/index-DRLG-w-O.js"
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    with urllib.request.urlopen(req) as response:
        content = response.read().decode('utf-8')
        print(f"Content Type: {response.headers.get('Content-Type')}")
        print(f"Content Preview: {content[:100]}")
except Exception as e:
    print(e)
