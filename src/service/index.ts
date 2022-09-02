import { Controller, Param, Body, Put, Post, Delete, Get, Res, Req } from '@nestjs/common';
import { Validate } from 'nestjs-validate';
import { ApiTags } from '@nestjs/swagger';
import { DEFAULT } from './../default';
import { AsyncConfigService } from './async.config.service';

@ApiTags('config')
@Controller('config')
export class AsyncConfigController {

    constructor(
        protected readonly asyncConfigService: AsyncConfigService,
    ) {
    }

    /*
    * @api {PUT} /config/update  update the config
    * @Author Terence.Sun
    * @Email terence@segofun.com
    *
    * @apiParam {Object} doc  update document
    * */
    @Put('update')
    async updateConfig(@Body('doc') doc, @Validate() validate, @Res() res) {
        if (validate.length !== 0) {
            res.status(200).end(DEFAULT.RESPONSETEMPLATE(DEFAULT.RESPONSECODE.PARAM_ERROR, validate, 'controller'));
            return;
        }
         try {
            const ret = await this.asyncConfigService.updateConfig(doc);
            switch (ret.code) {
                case 10:
                    res.status(200).end(DEFAULT.RESPONSETEMPLATE(DEFAULT.RESPONSECODE.OK, ret.msg, 'controller'));
                    break;
                default:
                    throw new Error('error');
            }
        } catch (e) {
            res.status(200).end(DEFAULT.RESPONSETEMPLATE(DEFAULT.RESPONSECODE.ERROR, e.message, 'controller'));
        }
    }

    /*
    * @api {DELETE} /config/delete  delete the config
    * @Author Terence.Sun
    * @Email terence@segofun.com
    *
    * @apiParam {String} key  delete the config's key of the document
    * */
    @Delete('delete')
    async deleteConfig(@Body('key') key, @Validate() validate, @Res() res) {
        if (validate.length !== 0) {
            res.status(200).end(DEFAULT.RESPONSETEMPLATE(DEFAULT.RESPONSECODE.PARAM_ERROR, validate, 'controller'));
            return;
        }
         try {
            const ret = await this.asyncConfigService.deleteConfig(key);
            switch (ret.code) {
                case 10:
                    res.status(200).end(DEFAULT.RESPONSETEMPLATE(DEFAULT.RESPONSECODE.OK, ret.msg, 'controller'));
                    break;
                case 11:
                    res.status(200).end(DEFAULT.RESPONSETEMPLATE(DEFAULT.RESPONSECODE.KEY_NO_FOUND, ret.msg, 'controller'));
                    break;
                default:
                    throw new Error('error');
            }
        } catch (e) {
            res.status(200).end(DEFAULT.RESPONSETEMPLATE(DEFAULT.RESPONSECODE.ERROR, e.message, 'controller'));
        }
    }

    /*
    * @api {GET} /config/find/:key  find the config of a key
    * @Author Terence.Sun
    * @Email terence@segofun.com
    *
    * @apiParam {String} key  the config's key of the document
    * */
    @Get('find/:key')
    async getConfig(@Param('key') key, @Validate() validate, @Res() res) {
        if (validate.length !== 0) {
            res.status(200).end(DEFAULT.RESPONSETEMPLATE(DEFAULT.RESPONSECODE.PARAM_ERROR, validate, 'controller'));
            return;
        }
         try {
            const ret = this.asyncConfigService.getConfig(key);
            switch (ret.code) {
                case 10:
                    res.status(200).end(DEFAULT.RESPONSETEMPLATE(DEFAULT.RESPONSECODE.OK, ret.msg, 'controller'));
                    break;
                case 11:
                    res.status(200).end(DEFAULT.RESPONSETEMPLATE(DEFAULT.RESPONSECODE.KEY_NO_FOUND, ret.msg, 'controller'));
                    break;
                default:
                    throw new Error('error');
            }
        } catch (e) {
            res.status(200).end(DEFAULT.RESPONSETEMPLATE(DEFAULT.RESPONSECODE.ERROR, e.message, 'controller'));
        }
    }

    /*
    * @api {GET} /config/module/list  list the all module configs
    * @Author Terence.Sun
    * @Email terence@segofun.com
    *
    * */
    @Get('module/list')
    async getModuleConfig(@Res() res) {
         try {
            const ret = await this.asyncConfigService.getModuleConfig();
            switch (ret.code) {
                case 10:
                    res.status(200).end(DEFAULT.RESPONSETEMPLATE(DEFAULT.RESPONSECODE.OK, ret.msg, 'controller'));
                    break;
                default:
                    throw new Error('error');
            }
        } catch (e) {
            res.status(200).end(DEFAULT.RESPONSETEMPLATE(DEFAULT.RESPONSECODE.ERROR, e.message, 'controller'));
        }
    }

    /*
    * @api {GET} /config/list  list the all system configs
    * @Author Terence.Sun
    * @Email terence@segofun.com
    *
    * */
    @Get('/list')
    async listConfig(@Res() res) {
         try {
            const ret = await this.asyncConfigService.listConfig();
            switch (ret.code) {
                case 10:
                    res.status(200).end(DEFAULT.RESPONSETEMPLATE(DEFAULT.RESPONSECODE.OK, ret.msg, 'controller'));
                    break;
                default:
                    throw new Error('error');
            }
        } catch (e) {
            res.status(200).end(DEFAULT.RESPONSETEMPLATE(DEFAULT.RESPONSECODE.ERROR, e.message, 'controller'));
        }
    }

}
