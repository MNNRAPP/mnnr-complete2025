@echo off
cd /d "C:\Users\pusse\OneDrive\2025\MNNR\COMPLETE2025\mnnr-complete2025"
"C:\Program Files\Git\bin\git.exe" add -A
"C:\Program Files\Git\bin\git.exe" commit -m "Fix Vercel build: switch from pnpm to npm"
"C:\Program Files\Git\bin\git.exe" push origin main
echo DONE!
pause
