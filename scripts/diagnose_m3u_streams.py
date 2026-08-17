import re
import sys
import requests
from urllib.parse import urlparse

SOURCE = 'https://iptv-org.github.io/iptv/languages/por.m3u'
text = requests.get(SOURCE, timeout=30, headers={'User-Agent': 'CineclubStreamDiagnostics/1.0'}).text
lines = [line.strip() for line in text.splitlines() if line.strip()]
entries = []
for i, line in enumerate(lines):
    if not line.startswith('#EXTINF'):
        continue
    name = line.split(',', 1)[1].strip() if ',' in line else 'Sem nome'
    url = next((x for x in lines[i+1:] if not x.startswith('#')), '')
    if url:
        entries.append((name, url))
    if len(entries) >= 12:
        break
print(f'entries_checked={len(entries)}')
for idx, (name, url) in enumerate(entries, 1):
    parsed = urlparse(url)
    try:
        r = requests.get(url, stream=True, timeout=(4, 4), headers={'User-Agent': 'Mozilla/5.0', 'Accept': '*/*'}, allow_redirects=True)
        ctype = r.headers.get('content-type', '')
        print(f'{idx:02d} status={r.status_code} type={ctype[:45]} final={r.url[:100]} name={name[:55]}')
        r.close()
    except Exception as exc:
        print(f'{idx:02d} error={type(exc).__name__}:{exc} name={name[:55]} url={url[:100]}')
