#!/bin/bash
cd "$(dirname "$0")"
open -a "Google Chrome" "$(pwd)/白噪音台.html" 2>/dev/null || open "$(pwd)/白噪音台.html"
echo "正在打开白噪音台…"
sleep 1
