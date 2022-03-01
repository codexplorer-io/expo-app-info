import { createStore, createHook } from 'react-sweet-state';
import Constants, { AppOwnership } from 'expo-constants';
import * as Application from 'expo-application';
import * as SecureStore from 'expo-secure-store';
import { v4 as uuid } from 'uuid';

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
            setState({
                appName: Constants.manifest?.name,
                appVersion: Constants.manifest?.version,
                installationTime: await Application.getInstallationTimeAsync(),
                installationId,
                sessionId,
                appContainer: appContainer ?? (
                    Constants.appOwnership === AppOwnership.Expo ? APP_CONTAINER.expo :
                        (
                            Constants.appOwnership === AppOwnership.Standalone ||
                            Constants.appOwnership === AppOwnership.Guest
                        ) ? APP_CONTAINER.native : null
                )
            });
        }
    },
    name: 'AppInfo'
});

export const useAppInfo = createHook(Store);

export const useAppInfoActions = createHook(Store, { selector: null });
