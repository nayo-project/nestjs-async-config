<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo_text.svg" width="320" alt="Nest Logo" /></a>
</p>

## nestjs-async-config
The async config module based on RESTful API, you can real time update your system config

<a href="https://www.npmjs.com/package/nestjs-async-config"><img src="https://img.shields.io/npm/v/nestjs-async-config" alt="NPM Version" /></a>
<a href="#"/><img src="https://img.shields.io/github/license/nayo-project/nestjs-async-config"></a>

## Description

the async-config allow you to controll your system config in real time via RESTful API, sometimes, when you start your system, the system will read the config file, and if you want to change the config, you should update the file and restart the system, so, nestjs-async-config will help you to resolve the situation, however, nestjs-async-config can change the db config, but, can't reconnect the db, so, the nestjs-async-config module is only work on current system config, not others.

## Getting Started

- set the nestjs-async-config module

you should write a setting.yml file in the project root folder, the same level of the node_modules folder, or you can set the env params of the system (process.ENV)

if you don't have the setting.yml, async-config-module will read process.ENV

```
# the config of setting.yml, and you should not to change the config when your system is running
store:
  type: "redis"     # here are three types, local/redis/mongodb, the default type is local, when you write a wrong type, here will be default type
  uri: "xxxxxx"  # if the type is redis or mongodb, the option uri and options will work, redis uri is redis://xxx, mongodb uri is mongodb://xxx
  options:
    xx: yy  # all redis or mongodb connection options can write here
    
# if type is mongodb, you should point the database, and ensure that the mongodb account can create collection, the module will create a collection called async_config in the pointed database 
# here are all store params below
```
Param Name | ENV Name | Default | Details
---| ---- |--- | ---
type | ASYNC_CONFIG_TYPE | local | your store type, suport for local memory/redis/mongodb
uri | ASYNC_CONFIG_URI | - | when the type is redis/mongodb, here will be writed necessarily
collection | ASYNC_CONFIG_COLLECTION | async_config | when the type is mongodb, you can point the collection to store your config, however, you should point the database via uri firstly. This param is not support other type excepted mongodb
flag | ASYNC_CONFIG_FLAG | async_config | when the type is mongodb, yon can point a special config document of the same collection, so, you can manage your config env through one database, one collection. This param is not support other type excepted mongodb
options | ASYNC_CONFIG_OPTIONS | {} | this is an object for redis/mongodb, this one allow you can set the redis/mongodb options here, like keyPrefix/connectionPool etc.


- write your system local config file .env

you can write the .env file at the project root folder, if the async-config module haven't been inited, .env will init the conifg, if the async-config module had been inited before when the setting type is redis/mongodb, the module will read the config from database first, if the database doesn't have the config, the module will read the .env file and update configs to the database. Meanwhile, you should use the yaml formation to write the .env file.

- init the module in the entrance file

```
# main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { initConfig } from 'nestjs-async-config';

async function bootstrap() {
  await initConfig();
  const app = await NestFactory.create(AppModule);
  await app.listen(4000);
}
bootstrap();
```

- add the module to your system project

```
# app.module.ts
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AsyncConfigModule } from 'nestjs-async-config2';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
      AsyncConfigModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

```

- use it

```
# xxx.module.ts
import { Config } from 'nestjs-async-config';

@Module({
  controllers: [XXXController],
  providers: [XXXService, Config],
})
export class XXXModule {}

# xxx.service.ts
import { Injectable, Inject } from '@nestjs/common';
import { Config } from 'nestjs-async-config';

@Injectable()
export class XXXService {

  constructor(
      @Inject(Config) readonly config: Config,
  ) {}

}

```

- enjoy it!

## API Document

### Update the config
- Path: /config/update
- Method: PUT
- Params:

Name | Required | Type | Detail
---|---|---|---
doc | true | Object | you can write the object to update config

```
example:

{
    "doc": {
        "admin": {
            "password": 123456
        }
    }
}

// then, the api will update the field of "admin" of the config
```

- Response:
```
// responese structure
{
    "code": xxx,
    "msg": yyy
}
```
code | msg 
---|---
10000 | current configs
10001 | params error

### delete the config
- Path: /config/delete
- Method: DELETE
- Params:

Name | Required | Type | Detail
---|---|---|---
key | true | String | the config's key, outermost layer of the config

```
example:

// if the current config is { "admin": {"password": 123456} }

{
    "key": "admin"
}

// then, the api will delete the field of "admin" of the config, however, you can't delete the field "password", it is not the outermost layer of the config, the "delete" is only support the first layer of the configs
```

- Response:
```
// responese structure
{
    "code": xxx,
    "msg": yyy
}
```
code | msg 
---|---
10000 | current configs
10001 | params error
10002 | "the key is not found"

### find a config
- Path: /config/find/:key
- Method: GET
- Params:

Name | Required | Type | Detail
---|---|---|---
key | true | String | the config's key, outermost layer of the config

```
example:

// if the current config is { "admin": {"password": 123456} }

{
    "key": "admin"
}

// then, the api will find the field of "admin" of the config, however, you can't delete the field "password", it is not the outermost layer of the config, the "find" is only support the first layer of the configs
```

- Response:
```
// responese structure
{
    "code": xxx,
    "msg": yyy
}
```
code | msg 
---|---
10000 | current config of the key
10001 | params error
10002 | "the key is not found"

### list all system configs
- Path: /config/list
- Method: GET
- Params: null
- Response:
```
// responese structure
{
    "code": xxx,
    "msg": yyy
}
```
code | msg 
---|---
10000 | current configs
10001 | params error

### list all nestjs-async-config module configs
- Path: /config/module/list
- Method: GET
- Params: null
- Response:
```
// responese structure
{
    "code": xxx,
    "msg": yyy
}
```
code | msg 
---|---
10000 | current configs
10001 | params error

## License
This library is published under the MIT license. See LICENSE for details.
