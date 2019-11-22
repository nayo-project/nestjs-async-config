import { AsyncConfigBus } from './src/bus';

export { AsyncConfigModule } from './src/module';
export { Config } from './src/service/async.config.out';
export const initConfig = AsyncConfigBus.init;
