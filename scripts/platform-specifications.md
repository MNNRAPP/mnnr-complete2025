# MNNR Multi-Platform Specifications
## Web, Mobile & Desktop Application Architecture

---

## 🌐 WEB PLATFORM (Next.js 14)

### Technical Specifications

```yaml
Framework: Next.js 14.2.35
Runtime: Node.js 20+
Package Manager: pnpm 8+
Styling: Tailwind CSS 3.4
UI Components: Radix UI + shadcn/ui
State Management: React Context + SWR
Authentication: Supabase Auth
Database: Supabase PostgreSQL
Payments: Stripe
Analytics: PostHog + Vercel Analytics
Error Tracking: Sentry
```

### Performance Requirements

| Metric | Target | Current |
|--------|--------|---------|
| Lighthouse Performance | > 90 | 85 |
| Lighthouse Accessibility | > 95 | 92 |
| Lighthouse Best Practices | > 95 | 95 |
| Lighthouse SEO | > 95 | 98 |
| First Contentful Paint | < 1.5s | 1.2s |
| Largest Contentful Paint | < 2.5s | 2.1s |
| Time to Interactive | < 3.0s | 2.8s |
| Cumulative Layout Shift | < 0.1 | 0.05 |

### Web Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    MNNR Web App                         │
├─────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │
│  │   App       │  │   Docs      │  │  Dashboard  │     │
│  │   Router    │  │   Pages     │  │   Pages     │     │
│  └─────────────┘  └─────────────┘  └─────────────┘     │
├─────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────┐   │
│  │              Shared Components                    │   │
│  │  Button | Card | Toast | Modal | Form | Table   │   │
│  └─────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │
│  │   Supabase  │  │   Stripe    │  │   PostHog   │     │
│  │   Client    │  │   Client    │  │   Client    │     │
│  └─────────────┘  └─────────────┘  └─────────────┘     │
└─────────────────────────────────────────────────────────┘
```

### Directory Structure

```
webapp/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Auth route group
│   ├── (dashboard)/       # Dashboard routes
│   ├── api/               # API routes
│   ├── docs/              # Documentation
│   └── layout.tsx         # Root layout
├── components/            # React components
│   ├── ui/               # Base UI components
│   └── features/         # Feature components
├── lib/                   # Utility functions
├── providers/            # React context providers
├── styles/               # Global styles
├── public/               # Static assets
└── tests/                # Test files
```

---

## 📱 MOBILE PLATFORM (React Native + Expo)

### Technical Specifications

```yaml
Framework: React Native 0.74+
Toolchain: Expo SDK 51
UI Library: React Native Paper + NativeWind
Navigation: React Navigation 6
State: Zustand + React Query
Auth: Supabase Auth (native)
Push Notifications: Expo Notifications
Biometrics: expo-local-authentication
Secure Storage: expo-secure-store
```

### Platform Support

| Platform | Min Version | Target Version |
|----------|-------------|----------------|
| iOS | 14.0 | 17.0 |
| Android | 8.0 (API 26) | 14 (API 34) |

### Mobile Architecture

```
┌─────────────────────────────────────────────────────────┐
│                  MNNR Mobile App                        │
├─────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │
│  │   Home      │  │  API Keys   │  │   Usage     │     │
│  │   Screen    │  │   Screen    │  │   Screen    │     │
│  └─────────────┘  └─────────────┘  └─────────────┘     │
├─────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────┐   │
│  │            @mnnr/shared Components              │   │
│  │  (80%+ code reuse from web)                     │   │
│  └─────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │
│  │   Native    │  │   Push      │  │  Biometric  │     │
│  │   Storage   │  │   Notifs    │  │    Auth     │     │
│  └─────────────┘  └─────────────┘  └─────────────┘     │
└─────────────────────────────────────────────────────────┘
```

### Mobile-Specific Features

```typescript
// packages/mobile/src/features/

// 1. Biometric Authentication
export const useBiometricAuth = () => {
  const authenticate = async () => {
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Authenticate to access MNNR',
      fallbackLabel: 'Use passcode',
    });
    return result.success;
  };
  return { authenticate };
};

// 2. Push Notifications
export const usePushNotifications = () => {
  useEffect(() => {
    registerForPushNotifications();
  }, []);

  const registerForPushNotifications = async () => {
    const { status } = await Notifications.requestPermissionsAsync();
    if (status === 'granted') {
      const token = await Notifications.getExpoPushTokenAsync();
      await api.registerPushToken(token.data);
    }
  };
};

// 3. Secure API Key Storage
export const useSecureStorage = () => {
  const storeApiKey = async (key: string) => {
    await SecureStore.setItemAsync('mnnr_api_key', key);
  };
  
  const getApiKey = async () => {
    return SecureStore.getItemAsync('mnnr_api_key');
  };
  
  return { storeApiKey, getApiKey };
};
```

### Mobile Build Commands

```bash
# Development
npx expo start

# iOS Build
eas build --platform ios --profile preview
eas build --platform ios --profile production

# Android Build
eas build --platform android --profile preview
eas build --platform android --profile production

# Submit to App Stores
eas submit --platform ios
eas submit --platform android
```

### App Store Requirements

#### iOS App Store
- [ ] App Store screenshots (6.5", 5.5" displays)
- [ ] App description and keywords
- [ ] Privacy policy URL
- [ ] Support URL
- [ ] App Review information
- [ ] In-App Purchase configuration
- [ ] App Privacy questionnaire

#### Google Play Store
- [ ] Store listing graphics (phone, tablet)
- [ ] Short and full description
- [ ] Content rating questionnaire
- [ ] Data safety section
- [ ] Target audience declaration
- [ ] App signing configuration

---

## 🖥️ DESKTOP PLATFORM (Electron)

### Technical Specifications

```yaml
Framework: Electron 30+
UI: React (shared with web)
Bundler: Vite + electron-vite
Auto-Update: electron-updater
Installer: electron-builder
Code Signing: macOS, Windows, Linux
```

### Platform Support

| Platform | Architectures | Installer |
|----------|---------------|-----------|
| macOS | x64, arm64 | DMG, pkg |
| Windows | x64, arm64 | NSIS, MSI |
| Linux | x64, arm64 | AppImage, deb, rpm |

### Desktop Architecture

```
┌─────────────────────────────────────────────────────────┐
│                  MNNR Desktop App                       │
├─────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────┐   │
│  │              Main Process (Node.js)             │   │
│  │  - IPC handlers                                  │   │
│  │  - Native menus                                  │   │
│  │  - Auto-updater                                  │   │
│  │  - System tray                                   │   │
│  └─────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────┐   │
│  │            Renderer Process (Chromium)          │   │
│  │  - React app (shared with web)                  │   │
│  │  - @mnnr/shared components                      │   │
│  │  - Platform-specific UI                         │   │
│  └─────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │
│  │   Native    │  │   System    │  │   Deep      │     │
│  │   Menus     │  │   Tray      │  │   Links     │     │
│  └─────────────┘  └─────────────┘  └─────────────┘     │
└─────────────────────────────────────────────────────────┘
```

### Desktop-Specific Features

```typescript
// packages/desktop/src/main/

// 1. System Tray
const createTray = () => {
  const tray = new Tray(path.join(__dirname, 'tray-icon.png'));
  const contextMenu = Menu.buildFromTemplate([
    { label: 'Open MNNR', click: () => mainWindow.show() },
    { label: 'API Usage', click: () => openUsageDashboard() },
    { type: 'separator' },
    { label: 'Quit', click: () => app.quit() }
  ]);
  tray.setContextMenu(contextMenu);
};

// 2. Auto-Update
const setupAutoUpdater = () => {
  autoUpdater.setFeedURL({
    provider: 'github',
    owner: 'mnnr',
    repo: 'mnnr-desktop'
  });
  
  autoUpdater.on('update-available', () => {
    dialog.showMessageBox({
      message: 'Update available. Downloading...'
    });
  });
  
  autoUpdater.checkForUpdatesAndNotify();
};

// 3. Deep Links
app.setAsDefaultProtocolClient('mnnr');
app.on('open-url', (event, url) => {
  // Handle mnnr:// URLs
  const parsedUrl = new URL(url);
  if (parsedUrl.hostname === 'callback') {
    handleOAuthCallback(parsedUrl);
  }
});
```

### Desktop Build Commands

```bash
# Development
npm run electron:dev

# Build for current platform
npm run electron:build

# Build for all platforms
npm run electron:build:all

# Build and sign
npm run electron:build:signed

# Publish release
npm run electron:publish
```

### Code Signing Requirements

```yaml
# macOS
Developer ID Application: MNNR Inc (TEAM_ID)
Apple Developer Program membership
Notarization with Apple

# Windows
EV Code Signing Certificate
Hardware token (HSM)
Windows Dev Center account

# Linux
GPG signing for packages
```

---

## 🔄 SHARED CODE ARCHITECTURE

### Monorepo Structure

```
mnnr/
├── apps/
│   ├── web/              # Next.js web app
│   ├── mobile/           # React Native app
│   └── desktop/          # Electron app
├── packages/
│   ├── shared/           # Shared code (80%+)
│   │   ├── components/   # UI components
│   │   ├── hooks/        # Custom hooks
│   │   ├── utils/        # Utility functions
│   │   ├── types/        # TypeScript types
│   │   └── api/          # API client
│   ├── ui/               # Platform-specific UI
│   └── config/           # Shared configuration
└── tooling/
    ├── eslint/           # ESLint config
    ├── typescript/       # TypeScript config
    └── testing/          # Test utilities
```

### Shared Components

```typescript
// packages/shared/src/components/Button.tsx

import { Platform } from '@mnnr/platform';

export interface ButtonProps {
  variant: 'primary' | 'secondary' | 'ghost';
  size: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  onPress: () => void;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = (props) => {
  // Platform-agnostic button component
  // Renders native button on mobile, HTML button on web
  const Component = Platform.select({
    web: WebButton,
    native: NativeButton,
    desktop: DesktopButton,
  });
  
  return <Component {...props} />;
};
```

### Shared API Client

```typescript
// packages/shared/src/api/client.ts

export class MNNRClient {
  private baseUrl: string;
  private apiKey: string;

  constructor(config: MNNRConfig) {
    this.baseUrl = config.baseUrl || 'https://api.mnnr.app';
    this.apiKey = config.apiKey;
  }

  // Usage tracking
  async trackUsage(params: TrackUsageParams): Promise<UsageRecord> {
    return this.request('/v1/usage', { method: 'POST', body: params });
  }

  // API key management
  async createApiKey(params: CreateKeyParams): Promise<ApiKey> {
    return this.request('/v1/keys', { method: 'POST', body: params });
  }

  async listApiKeys(): Promise<ApiKey[]> {
    return this.request('/v1/keys', { method: 'GET' });
  }

  // Subscription management
  async getSubscription(): Promise<Subscription> {
    return this.request('/v1/subscription', { method: 'GET' });
  }
}
```

---

## 📊 CROSS-PLATFORM FEATURES

### Feature Parity Matrix

| Feature | Web | Mobile | Desktop |
|---------|-----|--------|---------|
| Dashboard | ✅ | ✅ | ✅ |
| API Key Management | ✅ | ✅ | ✅ |
| Usage Analytics | ✅ | ✅ | ✅ |
| Billing Management | ✅ | ✅ | ✅ |
| Team Management | ✅ | ✅ | ✅ |
| Documentation | ✅ | ✅ | ✅ |
| Push Notifications | ❌ | ✅ | ✅ |
| Biometric Auth | ❌ | ✅ | ✅ |
| System Tray | ❌ | ❌ | ✅ |
| Deep Links | ✅ | ✅ | ✅ |
| Offline Mode | 🔄 | ✅ | ✅ |

### Platform-Specific Optimizations

```typescript
// packages/shared/src/utils/platform.ts

export const getPlatformConfig = () => {
  return {
    web: {
      cacheStrategy: 'network-first',
      imageFormat: 'webp',
      animationDuration: 200,
    },
    mobile: {
      cacheStrategy: 'cache-first',
      imageFormat: 'optimized',
      animationDuration: 300,
      hapticFeedback: true,
    },
    desktop: {
      cacheStrategy: 'network-first',
      imageFormat: 'png',
      animationDuration: 150,
      nativeMenus: true,
    },
  };
};
```

---

## 🚀 RELEASE PROCESS

### Version Strategy

```
Major.Minor.Patch-Platform

Examples:
- 1.0.0 (all platforms)
- 1.0.1-web (web-only hotfix)
- 1.1.0 (feature release)
- 2.0.0 (breaking changes)
```

### Release Checklist

- [ ] All tests passing
- [ ] Version bumped
- [ ] Changelog updated
- [ ] Web deployed to Vercel
- [ ] Mobile builds submitted to stores
- [ ] Desktop builds signed and published
- [ ] Documentation updated
- [ ] Release notes published

---

*Last Updated: January 2026*
*Version: 1.0.0*
