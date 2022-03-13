import React from 'react';
import { act } from 'react-dom/test-utils';
import { createContainer } from 'react-sweet-state';
import { mountWithDi } from '@codexporer.io/react-test-utils';
import Constants, { AppOwnership } from 'expo-constants';
import * as SecureStore from 'expo-secure-store';
import * as uuid from 'uuid';
import assign from 'lodash/assign';
import {
    APP_CONTAINER,
    Store,
    useAppInfo,
    useAppInfoActions
} from './index';

jest.mock('uuid', () => {
    let uuid = -1;

    return {
        v4: () => {
            uuid += 1;
            return `uuid-${uuid}`;
        },
        reset: () => {
            uuid = 0;
        }
    };
});

jest.mock('expo-constants', () => ({
    ...jest.requireActual('expo-constants'),
    manifest: {
        name: 'mockAppName',
        version: 'mockAppVersion'
    }
}));

jest.mock('expo-application', () => ({
    getInstallationTimeAsync: () => Promise.resolve('mockInstalationTime')
}));

jest.mock('expo-secure-store', () => {
    let data = {};

    return {
        setItemAsync: async (key, value) => {
            data[key] = value;
        },
        getItemAsync: async key => data[key],
        ALWAYS: 'mockAlways',
        reset: () => {
            data = {};
        }
    };
});

const Container = createContainer(Store);

const createHookRenderer = useHook => {
    const hookResult = {};
    const HookRenderer = () => {
        const [state, actions] = useHook();
        assign(hookResult, { state, actions });
        return null;
    };

    return {
        hookResult,
        HookRenderer: () => (
            <Container>
                <HookRenderer />
            </Container>
        )
    };
};

describe('App info', () => {
    beforeEach(() => {
        Constants.appOwnership = AppOwnership.Expo;
        SecureStore.reset();
        uuid.reset();
        jest.clearAllMocks();
    });

    describe('useAppInfo', () => {
        it('should have initial values', () => {
            const {
                HookRenderer,
                hookResult
            } = createHookRenderer(useAppInfo);

            mountWithDi(<HookRenderer />);

            expect(hookResult.state).toEqual({
                appContainer: undefined,
                appName: undefined,
                appVersion: undefined,
                installationId: undefined,
                sessionId: undefined
            });
        });

        it('should initialize after initialize is called', async () => {
            const {
                HookRenderer,
                hookResult
            } = createHookRenderer(useAppInfo);

            mountWithDi(<HookRenderer />);

            await act(() => hookResult.actions.initialize());

            expect(hookResult.state).toEqual({
                appContainer: 'expo',
                appName: 'mockAppName',
                appVersion: 'mockAppVersion',
                installationTime: 'mockInstalationTime',
                installationId: 'uuid-1',
                sessionId: 'uuid-0'
            });
            expect(
                await SecureStore.getItemAsync('codexporer.io-expo_app_info-installation_id')
            ).toBe('uuid-1');
        });

        it('should initialize with appContainer passed as an argument', async () => {
            const {
                HookRenderer,
                hookResult
            } = createHookRenderer(useAppInfo);

            mountWithDi(<HookRenderer />);

            await act(() => hookResult.actions.initialize({ appContainer: 'mockAppContainer' }));

            expect(hookResult.state).toEqual(
                expect.objectContaining({
                    appContainer: 'mockAppContainer'
                })
            );
        });

        it('should not change when initialize is called multiple times', async () => {
            const {
                HookRenderer,
                hookResult
            } = createHookRenderer(useAppInfo);

            mountWithDi(<HookRenderer />);

            await act(() => hookResult.actions.initialize());
            await act(() => hookResult.actions.initialize());
            await act(() => hookResult.actions.initialize());

            expect(hookResult.state).toEqual({
                appContainer: 'expo',
                appName: 'mockAppName',
                appVersion: 'mockAppVersion',
                installationTime: 'mockInstalationTime',
                installationId: 'uuid-1',
                sessionId: 'uuid-0'
            });
        });

        it.each`
            appOwnership               | appContainer
            ${undefined}               | ${APP_CONTAINER.native}
            ${AppOwnership.Expo}       | ${APP_CONTAINER.expo}
            ${AppOwnership.Standalone} | ${APP_CONTAINER.native}
            ${AppOwnership.Guest}      | ${APP_CONTAINER.native}
        `(
            'should set app container "$appContainer" when appOwnership is "$appOwnership"',
            async ({ appOwnership, appContainer }) => {
                Constants.appOwnership = appOwnership;
                const {
                    HookRenderer,
                    hookResult
                } = createHookRenderer(useAppInfo);

                mountWithDi(<HookRenderer />);

                await act(() => hookResult.actions.initialize());

                expect(hookResult.state).toEqual(
                    expect.objectContaining({
                        appContainer
                    })
                );
            }
        );
    });

    describe('useAppInfoActions', () => {
        it('should not have state', () => {
            const {
                HookRenderer,
                hookResult
            } = createHookRenderer(useAppInfoActions);

            mountWithDi(<HookRenderer />);

            expect(hookResult.state).toBeUndefined();
        });

        it('should not have state after initialization', async () => {
            const {
                HookRenderer,
                hookResult
            } = createHookRenderer(useAppInfoActions);

            mountWithDi(<HookRenderer />);

            await act(() => hookResult.actions.initialize());

            expect(hookResult.state).toBeUndefined();
            expect(
                await SecureStore.getItemAsync('codexporer.io-expo_app_info-installation_id')
            ).toBe('uuid-1');
        });
    });
});
