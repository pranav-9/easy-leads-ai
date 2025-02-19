import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LeadsService } from './leads.service';
import { LeadsController } from './leads.controller';
import { Lead, LeadSchema } from './schema/leads.schema';
import { LeadScoringModule } from '../lead-scoring/lead-scoring.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Lead.name, schema: LeadSchema }]),
    LeadScoringModule
  ],
  controllers: [LeadsController],
  providers: [LeadsService],
})
export class LeadsModule {}
