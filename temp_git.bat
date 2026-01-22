@echo off
cd /d "C:\Users\pusse\OneDrive\2025\MNNR\COMPLETE2025\mnnr-complete2025"
echo === GIT LOG ===
"C:\Program Files\Git\bin\git.exe" log -1 --oneline
echo.
echo === GIT STATUS ===
"C:\Program Files\Git\bin\git.exe" status
echo.
echo === GIT REMOTE ===
"C:\Program Files\Git\bin\git.exe" remote -v
