#!/usr/bin/env python3
"""Pack index.html + css + art.js + game.js into single-file builds."""
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
CG = Path(__file__).resolve().parent

html = (CG / 'index.html').read_text(encoding='utf-8')
css = (CG / 'style.css').read_text(encoding='utf-8')
art = (CG / 'art.js').read_text(encoding='utf-8')
js = (CG / 'game.js').read_text(encoding='utf-8')

out = html.replace(
    '<link rel="stylesheet" href="style.css">',
    f'<style>\n{css}\n</style>',
)
out = out.replace(
    '<script src="art.js"></script>\n  <script src="game.js"></script>',
    f'<script>\n{art}\n</script>\n  <script>\n{js}\n</script>',
)
out = out.replace('src="../anti-ad-shield.js"', 'src="anti-ad-shield.js"')
out = out.replace('href="../hub-nav.css"', 'href="hub-nav.css"')
out = out.replace('href="../', 'href="')

for name in ('慢净.html', 'clean-game.html'):
    target = ROOT / name
    target.write_text(out, encoding='utf-8')
    print(f'wrote {target} ({target.stat().st_size} bytes)')
