import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type LeadDocument = Lead & Document;

@Schema({ timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } })
export class Lead {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  phone: string;

  @Prop()
  email: string;

  @Prop()
  company: string;

  @Prop()
  jobTitle: string;

  @Prop()
  industry: string;

  @Prop({ default: 'New' })
  status: string;

  @Prop({ default: 0 })
  score: number;

  @Prop({ default: 'Cold' })
  category: string;

  @Prop()
  source: string;

  @Prop()
  notes: string;

  @Prop({ default: false })
  shouldHandoff: boolean;

  @Prop()
  engagementStrategy: string;

  @Prop()
  salesAgentId: string;

  @Prop()
  handoffStatus: string;

  @Prop()
  budget: number;

  @Prop()
  brandAlignment: number;

  @Prop()
  icpMatch: number;

  @Prop()
  aiInsights: string;

  @Prop()
  clientDescription: string;

  @Prop({ type: Date, default: Date.now })
  lastInteraction: Date;
}

export const LeadSchema = SchemaFactory.createForClass(Lead);

// Add virtual property for leadId
LeadSchema.virtual('leadId').get(function() {
  return this._id ? this._id.toString() : undefined;
});
