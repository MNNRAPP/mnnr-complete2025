@echo off
echo ========================================
echo  Git Commit and Deploy Script
echo ========================================
echo.

REM Create deploy directory outside OneDrive
echo Creating deploy directory...
if not exist C:\Projects mkdir C:\Projects
cd C:\Projects

REM Initialize git repo if needed
if not exist mnnr-complete2025-deploy (
    echo Cloning repository...
    git clone https://github.com/vercel/nextjs-subscription-payments.git mnnr-complete2025-deploy
    REM Replace with your actual repo URL above
)

cd mnnr-complete2025-deploy

REM Pull latest
echo Pulling latest changes...
git pull origin main

echo.
echo ========================================
echo  Copying your changes...
echo ========================================
echo.

REM Copy files manually (excluding git and node_modules)
xcopy /Y /E "C:\Users\pusse\OneDrive\2025\MNNR\COMPLETE2025\mnnr-complete2025\utils\*.ts" "utils\" 2>nul
xcopy /Y /E "C:\Users\pusse\OneDrive\2025\MNNR\COMPLETE2025\mnnr-complete2025\app\*.tsx" "app\" 2>nul
xcopy /Y /E "C:\Users\pusse\OneDrive\2025\MNNR\COMPLETE2025\mnnr-complete2025\components\*.tsx" "components\" 2>nul
xcopy /Y /E "C:\Users\pusse\OneDrive\2025\MNNR\COMPLETE2025\mnnr-complete2025\__tests__\*.*" "__tests__\" 2>nul

REM Copy new files
copy /Y "C:\Users\pusse\OneDrive\2025\MNNR\COMPLETE2025\mnnr-complete2025\instrumentation.ts" . 2>nul
copy /Y "C:\Users\pusse\OneDrive\2025\MNNR\COMPLETE2025\mnnr-complete2025\next.config.js" . 2>nul
copy /Y "C:\Users\pusse\OneDrive\2025\MNNR\COMPLETE2025\mnnr-complete2025\.eslintrc.json" . 2>nul
copy /Y "C:\Users\pusse\OneDrive\2025\MNNR\COMPLETE2025\mnnr-complete2025\.env.production.example" . 2>nul

REM Copy documentation
copy /Y "C:\Users\pusse\OneDrive\2025\MNNR\COMPLETE2025\mnnr-complete2025\*.md" . 2>nul
copy /Y "C:\Users\pusse\OneDrive\2025\MNNR\COMPLETE2025\mnnr-complete2025\commit-message.txt" . 2>nul

echo.
echo ========================================
echo  Staging and committing changes...
echo ========================================
echo.

REM Stage all changes
git add -A

REM Show status
echo Current git status:
git status --short

echo.
echo Ready to commit!
echo.
pause

REM Commit using the prepared message
git commit -F commit-message.txt

echo.
echo ========================================
echo  Pushing to remote...
echo ========================================
echo.

REM Push to origin
git push origin main

echo.
echo ========================================
echo  SUCCESS! Changes pushed.
echo ========================================
echo.

pause
