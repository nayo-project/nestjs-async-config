export interface Setting {
    store: {
        type: 'local' | 'redis' | 'mongodb';
        uri?: string;
        options?: object;
    }
}
