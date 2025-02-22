import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Lead } from '../leads/schema/leads.schema';
import { ChatSummary, ChatSummaryDocument } from './schemas/chat-summary.schema';
import { SettingsService } from '../settings/settings.service';
import { LeadScoringService } from '../lead-scoring/lead-scoring.service';

@Injectable()
export class BotpressService {
    constructor(
        private httpService: HttpService,
        @InjectModel(ChatSummary.name) private chatSummaryModel: Model<ChatSummaryDocument>,
        private settingsService: SettingsService,
        private leadScoringService: LeadScoringService,
    ) { }

    async startConversation(lead: Lead): Promise<any> {
        const chatbotSettings = await this.settingsService.getChatbotSettings();
        const icpSettings = await this.settingsService.getICPSettings();
        const initialSummary = `Conversation started with ${lead.name}.`; // Initialize summary

        // @ts-expect-error - _id is a property of lead
        await this.chatSummaryModel.create({ leadId: lead._id, summary: initialSummary });
        const message = this.generateFirstMessage(lead, chatbotSettings, icpSettings);
        return this.sendToBotpress(lead.phone, message);
    }

    private async sendToBotpress(phone: string, message: string): Promise<any> {
        const botpressUrl = 'https://api.botpress.cloud/api/v1';
        return this.httpService.post(botpressUrl, { phone, message }).toPromise();
    }

    async processResponse(lead: Lead, message: string): Promise<void> {
        // @ts-expect-error - _id is a property of lead
        const chatSummary = await this.chatSummaryModel.findOne({ leadId: lead._id });
        const previousSummary = chatSummary ? chatSummary.summary : '';

        // Generate AI response based on summary and new message
        const newResponse = await this.generateResponseFromAiClient(previousSummary, message);

        // Update conversation summary
        const updatedSummary = `${previousSummary}\nUser: ${message}\nBot: ${newResponse}`;
        await this.chatSummaryModel.findOneAndUpdate(
            // @ts-expect-error - _id is a property of lead
            { leadId: lead._id },
            { summary: updatedSummary },
            { upsert: true }
        );

        // Send AI-generated response back to the lead
        await this.sendToBotpress(lead.phone, newResponse);
    }

    private generateFirstMessage(lead: Lead, chatbotSettings: any, icpSettings: any): string {
        const tone = chatbotSettings?.tone || 'friendly';
        const industry = lead.industry || 'your industry';
        const budget = lead.budget ? `$${lead.budget}` : 'your estimated budget';
        const role = lead.jobTitle || 'your role';

        if (tone === 'friendly') {
            return `Hey there! 😊 We noticed you're in ${industry} and might be looking for solutions. What’s your estimated budget?`;
        } else if (tone === 'consultative') {
            return `Hi, I see you’re a ${role} in ${industry}. We specialize in helping businesses like yours. Can we discuss your needs?`;
        } else {
            return `Hello, we noticed you're interested in our services. Do you have a budget range in mind?`;
        }
    }

    private async generateResponseFromAiClient(previousSummary: string, message: string): Promise<string> {
        const apiUrl = "https://api.openai.com/v1/chat/completions";
        const apiKey = process.env.OPENAI_API_KEY;

        const payload = {
            model: "gpt-4o",
            messages: [
                { role: "system", content: "You are a helpful assistant guiding leads through a conversation." },
                { role: "user", content: `Previous conversation summary: ${previousSummary}` },
                { role: "user", content: `New message from lead: ${message}` }
            ],
            temperature: 0.7
        };

        const response = await this.httpService.post(apiUrl, payload, {
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiKey}`
            }
        });

        // @ts-expect-error - choices is a property of response
        return response.data.choices[0].message.content;
    }


}
