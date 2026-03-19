import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { HttpModule } from '@nestjs/axios';
import { LeadScoringService } from './lead-scoring.service';
import { Lead, LeadSchema } from '../leads/schema/leads.schema';
import { ChatSummary, ChatSummarySchema } from '../botpress-service/schemas/chat-summary.schema';
import { LeadsModule } from '../leads/leads.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Lead.name, schema: LeadSchema },
      { name: ChatSummary.name, schema: ChatSummarySchema },
    ]),
    HttpModule,
    forwardRef(() => LeadsModule),
  ],
  providers: [LeadScoringService],
  exports: [LeadScoringService],
})
export class LeadScoringModule {}
