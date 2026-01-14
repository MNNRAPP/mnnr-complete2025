# MNNR Mobile & Desktop Apps

Complete cross-platform applications for MNNR.

## 📱 Mobile Apps (iOS & Android)

Built with Capacitor wrapping the Next.js web app.

### Requirements
- Node.js 18+
- Xcode (for iOS builds, macOS only)
- Android Studio (for Android builds)

### Build Mobile Apps

```powershell
# Navigate to mobile directory
cd mobile

# Run build script
.\build-mobile.ps1

# Open in Xcode (iOS)
npm run open:ios

# Open in Android Studio
npm run open:android
```

### Mobile App Features
- Native iOS and Android apps
- Offline support
- Push notifications ready
- Native status bar theming
- Splash screen
- Haptic feedback
- Native keyboard handling

## 🖥️ Desktop Apps (Windows, macOS, Linux)

Built with Electron.

### Requirements
- Node.js 18+

### Build Desktop Apps

```powershell
# Navigate to desktop directory
cd desktop

# Build for Windows
.\build-desktop.ps1

# Or build manually for specific platforms:
npm install
npm run build:win    # Windows
npm run build:mac    # macOS
npm run build:linux  # Linux
npm run build:all    # All platforms
```

### Desktop App Features
- Native Windows/Mac/Linux apps
- Auto-updates
- System tray integration
- Native menus
- Deep linking
- Offline support

## 📦 Distribution

### iOS App Store
1. Build with `npm run run:ios` in mobile/
2. Open in Xcode
3. Archive and upload to App Store Connect
4. Submit for review

### Google Play Store
1. Build with `npm run run:android` in mobile/
2. Open in Android Studio
3. Generate signed APK/AAB
4. Upload to Google Play Console
5. Submit for review

### Windows Microsoft Store
1. Build with `npm run build:win` in desktop/
2. Package for Windows Store
3. Submit to Partner Center

### macOS App Store
1. Build with `npm run build:mac` in desktop/
2. Sign with Apple Developer ID
3. Submit to App Store Connect

### Linux
- Distribute AppImage, .deb, or Snap packages
- Built automatically with `npm run build:linux`

## 🔧 Development

### Running in Development

**Mobile:**
```bash
cd mobile
npm run run:ios      # iOS dev mode
npm run run:android  # Android dev mode
```

**Desktop:**
```bash
cd desktop
npm start            # Electron dev mode
```

## 🎨 Customization

### App Icons
- Replace `mobile/resources/icon.png` (1024x1024)
- Replace `desktop/icon.png`, `icon.ico`, `icon.icns`

### Splash Screens
- Replace `mobile/resources/splash.png` (2732x2732)

### App Name & Bundle ID
- Mobile: Edit `mobile/capacitor.config.json`
- Desktop: Edit `desktop/package.json`

## 🚀 Next Steps

1. Test on physical devices
2. Set up CI/CD for automated builds
3. Configure app store listings
4. Set up crash reporting (Sentry)
5. Implement analytics
6. Enable push notifications
7. Submit to app stores

## 📚 Resources

- [Capacitor Docs](https://capacitorjs.com/docs)
- [Electron Docs](https://www.electronjs.org/docs)
- [App Store Guidelines](https://developer.apple.com/app-store/review/guidelines/)
- [Play Store Guidelines](https://play.google.com/about/developer-content-policy/)
