import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Lead, LeadDocument } from '../leads/schema/leads.schema';
import { SettingsService } from '../settings/settings.service';

@Injectable()
export class BotpressService {
    constructor(
        private httpService: HttpService,
        @InjectModel(Lead.name) private leadModel: Model<LeadDocument>,
        private settingsService: SettingsService
    ) {}

    async startChat(leadId: string): Promise<any> {
        const lead = await this.leadModel.findById(leadId);
        if (!lead) throw new Error('Lead not found');

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
}
