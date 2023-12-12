# expo-app-info
App info hook react-native, expo and react.

## Platform Compatibility
iOS|Android|Web|
-|-|-|
✅|✅|✅|

## Usage
Before using the app info, it needs to be initalized within the root component:
```javascript
// index.js

import { useAppInfoActions, APP_CONTAINER } from '@codexporer.io/expo-app-info';
import { App } from './app';
...

const AppRoot = () => {
    const [isInitialized, setIsInitialized] = useState(false);
    const [, { initialize: initializeAppInfo }] = useAppInfoActions();
    
    useEffect(() => {
        if (isInitialized) {
            return;
        }

        initializeAppInfo({ appContainer: APP_CONTAINER.web }).then(
            () => setIsInitialized(true)
        );
    }, [
        initializeAppInfo,
        isInitialized,
        setIsInitialized
    ]);
    ...
    
    if (!isInitialized) {
        return null;
    }
    
    return (
        <App />
    );
};

ReactDOM.render(
    <React.StrictMode>
        <AppRoot />
    </React.StrictMode>,
    document.getElementById('root')
);
```

After initialization, app info can be used anywhere whithin the descendants:
```javascript
// app.js

import { useAppInfo } from '@codexporer.io/expo-app-info';
...

export const App = () => {
    const [{
        appName,
        appVersion,
        installationId,
        sessionId,
        appContainer,
        startTime
    }] = useAppInfo();
    ...
    
    return (
        ...
    );
};
```

## Web support
Hook is supported within react native & expo out of the box. To add web support some modules needs to be mocked, if already not. Steps to mock modules:
1. Mock `expo-constants` package:
- Create package directory as a child of your app, eg. `my-app/src/packages/expo-constants`;
- Create file `my-app/src/packages/expo-constants/package.json` with content:
```json
{
    "name": "expo-constants",
    "version": "1.0.0",
    "main": "src/index.js"
}
```
- Create file `my-app/src/packages/expo-constants/src/index.js` with content:
```javascript
const constants = {
    manifest: {
        name: 'App Name',
        version: 'X.Y.Z'
    },
    appOwnership: null
};

export const AppOwnership = {
    Standalone: 'standalone',
    Expo: 'expo',
    Guest: 'guest'
};

export default constants;
```
2. Mock `expo-secure-store` package:
- Create package directory as a child of your app, eg. `my-app/src/packages/expo-secure-store`;
- Create file `my-app/src/packages/expo-secure-store/package.json` with content:
```json
{
    "name": "expo-secure-store",
    "version": "1.0.0",
    "main": "src/index.js"
}
```
- Create file `my-app/src/packages/expo-secure-store/src/index.js` with content:
```javascript
import AsyncStorage from '@react-native-async-storage/async-storage';

export const getItemAsync = key => AsyncStorage.getItem(key);

export const setItemAsync = (key, value) => AsyncStorage.setItem(key, value);

export const ALWAYS = null;
```
3. Mock `expo-application` package:
- Create package directory as a child of your app, eg. `my-app/src/packages/expo-application`;
- Create file `my-app/src/packages/expo-application/package.json` with content:
```json
{
    "name": "expo-application",
    "version": "1.0.0",
    "main": "src/index.js"
}
```
- Create file `my-app/src/packages/expo-application/src/index.js` with content:
```javascript
export const getInstallationTimeAsync = async () => null;
```
4. Install `@react-native-async-storage/async-storage` as an app dependency and if using `yarn` add mocked packages as submodules within app `my-app/package.json`:
```json
{
    "workspaces": [
      "src/packages/*",
      ...
    ],
    "dependencies": {
        "@react-native-async-storage/async-storage": ...,
        ...
    },
    ...
}
```
If not using `yarn`, use your preferred method to install mocked modules as app dependencies.

## Exports
symbol|description|
-|-|
useAppInfo|hook used to access app info state and actions|
useAppInfoActions|hook used to access app info actions|
APP_CONTAINER|constant used to detect app container (expo - when app container is expo go app; native - when app is running as an standalone native app; web - when app is running as a web app). When app is `expo` or `native` it will be autodetedted, while for `web`, container needs to be passed as an initialization parameter|
areAppVersionsEqual|util function to compare if current app version (1st argument) is equal to app version (2nd argument). Returns `true` if equal, otherwise `false`.|
isCurrentAppVersionGreaterThanAppVersion|util function to compare if current app version (1st argument) is greater than app version (2nd argument). Returns `true` if current version is greater, otherwise `false`.|
isCurrentAppVersionLowerThanAppVersion|util function to compare if current app version (1st argument) is lower than app version (2nd argument). Returns `true` if current version is lower, otherwise `false`.|

## useAppInfoActions
Returns an array `[null, { initialize }]`. `initialize` is used for app info initialization and returns resolved promise after app has been initialized

## useAppInfo
Returns an array `[{ ...state }, { initialize }]`. `initialize` is used for app info initialization and returns resolved promise after app has been initialized

### State
option|description|
-|-|
appName|name of the app|
appVersion|current version of the app|
installationId|an identifier that is unique to this particular device and whose lifetime is at least as long as the installation of the app|
sessionId|a string that is unique to the current session of your app. It is different across apps and across multiple launches of the same app|
appContainer|context in which app is running (expo, native or web)|
startTime|Date when app was started|
