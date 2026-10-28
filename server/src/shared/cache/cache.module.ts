import { Module, Global } from '@nestjs/common';
import { RedisClientProvider } from './provider';
import { CacheService } from './service';

@Global()
@Module({
  providers: [RedisClientProvider, CacheService],
  exports: [CacheService],
})
export class CacheModule {}
