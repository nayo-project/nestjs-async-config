import {Setting} from './interface';

const STORETYPELIST = ['local', 'redis', 'mongodb'];

const DEFAULTSETTING: Setting = {
    store: {
        type: 'local',
    },
};

export class DEFAULT {

    static DEFAULTSETTING(setting: Setting) {
        const config: Setting = {
            store: {
                type: 'local',
            },
        };
        if (setting.store.type) {
            if (STORETYPELIST.includes(setting.store.type)) {
                switch (setting.store.type) {
                    case 'local':
                        config.store.type = 'local';
                        break;
                    case 'redis':
                        if (setting.store.uri) {
                            config.store.type = 'redis';
                            config.store.uri = setting.store.uri;
                            config.store.options = setting.store.options ? setting.store.options : {};
                        } else {
                            // tslint:disable-next-line:no-console
                            console.warn('[warn] type redie need keyPrefix and uri, but some configs lost, the type set to local now.');
                            config.store.type = 'local';
                        }
                        break;
                    case 'mongodb':
                        if (setting.store.uri) {
                            config.store.type = 'mongodb';
                            config.store.uri = setting.store.uri;
                            config.store.options = setting.store.options ? setting.store.options : {};
                            config.store.collection = 'async_config';
                            config.store.flag = 'async_config';
                            // point the collection, and you can manage your env config via mongodb
                            if (Object.prototype.toString.call(setting.store.collection) === '[object String]' && setting.store.collection) {
                                config.store.collection = setting.store.collection;
                            }
                            // point the flag, and you can manage your env
                            if (Object.prototype.toString.call(setting.store.flag) === '[object String]' && setting.store.flag) {
                                config.store.flag = setting.store.flag;
                            }
                        } else {
                            // tslint:disable-next-line:no-console
                            console.warn('[warn] type mongodb need uri, but this config lost, the type set to local now.');
                            config.store.type = 'local';
                        }
                        break;
                    default:
                        config.store.type = 'local';
                }
            } else {
                // tslint:disable-next-line:no-console
                console.warn('[warn] we only supported local/redis/mongodb, please check you store type, the type set to local now.');
                config.store.type = 'local';
            }
        } else {
            // tslint:disable-next-line:no-console
            console.warn('[warn] you don\'t set the type config, the type set to local now.');
            config.store.type = 'local';
        }
        return config;
    }

    static RESPONSECODE = {
        OK: 10000,
        PARAM_ERROR: 10001,
        KEY_NO_FOUND: 10002,
        ERROR: 0,
    };

    static RESPONSETEMPLATE(code: number, msg: any, type: 'controller' | 'service' = 'service') {
        switch (type) {
            case 'controller':
                return JSON.stringify({
                    code,
                    msg,
                });
                break;
            case 'service':
                return {
                    code,
                    msg,
                };
                break;
            default:
                throw new Error('response type error');
        }
    }

}
