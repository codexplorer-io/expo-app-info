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

## Required Setup
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
  const [{ appName, appVersion, installationId, sessionId }] = useAppInfo();

  const isNewFeatureAvailable = isCurrentAppVersionGreaterThanAppVersion(appVersion, '1.2.0');

  return (
    <View style={{ padding: 16 }}>
      <Text>{appName} v{appVersion}</Text>
      <Text>Install ID: {installationId}</Text>
      <Text>Session ID: {sessionId}</Text>
      {isNewFeatureAvailable && <Text>Pro tools enabled!</Text>}
    </View>
  );
}
```

---

## API Reference

### State Properties (`useAppInfo()[0]`)

| Property | Type | Description |
| :--- | :--- | :--- |
| `appName` | `string \| undefined` | App name from Expo manifest or config |
| `appVersion` | `string \| undefined` | App version string (e.g. `'1.4.2'`) |
| `installationTime` | `Date \| undefined` | Initial installation timestamp |
| `installationId` | `string \| undefined` | Persistent UUID stored in SecureStore |
| `appContainer` | `'expo' \| 'native' \| 'web'` | Runtime container environment |
| `sessionId` | `string` | Ephemeral UUID generated on launch |
| `startTime` | `Date` | Process start time |

### Constants & Utility Functions

| Identifier | Type / Signature | Description |
| :--- | :--- | :--- |
| `APP_CONTAINER` | `{ expo: 'expo', native: 'native', web: 'web' }` | Runtime environment container constants |
| `areAppVersionsEqual` | `(v1: string, v2: string) => boolean` | Compares two semantic version strings |
| `isCurrentAppVersionGreaterThanAppVersion` | `(current: string, target: string) => boolean` | Returns true if `current` > `target` |
| `isCurrentAppVersionLowerThanAppVersion` | `(current: string, target: string) => boolean` | Returns true if `current` < `target` |

---

## Critical Rules & Guidelines
1. **Initialize Once at Root**: Call `initialize()` before consuming `installationId` in dependent services.
2. **Never Compare Raw Version Strings**: Do not use `>` or `<` on strings (e.g. `'1.10.0' < '1.2.0'` in lexicographical string comparison is true!). Always use `isCurrentAppVersionGreaterThanAppVersion`.
