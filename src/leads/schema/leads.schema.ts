import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Lead {
  @Prop({ required: true })
  name: string;

  @Prop()
  email: string;

  @Prop()
  phone: string;

  @Prop()
  jobTitle?: string;

  @Prop()
  budget?: number;

  @Prop()
  companySize?: number;

  @Prop()
  industry?: string;

  @Prop()
  engagementLevel?: number;

  @Prop()
  responseTime?: number;

  @Prop()
  questionsAsked?: number;

  @Prop({ default: 0 })
  score: number; // Computed by Lead Scoring Service

  @Prop({ default: 'Cold' })
  category: string; // Hot, Warm, Cold
}

export type LeadDocument = Lead & Document;
export const LeadSchema = SchemaFactory.createForClass(Lead);
