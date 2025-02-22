import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class ChatSummary {
    @Prop({ required: true })
    leadId: string;

    @Prop({ required: true })
    summary: string;

    @Prop({ default: Date.now })
    createdAt: Date;
}

export type ChatSummaryDocument = ChatSummary & Document;
export const ChatSummarySchema = SchemaFactory.createForClass(ChatSummary);
