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
    useAppInfoActions,
    areAppVersionsEqual,
    isCurrentAppVersionGreaterThanAppVersion,
    isCurrentAppVersionLowerThanAppVersion
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

    describe('App versions comparison', () => {
        describe('areAppVersionsEqual', () => {
            it('should return true when comparing same versions', () => {
                expect(areAppVersionsEqual('1.14.5', '1.14.5')).toBe(true);
            });

            it('should return true when comparing same versions where one is missing part', () => {
                expect(areAppVersionsEqual('1.14.0', '1.14')).toBe(true);
            });

            it('should return true when comparing same versions with extra zero digits', () => {
                expect(areAppVersionsEqual('001.000014.05', '01.014.00005')).toBe(true);
            });

            it('should return false when comparing with higher version', () => {
                expect(areAppVersionsEqual('1.14.5', '1.14.6')).toBe(false);
            });

            it('should return false when comparing with lower version', () => {
                expect(areAppVersionsEqual('1.14.5', '1.14.1')).toBe(false);
            });

            it('should return false when comparing undefineds', () => {
                expect(isCurrentAppVersionLowerThanAppVersion(undefined, undefined)).toBe(false);
            });

            it('should return false when comparing nulls', () => {
                expect(isCurrentAppVersionLowerThanAppVersion(null, null)).toBe(false);
            });

            it('should return false when comparing undefined', () => {
                expect(isCurrentAppVersionLowerThanAppVersion(undefined, '2.13.10')).toBe(false);
            });

            it('should return false when comparing null', () => {
                expect(isCurrentAppVersionLowerThanAppVersion(null, '2.14.4')).toBe(false);
            });

            it('should return false when comparing with undefined', () => {
                expect(isCurrentAppVersionLowerThanAppVersion('2.14.5', undefined)).toBe(false);
            });

            it('should return false when comparing with null', () => {
                expect(isCurrentAppVersionLowerThanAppVersion('2.14.5', null)).toBe(false);
            });
        });

        describe('isCurrentAppVersionLowerThanAppVersion', () => {
            it('should return false when comparing same versions', () => {
                expect(isCurrentAppVersionLowerThanAppVersion('1.14.5', '1.14.5')).toBe(false);
            });

            it('should return true when comparing with higher major version', () => {
                expect(isCurrentAppVersionLowerThanAppVersion('1.14.5', '2.0.0')).toBe(true);
            });

            it('should return true when comparing with higher minor version', () => {
                expect(isCurrentAppVersionLowerThanAppVersion('1.14.5', '1.16.0')).toBe(true);
            });

            it('should return true when comparing with higher patch version', () => {
                expect(isCurrentAppVersionLowerThanAppVersion('1.14.5', '1.14.7')).toBe(true);
            });

            it('should return false when comparing with lower major version', () => {
                expect(isCurrentAppVersionLowerThanAppVersion('2.14.5', '1.20.0')).toBe(false);
            });

            it('should return false when comparing with lower minor version', () => {
                expect(isCurrentAppVersionLowerThanAppVersion('2.14.5', '2.13.10')).toBe(false);
            });

            it('should return false when comparing with lower patch version', () => {
                expect(isCurrentAppVersionLowerThanAppVersion('2.14.5', '2.14.4')).toBe(false);
            });

            it('should return false when comparing undefined', () => {
                expect(isCurrentAppVersionLowerThanAppVersion(undefined, '2.13.10')).toBe(false);
            });

            it('should return false when comparing null', () => {
                expect(isCurrentAppVersionLowerThanAppVersion(null, '2.14.4')).toBe(false);
            });

            it('should return false when comparing with undefined', () => {
                expect(isCurrentAppVersionLowerThanAppVersion('2.14.5', undefined)).toBe(false);
            });

            it('should return false when comparing with null', () => {
                expect(isCurrentAppVersionLowerThanAppVersion('2.14.5', null)).toBe(false);
            });
        });

        describe('isCurrentAppVersionGreaterThanAppVersion', () => {
            it('should return false when comparing same versions', () => {
                expect(isCurrentAppVersionGreaterThanAppVersion('1.14.5', '1.14.5')).toBe(false);
            });

            it('should return false when comparing with higher major version', () => {
                expect(isCurrentAppVersionGreaterThanAppVersion('1.14.5', '2.0.0')).toBe(false);
            });

            it('should return false when comparing with higher minor version', () => {
                expect(isCurrentAppVersionGreaterThanAppVersion('1.14.5', '1.16.0')).toBe(false);
            });

            it('should return false when comparing with higher patch version', () => {
                expect(isCurrentAppVersionGreaterThanAppVersion('1.14.5', '1.14.7')).toBe(false);
            });

            it('should return true when comparing with lower major version', () => {
                expect(isCurrentAppVersionGreaterThanAppVersion('2.14.5', '1.20.0')).toBe(true);
            });

            it('should return true when comparing with lower minor version', () => {
                expect(isCurrentAppVersionGreaterThanAppVersion('2.14.5', '2.13.10')).toBe(true);
            });

            it('should return true when comparing with lower patch version', () => {
                expect(isCurrentAppVersionGreaterThanAppVersion('2.14.5', '2.14.4')).toBe(true);
            });

            it('should return false when comparing undefined', () => {
                expect(isCurrentAppVersionGreaterThanAppVersion(undefined, '2.13.10')).toBe(false);
            });

            it('should return false when comparing null', () => {
                expect(isCurrentAppVersionGreaterThanAppVersion(null, '2.14.4')).toBe(false);
            });

            it('should return false when comparing with undefined', () => {
                expect(isCurrentAppVersionGreaterThanAppVersion('2.14.5', undefined)).toBe(false);
            });

            it('should return false when comparing with null', () => {
                expect(isCurrentAppVersionGreaterThanAppVersion('2.14.5', null)).toBe(false);
            });
        });
    });
});
