import { CacheModuleOptions, CacheOptionsFactory } from '@nestjs/cache-manager';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as redisStore from 'cache-manager-redis-store';

@Injectable()
export class CacheConfig implements CacheOptionsFactory {
  constructor(private configService: ConfigService) { }
  
  createCacheOptions(): CacheModuleOptions {
    const redisConfig = this.configService.get("config.redis");
    const config: CacheModuleOptions = {
      store: redisStore,
      host: redisConfig.host,
      port: redisConfig.port,
    };
    return config;
  }
}
