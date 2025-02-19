import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type SettingsDocument = Settings & Document;

@Schema()
export class Settings {
    @Prop({ required: true })
    type: string; // "chatbot" or "icp"

    @Prop({ type: Object, required: true })
    config: Record<string, any>; // Stores chatbot tone, approach, or ICP details

    @Prop({ default: Date.now })
    createdAt: Date;
}

export const SettingsSchema = SchemaFactory.createForClass(Settings);
