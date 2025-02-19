import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Lead extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  phone: string;

  @Prop({ required: true })
  email: string;

  @Prop({ required: true })
  source: string; // Meta Forms, Typeform, etc.

  @Prop({ default: 'new' }) // new, hot, warm, cold
  status: string;
}

export const LeadSchema = SchemaFactory.createForClass(Lead);
