export interface Setting {
    store: {
        type: 'local' | 'redis' | 'mongodb';
        uri?: string;
        collection?: string;
        flag?: string;
        options?: object;
    }
}
