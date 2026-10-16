# AGENTS.md — `@codexporer.io/expo-app-info`

## Package Overview
Global application runtime info store powered by `react-sweet-state`, `expo-constants`, `expo-application`, and `expo-secure-store`. Provides persistent installation ID, app version, container type, and semver comparison utilities.

## Peer Dependencies
All of the following are required peer dependencies:
- `react`: `*`
- `react-sweet-state`: `*`
- `expo-constants`: `*`
- `expo-application`: `*`
- `expo-secure-store`: `*`
- `uuid`: `*`
- `lodash`: `*`

## Key Exports
- `Store`: The underlying `react-sweet-state` store object named `'AppInfo'`.
- `useAppInfo()`: Returns `[state, actions]`.
- `useAppInfoActions()`: Returns `[null, { initialize }]` without subscribing to store state updates.
- `APP_CONTAINER`: Enum constants `{ expo: 'expo', native: 'native', web: 'web' }`.
- `areAppVersionsEqual(currentAppVersion, appVersion)`: Semantic version equality checker (returns `false` if either is `null` or `undefined`).
- `isCurrentAppVersionGreaterThanAppVersion(currentAppVersion, appVersion)`: Returns `true` if `currentAppVersion` > `appVersion` (returns `false` if either is `null` or `undefined`).
- `isCurrentAppVersionLowerThanAppVersion(currentAppVersion, appVersion)`: Returns `true` if `currentAppVersion` < `appVersion` (returns `false` if either is `null` or `undefined`).

## Critical Guidelines for AI Agents
- **Bootstrap Requirement**: Always call `await initialize()` (via `useAppInfoActions()`) during root application bootstrap before rendering screens that depend on `appName`, `appVersion`, `installationTime`, or `installationId`.
- **Persistent UUID**: `installationId` is read from `SecureStore` key `'codexporer.io-expo_app_info-installation_id'`. If absent or upon error, a new UUID v4 is generated and persisted with `{ keychainAccessible: SecureStore.ALWAYS }`.
- **Session Identification**: `sessionId` is generated once in memory at module import (`uuid()`) and remains constant throughout the active session. `startTime` is recorded at module import (`new Date()`).
- **Container Detection**: `appContainer` defaults to `'expo'` if `Constants.appOwnership === AppOwnership.Expo`, or `'native'` otherwise. Can be explicitly overridden via `initialize({ appContainer })`.
- **Version Checks**: Use `isCurrentAppVersionGreaterThanAppVersion` or `areAppVersionsEqual` instead of raw string or float comparisons for semantic version strings (e.g. `'1.10.2'`).
