import { Injectable, Inject } from '@nestjs/common';
import { AsyncConfigBus } from './../bus';
import { DEFAULT } from './../default';

@Injectable()
export class AsyncConfigService {

    constructor() {}

    async updateConfig(doc: any): Promise<any> {
        // inner code
        const CODE = {
            OK: 10,
        };
        const ret = await AsyncConfigBus.updateConfig(doc);
        if (ret) {
            return DEFAULT.RESPONSETEMPLATE(CODE.OK, ret);
        } else {
            throw new Error('update config fail');
        }
    }

    async deleteConfig(key: string): Promise<any> {
        // inner code
        const CODE = {
            OK: 10,
            CONFIG_NO_FOUND: 11,
        };
        const ret = await AsyncConfigBus.deleteConfig(key);
        if (ret === null) {
            return DEFAULT.RESPONSETEMPLATE(CODE.CONFIG_NO_FOUND, 'key is not found');
        } else {
            return DEFAULT.RESPONSETEMPLATE(CODE.OK, ret);
        }
    }

    getConfig(key: string): any {
        // inner code
        const CODE = {
            OK: 10,
            KEY_NO_FOUND: 11,
        };
        const ret = AsyncConfigBus.getConfig(key);
        if (ret === null) {
            return DEFAULT.RESPONSETEMPLATE(CODE.KEY_NO_FOUND, 'the key is not found');
        } else {
            return DEFAULT.RESPONSETEMPLATE(CODE.OK, ret);
        }
    }

    async getModuleConfig(): Promise<any> {
        // inner code
        const CODE = {
            OK: 10,
        };
        const ret = await AsyncConfigBus.getModuleConfig();
        return DEFAULT.RESPONSETEMPLATE(CODE.OK, ret);
    }

    async listConfig(): Promise<any> {
        // inner code
        const CODE = {
            OK: 10,
        };
        const ret = await AsyncConfigBus.listConfig();
        return DEFAULT.RESPONSETEMPLATE(CODE.OK, ret);
    }
}
