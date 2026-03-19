import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Lead } from '../leads/schema/leads.schema';
import {
  ChatSummary,
  ChatSummaryDocument,
} from './schemas/chat-summary.schema';
import { SettingsService } from '../settings/settings.service';
import { LeadScoringService } from '../lead-scoring/lead-scoring.service';

@Injectable()
export class BotpressService {
  private readonly logger = new Logger(BotpressService.name);

  constructor(
    private httpService: HttpService,
    @InjectModel(ChatSummary.name)
    private chatSummaryModel: Model<ChatSummaryDocument>,
    private settingsService: SettingsService,
    private leadScoringService: LeadScoringService,
  ) {}

  async startConversation(lead: Lead): Promise<any> {
    try {
      const chatbotSettings = await this.settingsService.getChatbotSettings();
      const icpSettings = await this.settingsService.getICPSettings();
      const initialSummary = `Conversation started with ${lead.name}.`; // Initialize summary

      const leadId = lead['leadId'] || lead['_id'];

      await this.chatSummaryModel.create({
        leadId,
        summary: initialSummary,
      });
      const message = this.generateFirstMessage(
        lead,
        chatbotSettings,
        icpSettings,
      );
      return this.sendToBotpress(lead.phone, message);
    } catch (error) {
      this.logger.error(
        `Failed to start conversation with lead ${lead.name}:`,
        error.stack,
      );
      throw new Error(`Failed to start conversation: ${error.message}`);
    }
  }

  private async sendToBotpress(phone: string, message: string): Promise<any> {
    try {
      // Try a different Botpress messaging endpoint
      const botpressUrl = 'https://api.botpress.cloud/v1/messaging/messages';

      // Check for required environment variables
      if (!process.env.BOTPRESS_API_TOKEN) {
        throw new Error('BOTPRESS_API_TOKEN is not configured');
      }
      if (!process.env.BOTPRESS_WORKSPACE_ID) {
        throw new Error('BOTPRESS_WORKSPACE_ID is not configured');
      }
      if (!process.env.BOTPRESS_BOT_ID) {
        throw new Error('BOTPRESS_BOT_ID is not configured');
      }

      // Format phone number (ensure it has country code)
      const formattedPhone = phone.startsWith('+') ? phone : `+${phone}`;

      // Botpress WhatsApp API payload
      const payload = {
        workspaceId: process.env.BOTPRESS_WORKSPACE_ID,
        botId: process.env.BOTPRESS_BOT_ID,
        to: formattedPhone,
        type: 'text',
        content: {
          text: message,
        },
      };

      this.logger.debug('Botpress API Request:', {
        url: botpressUrl,
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.BOTPRESS_API_TOKEN.substring(0, 5)}...`,
          'Content-Type': 'application/json',
        },
        payload,
      });

      const response = await this.httpService
        .post(botpressUrl, payload, {
          headers: {
            Authorization: `Bearer ${process.env.BOTPRESS_API_TOKEN}`,
            'Content-Type': 'application/json',
          },
        })
        .toPromise();

      if (!response) {
        throw new Error('No response received from Botpress API');
      }

      this.logger.debug('Botpress API Response:', {
        status: response.status,
        data: response.data,
      });

      return response;
    } catch (error) {
      this.logger.error('Botpress API Error:', {
        url: 'https://api.botpress.cloud/v1/messaging/messages',
        phone,
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        stack: error.stack,
      });

      if (error.response?.status === 401) {
        throw new Error(
          'Authentication failed with Botpress API. Check your API token.',
        );
      } else if (error.response?.status === 404) {
        throw new Error('Botpress API endpoint not found. Check the API URL.');
      } else {
        throw new Error(
          `Failed to send message via Botpress: ${error.message}`,
        );
      }
    }
  }

  // Helper method to generate a short UUID
  private generateShortUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'
      .replace(/[xy]/g, function (c) {
        const r = (Math.random() * 16) | 0;
        const v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      })
      .substring(0, 36); // Ensure the UUID is not longer than 36 characters
  }

  async processResponse(lead: Lead, message: string): Promise<void> {
    try {
      const leadId = lead['leadId'] || lead['_id'];

      const chatSummary = await this.chatSummaryModel.findOne({
        leadId,
      });
      const previousSummary = chatSummary ? chatSummary.summary : '';

      // Generate AI response based on summary and new message
      const newResponse = await this.generateResponseFromAiClient(
        previousSummary,
        message,
      );

      // Update conversation summary
      const updatedSummary = `${previousSummary}\nUser: ${message}\nBot: ${newResponse}`;
      await this.chatSummaryModel.findOneAndUpdate(
        { leadId },
        { summary: updatedSummary },
        { upsert: true },
      );

      // Send AI-generated response back to the lead
      await this.sendToBotpress(lead.phone, newResponse);
    } catch (error) {
      this.logger.error(
        `Failed to process response for lead ${lead.name}:`,
        error.stack,
      );
      throw new Error(`Failed to process response: ${error.message}`);
    }
  }

  private generateFirstMessage(
    lead: Lead,
    chatbotSettings: any,
    icpSettings: any,
  ): string {
    try {
      const tone = chatbotSettings?.tone || 'friendly';
      const industry = lead.industry || 'your industry';
      const budget = lead.budget ? `$${lead.budget}` : 'your estimated budget';
      const role = lead.jobTitle || 'your role';

      if (tone === 'friendly') {
        return `Hey there! 😊 We noticed you're in ${industry} and might be looking for solutions. What's your estimated budget?`;
      } else if (tone === 'consultative') {
        return `Hi, I see you're a ${role} in ${industry}. We specialize in helping businesses like yours. Can we discuss your needs?`;
      } else {
        return `Hello, we noticed you're interested in our services. Do you have a budget range in mind?`;
      }
    } catch (error) {
      this.logger.error('Error generating first message:', error.stack);
      return `Hello! Thanks for your interest. How can we help you today?`; // Fallback message
    }
  }

  private async generateResponseFromAiClient(
    previousSummary: string,
    message: string,
  ): Promise<string> {
    try {
      const apiUrl = 'https://api.openai.com/v1/chat/completions';
      const apiKey = process.env.OPENAI_API_KEY;

      if (!apiKey) {
        throw new Error('OpenAI API key is not configured');
      }

      const payload = {
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content:
              'You are a helpful assistant guiding leads through a conversation.',
          },
          {
            role: 'user',
            content: `Previous conversation summary: ${previousSummary}`,
          },
          { role: 'user', content: `New message from lead: ${message}` },
        ],
        temperature: 0.7,
      };

      const response = await this.httpService.post(apiUrl, payload, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
      });

      // @ts-expect-error - choices is a property of response
      return response.data.choices[0].message.content;
    } catch (error) {
      this.logger.error('Error generating AI response:', error.stack);
      return "I'm sorry, I'm having trouble processing your request right now. Could you please try again later?";
    }
  }
}
