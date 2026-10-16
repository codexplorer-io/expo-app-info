---
name: expo-app-info
description: Instructions and guidelines for using @codexporer.io/expo-app-info (Expo App Info) in React Native and Expo applications.
---

# `@codexporer.io/expo-app-info` Skill

## Overview
`@codexporer.io/expo-app-info` provides a centralized application information store using `react-sweet-state`. It extracts app metadata, generates and persists a unique device installation ID in `expo-secure-store`, tracks runtime sessions, and provides semver version comparison functions.

---

## When to Use
- Attaching device installation ID or session ID to analytics and backend requests.
- Checking app version to display "What's New" modals or prompt for force updates.
- Distinguishing between Expo Go, standalone native builds, and web environments.

---

## Peer Dependencies
All of the following peer dependencies must be installed in the consuming project:
- `react`: `*`
- `react-sweet-state`: `*`
- `expo-constants`: `*`
- `expo-application`: `*`
- `expo-secure-store`: `*`
- `uuid`: `*`
- `lodash`: `*`

---

## Installation & Setup

```bash
yarn add @codexporer.io/expo-app-info
```

### Required Setup
Initialize during app bootstrap:

```tsx
import React, { useState, useEffect } from 'react';
import { ActivityIndicator } from 'react-native';
import { useAppInfoActions } from '@codexporer.io/expo-app-info';

export function RootApp({ children }: { children: React.ReactNode }) {
  const [isReady, setIsReady] = useState(false);
  const [, { initialize }] = useAppInfoActions();

  useEffect(() => {
    initialize().then(() => setIsReady(true));
  }, [initialize]);

  if (!isReady) {
    return <ActivityIndicator size="large" />;
  }

  return <>{children}</>;
}
```

---

## Usage Example

```tsx
import React from 'react';
import { View, Text } from 'react-native';
import {
  useAppInfo,
  isCurrentAppVersionGreaterThanAppVersion
} from '@codexporer.io/expo-app-info';

export function SettingsScreen() {
  const [{ appName, appVersion, installationId, sessionId, appContainer }] = useAppInfo();

  const isNewFeatureAvailable = isCurrentAppVersionGreaterThanAppVersion(appVersion, '1.2.0');

  return (
    <View style={{ padding: 16 }}>
      <Text>{appName} v{appVersion}</Text>
      <Text>Install ID: {installationId}</Text>
      <Text>Session ID: {sessionId}</Text>
      <Text>Container: {appContainer}</Text>
      {isNewFeatureAvailable && <Text>Pro tools enabled!</Text>}
    </View>
  );
}
```

---

## API Reference

### Key Exports

| Symbol | Type | Description |
| :--- | :--- | :--- |
| `Store` | `StoreModel` | Raw `react-sweet-state` store object named `'AppInfo'` |
| `useAppInfo` | `() => [AppInfoState, AppInfoActions]` | Hook used to access app info state and actions |
| `useAppInfoActions` | `() => [null, AppInfoActions]` | Hook returning actions object without subscribing to state updates |
| `APP_CONTAINER` | `{ expo: 'expo', native: 'native', web: 'web' }` | Runtime environment container constants |
| `areAppVersionsEqual` | `(v1: string, v2: string) => boolean` | Semantic version equality checker (returns `false` if either is `null` or `undefined`) |
| `isCurrentAppVersionGreaterThanAppVersion` | `(current: string, target: string) => boolean` | Returns `true` if `current` > `target` (returns `false` if either is `null` or `undefined`) |
| `isCurrentAppVersionLowerThanAppVersion` | `(current: string, target: string) => boolean` | Returns `true` if `current` < `target` (returns `false` if either is `null` or `undefined`) |

### State Properties (`useAppInfo()[0]`)

| Property | Type | Description |
| :--- | :--- | :--- |
| `appName` | `string \| undefined` | App name from `Constants.manifest2?.extra?.expoClient?.name ?? Constants.manifest?.name` |
| `appVersion` | `string \| undefined` | App version string from manifest or `Constants.expoConfig?.version` |
| `installationTime` | `Date \| undefined` | Initial installation timestamp from `Application.getInstallationTimeAsync()` |
| `installationId` | `string \| undefined` | Persistent UUID v4 stored in SecureStore under `'codexporer.io-expo_app_info-installation_id'` |
| `appContainer` | `'expo' \| 'native' \| 'web' \| undefined` | Defaults to `'expo'` if `Constants.appOwnership === AppOwnership.Expo`, else `'native'` |
| `sessionId` | `string` | Ephemeral UUID v4 generated once at module import |
| `startTime` | `Date` | Timestamp created once at module import |

---

## Critical Rules & Guidelines
1. **Initialize Once at Root**: Always call `initialize()` (via `useAppInfoActions()`) during root app initialization before consuming `installationId` or `installationTime`.
2. **Never Compare Raw Version Strings**: Do not use `>` or `<` directly on strings. Always use `isCurrentAppVersionGreaterThanAppVersion`.
3. **Persistent Key**: Installation ID is stored under key `'codexporer.io-expo_app_info-installation_id'` with `keychainAccessible: SecureStore.ALWAYS`.
