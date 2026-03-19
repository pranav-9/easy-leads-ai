import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { HttpModule } from '@nestjs/axios';
import { LeadsModule } from './leads/leads.module';
import { WhatsappModule } from './whatsapp/whatsapp.module';
import { LeadScoringModule } from './lead-scoring/lead-scoring.module';
import { SettingsModule } from './settings/settings.module';
import { BotpressServiceModule } from './botpress-service/botpress-service.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGO_URI'),
      }),
      inject: [ConfigService],
    }),
    HttpModule,
    LeadsModule,
    WhatsappModule,
    LeadScoringModule,
    SettingsModule,
    BotpressServiceModule,
  ],
})
export class AppModule {}
