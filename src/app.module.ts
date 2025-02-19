import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { LeadsModule } from './leads/leads.module';
import { BotpressServiceModule } from './botpress-service/botpress-service.module';
import { LeadScoringModule } from './lead-scoring/lead-scoring.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    MongooseModule.forRoot(process.env.MONGO_URI || 'mongodb://localhost:27017/leads'),
    LeadsModule,
    BotpressServiceModule,
    LeadScoringModule,
  ],
})
export class AppModule {}
