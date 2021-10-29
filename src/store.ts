import {Setting} from './interface';
import * as mongoose from 'mongoose';
import * as redis from 'ioredis';

export const chooseStoreConnection = (config: Setting | any) => {
    switch (config.store.type) {
        case 'local':
            return localConnection;
            break;
        case 'redis':
            return redisConnection(config);
            break;
        case 'mongodb':
            return mongodbConnection(config);
            break;
        default:
            throw new Error('store type is not exits');
    }
};

const localConnection = Promise.resolve('local');

const redisConnection = (config: Setting): any => {
    return new Promise((resolve, reject) => {
        resolve(new redis(config.store.uri, {
            ...config.store.options,
            retryStrategy: () => {
                return 10000;
            },
            maxRetriesPerRequest: 10,
        }));
    });
};

const mongodbConnection = (config: Setting): any => {
    return mongoose.connect(config.store.uri, {
        minPoolSize: 3,
        maxPoolSize: 5,
    });
};
