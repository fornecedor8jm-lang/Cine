from pathlib import Path
import re

path = Path('/home/ubuntu/cine-new/client/src/lib/catalog.ts')
text = path.read_text()
ids = {
    'scary-movie': 'tt32093575',
    'professor-madman': 'tt5932728',
    'imitation-game': 'tt2084970',
    'odyssey': 'tt33764258',
    'a-ultima-casa-2026': 'tt32268156',
    'devoradores-estrelas': 'tt12042730',
    'descendentes-wicked-wonderland': 'tt34477910',
    'spider-man-brand-new-day': 'tt22084616',
    'moana-live-action': 'tt27419466',
    'obsessao': 'tt37287335',
    'avatar-fire-ash': 'tt1757678',
    'ghostland': 'tt6372694',
    'eternos': 'tt9032400',
    'hacksaw-ridge': 'tt2119532',
    'everything-everywhere': 'tt6710474',
    'velhos-bandidos': 'tt34382332',
    'gabriel-vinganca': 'tt0857376',
    'sheep-detectives': 'tt32565993',
}

for item_id, imdb_id in ids.items():
    pattern = re.compile(rf'(?P<block>  \{{\n    id: "{re.escape(item_id)}",.*?\n  \}},)', re.S)
    match = pattern.search(text)
    if not match:
        raise SystemExit(f'Filme não encontrado: {item_id}')
    block = match.group('block')
    url = f'https://embedplayapi.top/embed/{imdb_id}'
    if re.search(r'^    watchUrl:', block, re.M):
        block = re.sub(r'^    watchUrl: "[^"]*",$', f'    watchUrl: "{url}",', block, flags=re.M)
    else:
        block = re.sub(r'^(    availability: "[^"]*",)$', rf'\1\n    watchUrl: "{url}",\n    watchLabel: "Abrir player do filme",', block, count=1, flags=re.M)
    if re.search(r'^    watchLabel:', block, re.M):
        block = re.sub(r'^    watchLabel: "[^"]*",$', '    watchLabel: "Abrir player do filme",', block, flags=re.M)
    block = re.sub(r'^    availability: "[^"]*",$', '    availability: "Player EmbedPlay",', block, count=1, flags=re.M)
    text = text[:match.start()] + block + text[match.end():]

path.write_text(text)
print(f'Atualizados {len(ids)} filmes com players EmbedPlay individuais.')
