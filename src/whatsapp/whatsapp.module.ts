import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { WhatsappService } from './whatsapp.service';
import { WhatsappController } from './whatsapp.controller';
import { ChatSummary, ChatSummarySchema } from '../botpress-service/schemas/chat-summary.schema';
import { SettingsModule } from '../settings/settings.module';
import { LeadScoringModule } from '../lead-scoring/lead-scoring.module';
import { LeadsModule } from '../leads/leads.module';

@Module({
    imports: [
        HttpModule,
        ConfigModule,
        MongooseModule.forFeature([
            { name: ChatSummary.name, schema: ChatSummarySchema }
        ]),
        SettingsModule,
        LeadScoringModule,
        LeadsModule
    ],
    controllers: [WhatsappController],
    providers: [WhatsappService],
    exports: [WhatsappService],
})
export class WhatsappModule {}
