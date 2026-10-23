#!/usr/bin/env python3
"""Pack lang-app into single-file 造语坊.html"""
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
LA = Path(__file__).resolve().parent

html = (LA / 'index.html').read_text(encoding='utf-8')
css = (LA / 'style.css').read_text(encoding='utf-8')
js = (LA / 'app.js').read_text(encoding='utf-8')

out = html.replace(
    '<link rel="stylesheet" href="style.css">',
    f'<style>\n{css}\n</style>',
)
out = out.replace(
    '<script src="app.js"></script>',
    f'<script>\n{js}\n</script>',
)
hub_css = (ROOT / 'hub-nav.css').read_text(encoding='utf-8')
out = out.replace(
    '<link rel="stylesheet" href="../hub-nav.css">',
    f'<style>\n{hub_css}\n</style>',
)
out = out.replace('href="../', 'href="')

for name in ('造语坊.html', 'lang-app.html'):
    target = ROOT / name
    target.write_text(out, encoding='utf-8')
    print(f'wrote {target} ({target.stat().st_size} bytes)')
