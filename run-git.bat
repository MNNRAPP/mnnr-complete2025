@echo off
cd /d "C:\Users\pusse\OneDrive\2025\MNNR\COMPLETE2025\mnnr-complete2025"
echo === Git Status ===
git status
echo.
echo === Adding files ===
git add -A
echo.
echo === Staged Changes ===
git diff --cached --stat
