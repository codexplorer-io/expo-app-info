# `@codexporer.io/expo-app-info`

Application runtime metadata and lifecycle store for React Native, Expo, and React Web. Provides persistent installation ID (via `expo-secure-store` / keychain), ephemeral session ID, runtime container detection, and semver comparison utilities backed by `react-sweet-state`.

## Platform Compatibility

| iOS | Android | Web |
| :---: | :---: | :---: |
| ✅ | ✅ | ✅ |

## Installation & Peer Dependencies

```bash
yarn add @codexporer.io/expo-app-info
```

Peer dependencies:
- `react` (`*`)
- `react-native` (`*`)
- `react-sweet-state` (`*`)
- `expo-constants` (`*`)
- `expo-application` (`*`)
- `expo-secure-store` (`*`)
- `uuid` (`*`)
- `lodash` (`*`)

## Quick Start

### 1. Initialize During App Bootstrap

Call `initialize` once at application startup before rendering screens that depend on app metadata:

```tsx
import React, { useState, useEffect } from 'react';
import { ActivityIndicator } from 'react-native';
import { useAppInfoActions, APP_CONTAINER } from '@codexporer.io/expo-app-info';

export const AppRoot = ({ children }: { children: React.ReactNode }) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [, { initialize: initializeAppInfo }] = useAppInfoActions();

  useEffect(() => {
    initializeAppInfo().then(() => setIsInitialized(true));
  }, [initializeAppInfo]);

  if (!isInitialized) {
    return <ActivityIndicator size="large" />;
  }

  return <>{children}</>;
};
```

### 2. Access App Information Anywhere in Descendants

```tsx
import React from 'react';
import { View, Text } from 'react-native';
import {
  useAppInfo,
  isCurrentAppVersionGreaterThanAppVersion
} from '@codexporer.io/expo-app-info';

export const AppVersionWidget = () => {
  const [appInfo] = useAppInfo();

  const isUpgrade = isCurrentAppVersionGreaterThanAppVersion(
    appInfo.appVersion ?? '1.0.0',
    '1.2.0'
  );

  return (
    <View style={{ padding: 16 }}>
      <Text>App: {appInfo.appName} (v{appInfo.appVersion})</Text>
      <Text>Install ID: {appInfo.installationId}</Text>
      <Text>Session ID: {appInfo.sessionId}</Text>
      <Text>Runtime: {appInfo.appContainer}</Text>
      {isUpgrade && <Text>New features enabled!</Text>}
    </View>
  );
};
```

## API Reference

### Key Exports

| Symbol | Type | Description |
| :--- | :--- | :--- |
| `useAppInfo` | `() => [AppInfoState, AppInfoActions]` | Hook used to access app info state and actions |
| `useAppInfoActions` | `() => [null, AppInfoActions]` | Hook returning actions object without subscribing to state updates |
| `APP_CONTAINER` | `object` | Container constants: `{ expo: 'expo', native: 'native', web: 'web' }` |
| `areAppVersionsEqual` | `(v1: string, v2: string) => boolean` | Utility checking if semantic version `v1` equals `v2` |
| `isCurrentAppVersionGreaterThanAppVersion` | `(current: string, target: string) => boolean` | Utility checking if `current` version is higher than `target` |
| `isCurrentAppVersionLowerThanAppVersion` | `(current: string, target: string) => boolean` | Utility checking if `current` version is lower than `target` |

### `AppInfoState` Fields

| Property | Type | Description |
| :--- | :--- | :--- |
| `appName` | `string \| undefined` | Name of the app extracted from manifest |
| `appVersion` | `string \| undefined` | Version string of the app (e.g. `'1.4.2'`) |
| `installationId` | `string \| undefined` | Persistent UUID stored in SecureStore / keychain surviving app restarts |
| `installationTime` | `Date \| undefined` | Initial application install timestamp |
| `sessionId` | `string` | Ephemeral UUID generated in memory for the active app session |
| `appContainer` | `'expo' \| 'native' \| 'web'` | Runtime context (`expo` for Expo Go, `native` for standalone app, `web` for browser) |
| `startTime` | `Date` | Timestamp recording when the current session began |

### `AppInfoActions`

| Action | Signature | Description |
| :--- | :--- | :--- |
| `initialize` | `(options?: { appContainer?: string }) => Promise<void>` | Reads app manifest, retrieves or generates persistent UUID, and commits state |

## License

MIT
