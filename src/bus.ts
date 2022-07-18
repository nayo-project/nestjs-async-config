import {Injectable, Logger} from '@nestjs/common';
import {readFileSync, readdirSync, writeFileSync, existsSync} from 'fs';
import {resolve as pathResolve} from 'path';
import {parse, stringify} from 'yaml';
import {DEFAULT} from './default';
import {Setting} from './interface';
import {chooseStoreConnection} from './store';
import * as AppRootPath from 'app-root-path';

@Injectable()
export class AsyncConfigBus {

    static connectionStore: any;
    static moduleConfig: {
        [propName: string]: any;
    } = {};
    static state: {
        [propName: string]: any;
    } = {};
    static envFileReg = /^.env$/;
    static settingFilePath: string = `${AppRootPath.path}/setting.yml`;
    static envFilePath: string = `${AppRootPath.path}/.env`;

    /*
    * init process logic
    *
    * 1. read file setting.yml of the same level dir of node_modules
    * 2. merge default config to module config
    * 3. read dir of the same level dir of node_modules for finding the .env
    *     all the format of the .env file will be YAML style
    *     however, if you have .env file, the content key-value of those files should have the different key, or it will throw the error
    * 4. read the .env files content and parse them
    * 5. choose the right connection of store depend on the module config ( store -> type )
    * 6. it will recover the config to memory if the store already had the config infomation, and cover with .env file
    *     it will recover the .env config on this file, if this file not exist, it will create a new file
    * 7. completed
    * */
    static async init(): Promise<void> {
        // get the module config
        const moduleConfigFromYml = AsyncConfigBus.getConfigSetting();
        AsyncConfigBus.moduleConfig = DEFAULT.DEFAULTSETTING(moduleConfigFromYml);
        const rootFiles = [];
        const rootEnvFiles = [];
        if (existsSync(pathResolve(__dirname, AsyncConfigBus.envFilePath))) {
            rootEnvFiles.push(AsyncConfigBus.envFilePath);
        }
        let initConfigContent = '';
        let initConfig;
        for (const configContent of rootEnvFiles) {
            initConfigContent += readFileSync(pathResolve(__dirname, configContent), 'utf8');
        }
        initConfig = parse(initConfigContent);
        if (initConfig == null) {
            initConfig = {};
        }
        // get store connection
        const client = await chooseStoreConnection(AsyncConfigBus.moduleConfig);
        AsyncConfigBus.connectionStore = client;
        switch (AsyncConfigBus.moduleConfig.store.type) {
            case 'local':
                await AsyncConfigBus.initLocal(client, initConfig);
                break;
            case 'redis':
                await AsyncConfigBus.initRedis(client, initConfig);
                break;
            case 'mongodb':
                await AsyncConfigBus.initMongodb(client, initConfig);
                break;
            default:
                throw new Error('config type is not found');
        }
    }

    static async closeConn(): Promise<void> {
        try {
            await AsyncConfigBus.connectionStore.disconnect();
        } catch (e) {
            // tslint:disable-next-line:no-console
            console.error(e);
        }
    }

    static getConfigSetting() {
        if (existsSync(pathResolve(__dirname, AsyncConfigBus.settingFilePath))) {
            return parse(readFileSync(pathResolve(__dirname, AsyncConfigBus.settingFilePath), 'utf8'));
        } else {
            const configOfEnv: Setting = {
                store: {
                    // @ts-ignore
                    type: process.env.ASYNC_CONFIG_TYPE,
                    uri: process.env.ASYNC_CONFIG_URI,
                    collection: process.env.ASYNC_CONFIG_COLLECTION,
                    flag: process.env.ASYNC_CONFIG_FLAG,
                },
            };
            try {
                configOfEnv.store.options = JSON.parse(process.env.ASYNC_CONFIG_OPTIONS);
            } catch (e) {
                configOfEnv.store.options = {};
            }
            return configOfEnv;
        }
    }

    static updateFile(doc) {
        writeFileSync(pathResolve(__dirname, AsyncConfigBus.envFilePath), doc, { flag: 'w+' });
    }

    static async initRedis(client, initConfig) {
        const prefix = client.options.keyPrefix;
        const configInfo = await client.get(`${prefix}AsyncConfig`);
        if (configInfo) {
            // set memory config
            const updateContent = stringify(JSON.parse(configInfo).config);
            AsyncConfigBus.updateFile(updateContent);
            AsyncConfigBus.state = JSON.parse(configInfo).config;
        } else {
            // init config
            client.set(`${prefix}AsyncConfig`, JSON.stringify({flag: 'async_config', config: initConfig}));
            AsyncConfigBus.state = initConfig;
        }
    }

    static async initMongodb(client, initConfig) {
        // tslint:disable-next-line:max-line-length
        const configInfo = await client.connection.collection(AsyncConfigBus.moduleConfig.store.collection).findOne({flag: AsyncConfigBus.moduleConfig.store.flag});
        if (configInfo) {
            // set memory config
            const updateContent = stringify(configInfo.config);
            AsyncConfigBus.updateFile(updateContent);
            AsyncConfigBus.state = configInfo.config;
        } else {
            // init config
            await client.connection.collection(AsyncConfigBus.moduleConfig.store.collection).insertOne({
                flag: AsyncConfigBus.moduleConfig.store.flag,
                config: initConfig,
            });
            AsyncConfigBus.state = initConfig;
        }
    }

    static async initLocal(client, initConfig) {
        AsyncConfigBus.state = initConfig;
    }

    /* operations */
    /*
    * update config
    *
    * full volume update
    * */
    static async updateRedis(client, doc) {
        if (doc) {
            const prefix = client.options.keyPrefix;
            const configData = { ...AsyncConfigBus.state, ...doc };
            client.set(`${prefix}AsyncConfig`, JSON.stringify(configData));
            AsyncConfigBus.updateFile(stringify(configData));
            AsyncConfigBus.state = configData;
        }
        return AsyncConfigBus.state;
    }

    static async updateMongodb(client, doc) {
        const updateData: any = {...AsyncConfigBus.state, ...doc};
        // tslint:disable-next-line:max-line-length
        const configInfo = await client.connection.collection(AsyncConfigBus.moduleConfig.store.collection).findOneAndUpdate({flag: AsyncConfigBus.moduleConfig.store.flag}, { $set: { config: updateData } });
        AsyncConfigBus.updateFile(stringify(updateData));
        AsyncConfigBus.state = updateData;
        return AsyncConfigBus.state;
    }

    static async updateLocal(client, doc) {
        AsyncConfigBus.state = { ...AsyncConfigBus.state, ...doc };
        AsyncConfigBus.updateFile(stringify(AsyncConfigBus.state));
        return AsyncConfigBus.state;
    }

    static updateConfig(doc): any {
        return new Promise((resolve, reject) => {
            AsyncConfigBus.connectionStore.then(async client => {
                try {
                    let resData: any;
                    switch (AsyncConfigBus.moduleConfig.store.type) {
                        case 'local':
                            resData = await AsyncConfigBus.updateLocal(client, doc);
                            break;
                        case 'redis':
                            resData = await AsyncConfigBus.updateRedis(client, doc);
                            break;
                        case 'mongodb':
                            resData = await AsyncConfigBus.updateMongodb(client, doc);
                            break;
                        default:
                            throw new Error('config type is not found');
                    }
                    resolve(resData);
                } catch (e) {
                    throw e;
                }
            }).catch(e => {
                throw e;
            });
        });
    }

    static deleteConfig(stateName: string): any {
        return new Promise((resolve, reject) => {
            if (Object.keys(AsyncConfigBus.state).includes(stateName)) {
                delete AsyncConfigBus.state[stateName];
            } else {
                resolve(null);
            }
            AsyncConfigBus.connectionStore.then(async client => {
                try {
                    let resData: any;
                    switch (AsyncConfigBus.moduleConfig.store.type) {
                        case 'local':
                            resData = await AsyncConfigBus.updateLocal(client, AsyncConfigBus.state);
                            break;
                        case 'redis':
                            resData = await AsyncConfigBus.updateRedis(client, AsyncConfigBus.state);
                            break;
                        case 'mongodb':
                            resData = await AsyncConfigBus.updateMongodb(client, AsyncConfigBus.state);
                            break;
                        default:
                            throw new Error('config type is not found');
                    }
                    resolve(resData);
                } catch (e) {
                    throw e;
                }
            }).catch(e => {
                throw e;
            });
            return AsyncConfigBus.state;
        });
    }

    static getConfig(stateName: string): any {
        if (AsyncConfigBus.state[stateName]) {
            return AsyncConfigBus.state[stateName];
        } else {
            return null;
        }
    }

    static getModuleConfig(): any {
        return AsyncConfigBus.moduleConfig;
    }

    static listConfig(): any {
        return AsyncConfigBus.state;
    }
}
