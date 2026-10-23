#!/bin/bash
cd "$(dirname "$0")"
LOBBY="$(pwd)/游戏大厅.html"
if [ ! -f "$LOBBY" ]; then
  LOBBY="$(pwd)/index.html"
fi
open -a "Google Chrome" "$LOBBY" 2>/dev/null || open "$LOBBY"
echo "正在打开解压大厅…"
sleep 1
