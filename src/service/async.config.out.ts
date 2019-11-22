import { Injectable, Inject } from '@nestjs/common';
import { AsyncConfigBus } from './../bus';
import { DEFAULT } from './../default';

@Injectable()
export class Config {

    get(key: string) {
        return AsyncConfigBus.getConfig(key);
    }
}
