import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Lead, LeadDocument } from '../leads/schema/leads.schema';
import { SettingsService } from '../settings/settings.service';
import { LeadScoringService } from '../lead-scoring/lead-scoring.service';

@Injectable()
export class BotpressService {
    constructor(
        private httpService: HttpService,
        @InjectModel(Lead.name) private leadModel: Model<LeadDocument>,
        private settingsService: SettingsService,
        private leadScoringService: LeadScoringService
    ) {}

    async startConversation(lead: Lead): Promise<any> {
        const chatbotSettings = await this.settingsService.getChatbotSettings();
        const icpSettings = await this.settingsService.getICPSettings();

        const message = this.generateFirstMessage(lead, chatbotSettings, icpSettings);
        return this.sendToBotpress(lead.phone, message);
    }

    private generateFirstMessage(lead: Lead, chatbotSettings: any, icpSettings: any): string {
        const tone = chatbotSettings.tone || 'friendly';
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

    private async sendToBotpress(phone: string, message: string): Promise<any> {
        const botpressUrl = 'https://api.botpress.cloud/api/v1';
        return this.httpService.post(botpressUrl, { phone, message }).toPromise();
    }

    async processResponse(lead: Lead, message: string): Promise<void> {
        // Analyze message for intent and sentiment
        const intent = this.detectIntent(message);
        const sentiment = this.analyzeSentiment(message);

        // Update lead profile dynamically
        let scoreAdjustment = 0;
        if (sentiment === 'positive') scoreAdjustment += 10;
        if (sentiment === 'negative') scoreAdjustment -= 5;
        if (intent === 'high_interest') scoreAdjustment += 20;

        // @ts-expect-error _id is part of mongoose document
        await this.leadModel.findByIdAndUpdate(lead._id, { $inc: { score: scoreAdjustment } });

        // Determine next step in conversation
        // @ts-expect-error _id is part of mongoose document
        const leadData: Lead = await this.leadModel.findById(lead._id);
    
        if (leadData.score > 50) {
            await this.triggerSalesHandoff(leadData);
        } else {
            const nextMessage = this.generateFollowUpMessage(leadData);
            await this.sendToBotpress(leadData.phone, nextMessage);
        }
    }

    private detectIntent(message: string): string {
        if (message.includes('buy') || message.includes('interested')) return 'high_interest';
        if (message.includes('maybe') || message.includes('consider')) return 'medium_interest';
        return 'low_interest';
    }

    private analyzeSentiment(message: string): string {
        if (message.includes('love') || message.includes('excited')) return 'positive';
        if (message.includes('not interested') || message.includes('no')) return 'negative';
        return 'neutral';
    }

    private async triggerSalesHandoff(lead: Lead): Promise<void> {
        // @ts-expect-error _id is part of mongoose document
        console.log(`Triggering sales handoff for lead: ${lead._id}`);
        // Call sales API or notify sales team
    }

    private generateFollowUpMessage(lead: Lead): string {
        return `Thanks for sharing! Based on your needs, I’d love to explore how we can help. What’s your biggest challenge right now?`;
    }
}
