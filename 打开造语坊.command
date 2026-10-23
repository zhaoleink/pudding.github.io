#!/bin/bash
cd "$(dirname "$0")"
APP="$(pwd)/造语坊.html"
open -a "Google Chrome" "$APP" 2>/dev/null || open "$APP"
echo "正在打开造语坊…"
sleep 1
