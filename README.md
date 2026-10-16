# `@codexporer.io/expo-app-info`

Application runtime metadata and lifecycle store for Expo and React Native. Backed by `react-sweet-state`, `expo-constants`, `expo-application`, and `expo-secure-store`.

---

## Peer Dependencies

All of the following peer dependencies must be installed in the consuming project:
- `react` (`*`)
- `react-sweet-state` (`*`)
- `expo-constants` (`*`)
- `expo-application` (`*`)
- `expo-secure-store` (`*`)
- `uuid` (`*`)
- `lodash` (`*`)

---

## Installation

```bash
yarn add @codexporer.io/expo-app-info
```

---

## Quick Start

### 1. Initialize During App Bootstrap

Call `initialize` once at application startup before rendering screens that depend on app metadata:

```tsx
import React, { useState, useEffect } from 'react';
import { ActivityIndicator } from 'react-native';
import { useAppInfoActions } from '@codexporer.io/expo-app-info';

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

---

## API Reference

### Key Exports

| Symbol | Type | Description |
| :--- | :--- | :--- |
| `Store` | `StoreModel` | Raw `react-sweet-state` store object named `'AppInfo'` |
| `useAppInfo` | `() => [AppInfoState, AppInfoActions]` | Hook used to access app info state and actions |
| `useAppInfoActions` | `() => [null, AppInfoActions]` | Hook returning actions without subscribing to state changes |
| `APP_CONTAINER` | `object` | Container constants: `{ expo: 'expo', native: 'native', web: 'web' }` |
| `areAppVersionsEqual` | `(v1: string, v2: string) => boolean` | Utility checking if semantic version `v1` equals `v2` (returns `false` if either is `null` or `undefined`) |
| `isCurrentAppVersionGreaterThanAppVersion` | `(current: string, target: string) => boolean` | Utility checking if `current` version is higher than `target` (returns `false` if either is `null` or `undefined`) |
| `isCurrentAppVersionLowerThanAppVersion` | `(current: string, target: string) => boolean` | Utility checking if `current` version is lower than `target` (returns `false` if either is `null` or `undefined`) |

### `AppInfoState` Fields

| Property | Initial Value | Populated Value on `initialize()` | Description |
| :--- | :--- | :--- | :--- |
| `appName` | `undefined` | `manifest?.name` | Extracted from `Constants.manifest2?.extra?.expoClient ?? Constants.manifest` |
| `appVersion` | `undefined` | `manifest?.version ?? Constants.expoConfig?.version` | Extracted from manifest or `Constants.expoConfig` |
| `installationId` | `undefined` | `string` (UUID v4) | Persisted in `SecureStore` under `'codexporer.io-expo_app_info-installation_id'` with `keychainAccessible: SecureStore.ALWAYS` |
| `installationTime` | `undefined` | `Date` | Returned by `Application.getInstallationTimeAsync()` |
| `appContainer` | `undefined` | `'expo' \| 'native' \| 'web'` | Passed via `initialize({ appContainer })` or defaults to `'expo'` if `Constants.appOwnership === AppOwnership.Expo`, else `'native'` |
| `sessionId` | `string` | Preserved from module load | Ephemeral UUID v4 generated once at module import |
| `startTime` | `Date` | Preserved from module load | `new Date()` timestamp created once at module import |

### `AppInfoActions`

| Action | Signature | Description |
| :--- | :--- | :--- |
| `initialize` | `(options?: { appContainer?: string }) => Promise<void>` | Reads app manifest, retrieves or generates persistent UUID, gets installation time, and commits state |

---

## License

MIT
