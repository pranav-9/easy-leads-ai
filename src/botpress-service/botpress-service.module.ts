import { Module } from '@nestjs/common';
import { BotpressService } from './botpress-service.service';
import { BotpressController } from './botpress-service.controller';

@Module({
  controllers: [BotpressController],
  providers: [BotpressService],
})
export class BotpressServiceModule {}
