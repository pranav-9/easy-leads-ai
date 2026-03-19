import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { MongooseModule } from '@nestjs/mongoose';
import { BotpressService } from './botpress-service.service';
import { BotpressController } from './botpress-service.controller';
import { ChatSummary, ChatSummarySchema } from './schemas/chat-summary.schema';
import { LeadsModule } from '../leads/leads.module';
import { SettingsModule } from '../settings/settings.module';
import { LeadScoringModule } from '../lead-scoring/lead-scoring.module';

@Module({
  imports: [
    HttpModule.register({}), // Register HttpModule with empty config
    MongooseModule.forFeature([
      { name: ChatSummary.name, schema: ChatSummarySchema },
    ]),
    LeadsModule,
    SettingsModule, // Remove .forRoot()
    LeadScoringModule,
  ],
  controllers: [BotpressController],
  providers: [BotpressService],
})
export class BotpressServiceModule {}
