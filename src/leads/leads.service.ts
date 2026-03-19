import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Lead, LeadDocument } from './schema/leads.schema';
import { LeadScoringService } from '../lead-scoring/lead-scoring.service';
import {
  Settings,
  SettingsDocument,
} from '../settings/schemas/settings.schema';
import axios from 'axios';

@Injectable()
export class LeadsService {
  private readonly logger = new Logger(LeadsService.name);

  constructor(
    @InjectModel(Lead.name) private leadModel: Model<LeadDocument>,
    @InjectModel(Settings.name) private settingsModel: Model<SettingsDocument>,
    private readonly leadScoringService: LeadScoringService,
  ) {}

  async createLead(leadData: any): Promise<Lead> {
    // Fetch Engagement Strategy from Database
    const engagementStrategy = await this.getEngagementStrategy();

    // Compute Lead Score
    const { score, category } =
      this.leadScoringService.calculateLeadScore(leadData);

    // Create new lead with score & category
    // Attach score, category, and engagement strategy to lead
    const newLead = new this.leadModel({
      ...leadData,
      score,
      category,
      engagementStrategy,
    });

    // Save lead to database
    const savedLead = await newLead.save();

    // Trigger Botpress API to send WhatsApp message
    // msg will be sent async
    this.sendWhatsAppMessage(savedLead);

    return savedLead;
  }

  async getEngagementStrategy(): Promise<string> {
    try {
      const settings = await this.settingsModel.findOne({ type: 'chatbot' });
      return settings?.config?.chatbotStrategy || 'Direct Sales'; // Default to Direct Sales
    } catch (error) {
      this.logger.error(
        'Error fetching engagement strategy from database:',
        error.stack,
      );
      return 'Direct Sales'; // Default fallback
    }
  }

  private async sendWhatsAppMessage(lead: Lead): Promise<void> {
    try {
      const messageData = {
        recipient: lead.phone,
        message: `Hi ${lead.name}, thanks for reaching out! Let's discuss how we can help you.`,
      };

      await fetch('https://botpress-instance.com/api/send-message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.BOTPRESS_API_KEY}`,
        },
        body: JSON.stringify(messageData),
      });

      this.logger.log('WhatsApp message sent successfully');
    } catch (error) {
      this.logger.error('Error sending WhatsApp message:', error.stack);
    }
  }

  async findByPhone(phone: string): Promise<Lead | null> {
    return this.leadModel.findOne({ phone }).exec();
  }

  async findById(id: string): Promise<Lead | null> {
    return this.leadModel.findById(id).exec();
  }

  async findOrCreateByPhone(
    phone: string,
    initialData: Partial<Lead> = {},
  ): Promise<Lead> {
    try {
      // Try to find existing lead
      let lead = await this.findByPhone(phone);

      // If lead exists, return it
      if (lead) {
        this.logger.log(`Found existing lead with phone ${phone}`);
        return lead;
      }

      // Create new lead if not found
      this.logger.log(`Creating new lead with phone ${phone}`);
      const newLead = new this.leadModel({
        name: initialData.name || 'Unknown',
        phone,
        email: initialData.email || '',
        company: initialData.company || '',
        jobTitle: initialData.jobTitle || '',
        industry: initialData.industry || '',
        source: initialData.source || 'Auto-created',
        notes: initialData.notes || 'Automatically created lead',
        status: 'New',
        score: 0,
        category: 'Cold',
      });

      return await newLead.save();
    } catch (error) {
      this.logger.error(
        `Error finding or creating lead with phone ${phone}:`,
        error.stack,
      );
      throw error;
    }
  }

  async update(id: string, updateData: Partial<Lead>): Promise<Lead> {
    const updatedLead = await this.leadModel
      .findByIdAndUpdate(id, { $set: updateData }, { new: true })
      .exec();

    if (!updatedLead) {
      throw new Error(`Lead with ID ${id} not found`);
    }

    return updatedLead;
  }

  async updateLead(id: string, updateData: any): Promise<Lead> {
    // Recalculate lead score
    const { score, category, shouldHandoff } =
      this.leadScoringService.calculateLeadScore(updateData);

    // Update lead data
    const updatedLead = await this.leadModel.findByIdAndUpdate(
      id,
      { ...updateData, score, category },
      { new: true },
    );

    if (!updatedLead) {
      throw new Error('Lead not found');
    }

    // Auto-assign sales agent if needed
    if (shouldHandoff) {
      // @ts-expect-error - _id is a property of lead
      const leadId: string = updatedLead._id;
      await this.handoffLead(leadId);
    }

    return updatedLead;
  }

  async getLeads(): Promise<Lead[]> {
    return this.leadModel.find();
  }

  async getLeadById(id: string): Promise<Lead> {
    const lead = await this.leadModel.findById(id);

    if (!lead) {
      throw new Error('Lead not found');
    }

    return lead;
  }

  async handoffLead(leadId: string): Promise<void> {
    const salesAgentId = this.assignSalesAgent();

    await this.leadModel.findByIdAndUpdate(
      leadId,
      { salesAgentId, handoffStatus: 'Assigned' },
      { new: true },
    );

    this.logger.log(`Lead ${leadId} assigned to Sales Agent ${salesAgentId}`);
  }

  private assignSalesAgent(): string {
    // Simple round-robin assignment (replace with actual logic)
    const salesAgents = ['12345', '67890', '54321'];
    return salesAgents[Math.floor(Math.random() * salesAgents.length)];
  }

  async handleIncomingMessage(payload: any): Promise<void> {
    try {
      const { phoneNumber, message } = payload;

      // Retrieve lead from DB
      const lead = await this.findByPhone(phoneNumber);
      if (!lead) {
        console.warn('Lead not found for phone:', phoneNumber);
        return;
      }

      // Process message with NLP (ChatGPT for intent & sentiment analysis)
      const analysis = await this.analyzeMessage(message);

      // Update lead score dynamically
      lead.score += this.calculateScoreAdjustment(analysis);
      await this.update(phoneNumber, { score: lead.score });

      // Determine next response based on engagement strategy
      const nextMessage = this.determineNextResponse(lead, analysis);

      // Send next message
      await axios.post('https://botpress-api.com/send-message', {
        phoneNumber: phoneNumber,
        message: nextMessage,
      });
    } catch (error) {
      console.error('Error handling incoming message:', error);
    }
  }

  async analyzeMessage(
    message: string,
  ): Promise<{ intent: string; sentiment: string }> {
    // Placeholder for ChatGPT API call
    return { intent: 'interest', sentiment: 'positive' }; // Mock response
  }

  calculateScoreAdjustment(analysis: {
    intent: string;
    sentiment: string;
  }): number {
    let scoreAdjustment = 0;
    if (analysis.intent === 'interest') scoreAdjustment += 10;
    if (analysis.sentiment === 'positive') scoreAdjustment += 5;
    if (analysis.sentiment === 'negative') scoreAdjustment -= 5;
    return scoreAdjustment;
  }

  determineNextResponse(
    lead: Lead,
    analysis: { intent: string; sentiment: string },
  ): string {
    if (lead.score >= 50) {
      return `You seem interested! Let's schedule a call.`;
    }
    return 'Would you like to know more details?';
  }
}
