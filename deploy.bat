@echo off
cd /d "C:\Users\pusse\OneDrive\2025\MNNR\COMPLETE2025\mnnr-complete2025"
set GIT="C:\Program Files\Git\bin\git.exe"
echo === Git Status ===
%GIT% status
echo.
echo === Adding files ===
%GIT% add -A
echo.
echo === Staged Changes ===
%GIT% diff --cached --stat
echo.
echo === Committing ===
%GIT% commit -m "Add PWA support: icons, service worker, offline page, install prompt"
echo.
echo === Pushing ===
%GIT% push origin main
