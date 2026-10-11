# AGENTS.md — `@codexporer.io/expo-app-info`

## Package Overview
Global application runtime info store powered by `react-sweet-state`, `expo-constants`, `expo-application`, and `expo-secure-store`. Provides persistent installation ID, app version, container type, and semver comparison utilities.

## Key Exports
- `useAppInfo()`: Returns `[state, actions]`.
- `useAppInfoActions()`: Returns `[, { initialize }]`.
- `APP_CONTAINER`: Enum constants `{ expo: 'expo', native: 'native', web: 'web' }`.
- `areAppVersionsEqual(v1, v2)`: Semantic version equality checker.
- `isCurrentAppVersionGreaterThanAppVersion(v1, v2)`: Checks if current version is newer.
- `isCurrentAppVersionLowerThanAppVersion(v1, v2)`: Checks if current version is older.

## Critical Guidelines for AI Agents
- **Bootstrap Requirement**: Always `await initializeAppInfo()` during root application bootstrap before rendering main navigation if screens depend on app version or installation ID.
- **Persistent UUID**: `installationId` is generated once and persisted in `SecureStore` (keychain on iOS). It survives app restarts.
- **Session Identification**: `sessionId` is generated once in memory at process start and remains constant throughout the current session.
- **Version Checks**: Use `isCurrentAppVersionGreaterThanAppVersion` or `areAppVersionsEqual` instead of manual string or float comparisons for semantic version strings (e.g. `'1.10.2'`).
