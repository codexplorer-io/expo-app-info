import { createStore, createHook } from 'react-sweet-state';
import Constants, { AppOwnership } from 'expo-constants';
import * as Application from 'expo-application';
import * as SecureStore from 'expo-secure-store';
import { v4 as uuid } from 'uuid';
import split from 'lodash/split';
import max from 'lodash/max';

const sessionId = uuid();

const getInstallationId = async () => {
    const key = 'codexporer.io-expo_app_info-installation_id';
    let installationId;
    try {
        installationId = await SecureStore.getItemAsync(key);
    } catch {
        installationId = null;
    }
    if (!installationId) {
        installationId = uuid();
        await SecureStore.setItemAsync(key, installationId, {
            keychainAccessible: SecureStore.ALWAYS
        });
    }

    return installationId;
};

export const APP_CONTAINER = {
    expo: 'expo',
    native: 'native',
    web: 'web'
};

export const Store = createStore({
    initialState: {
        appName: undefined,
        appVersion: undefined,
        installationTime: undefined,
        installationId: undefined,
        sessionId: undefined,
        appContainer: undefined
    },
    actions: {
        initialize: ({ appContainer } = {}) => async ({ setState }) => {
            const installationId = await getInstallationId();
            const manifest = Constants.manifest2?.extra?.expoClient ?? Constants.manifest;
            setState({
                appName: manifest?.name,
                appVersion: manifest?.version ?? Constants.expoConfig?.version,
                installationTime: await Application.getInstallationTimeAsync(),
                installationId,
                sessionId,
                appContainer: appContainer ?? (
                    Constants.appOwnership === AppOwnership.Expo ?
                        APP_CONTAINER.expo :
                        APP_CONTAINER.native
                )
            });
        }
    },
    name: 'AppInfo'
});

export const useAppInfo = createHook(Store);

export const useAppInfoActions = createHook(Store, { selector: null });

export const areAppVersionsEqual = (
    currentAppVersion,
    appVersion
) => currentAppVersion === appVersion;

const compareCurrentAppVersionWithAppVersion = (
    currentAppVersion,
    appVersion,
    versionsPartComparator
) => {
    const currentAppVersionParts = split(currentAppVersion, '.');
    const appVersionParts = split(appVersion, '.');
    const length = max([
        currentAppVersionParts.length,
        appVersionParts.length
    ]);

    for (let i = 0; i < length; i += 1) {
        const currentAppVersionPart = currentAppVersionParts[i] ?
            +currentAppVersionParts[i] :
            0;
        const appVersionPart = appVersionParts[i] ?
            +appVersionParts[i] :
            0;

        const compare = versionsPartComparator(currentAppVersionPart, appVersionPart);
        if (compare !== undefined) {
            return compare;
        }
    }

    return false;
};

export const isCurrentAppVersionGreaterThanAppVersion = (
    currentAppVersion,
    appVersion
) => compareCurrentAppVersionWithAppVersion(
    currentAppVersion,
    appVersion,
    (currentAppVersionPart, appVersionPart) => {
        if (currentAppVersionPart > appVersionPart) {
            return true;
        }

        if (currentAppVersionPart < appVersionPart) {
            return false;
        }

        return undefined;
    }
);

export const isCurrentAppVersionLowerThanAppVersion = (
    currentAppVersion,
    appVersion
) => compareCurrentAppVersionWithAppVersion(
    currentAppVersion,
    appVersion,
    (currentAppVersionPart, appVersionPart) => {
        if (currentAppVersionPart < appVersionPart) {
            return true;
        }

        if (currentAppVersionPart > appVersionPart) {
            return false;
        }

        return undefined;
    }
);
