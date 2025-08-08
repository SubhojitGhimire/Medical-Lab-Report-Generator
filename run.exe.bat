@echo off
start "" "chrome" "http://localhost:5502"
python -m http.server 5502
