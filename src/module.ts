import { Module, Global } from '@nestjs/common';
import { AsyncConfigService } from './service/async.config.service';
import { AsyncConfigController } from './service';
import { AsyncConfigBus } from './bus';
import { Config } from './service/async.config.out';
import { ValidateModule } from 'nestjs-validate';
import {
    updateConfigValidateSchema,
    deleteConfigValidateSchema,
    getConfigValidateSchema,
} from './service/async.config.validate.schema';

@Global()
@Module({
    imports: [
        ValidateModule.forFeature([
            { path: '/:prefix*/config/update', schema: updateConfigValidateSchema },
            { path: '/:prefix*/config/delete', schema: deleteConfigValidateSchema },
            { path: '/:prefix*/config/find/:key', schema: getConfigValidateSchema },
        ]),
    ],
    providers: [
        AsyncConfigService,
        Config,
    ],
    controllers: [AsyncConfigController],
    exports: [Config],
})
export class AsyncConfigModule {}
