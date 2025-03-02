import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LeadsService } from './leads.service';
import { LeadsController } from './leads.controller';
import { Lead, LeadSchema } from './schema/leads.schema';
import { LeadScoringModule } from '../lead-scoring/lead-scoring.module';
import { Settings, SettingsSchema } from '../settings/schemas/settings.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Lead.name, schema: LeadSchema },
      { name: Settings.name, schema: SettingsSchema }
    ]),
    LeadScoringModule
  ],
  controllers: [LeadsController],
  providers: [LeadsService],
  exports: [LeadsService]
})
export class LeadsModule {}
