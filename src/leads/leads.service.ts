import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Lead, LeadDocument } from './schema/leads.schema';
import { LeadScoringService } from '../lead-scoring/lead-scoring.service';

@Injectable()
export class LeadsService {
    constructor(
        @InjectModel(Lead.name) private leadModel: Model<LeadDocument>,
        private readonly leadScoringService: LeadScoringService
    ) {}

    async createLead(leadData: any): Promise<Lead> {
        // Compute Lead Score
        const { score, category, shouldHandoff } = this.leadScoringService.calculateLeadScore(leadData);

        // Create new lead with score & category
        const newLead = new this.leadModel({ ...leadData, score, category });

        // Save lead to database
        const savedLead = await newLead.save();

        // Auto-assign sales agent if needed
        if (shouldHandoff) {
            // @ts-expect-error - TODO: fix its type
            await this.handoffLead(savedLead._id.toString());
        }

        return savedLead;
    }

    async updateLead(id: string, updateData: any): Promise<Lead> {
        // Recalculate lead score
        const { score, category, shouldHandoff } = this.leadScoringService.calculateLeadScore(updateData);

        // Update lead data
        const updatedLead = await this.leadModel.findByIdAndUpdate(
            id,
            { ...updateData, score, category },
            { new: true }
        );

        if (!updatedLead) {
            throw new Error('Lead not found');
        }

        // Auto-assign sales agent if needed
        if (shouldHandoff) {
            // @ts-expect-error - TODO: fix its type
            const leadId = updatedLead._id.toString();
            await this.handoffLead(leadId);
        }

        return updatedLead;
    }

    async getLeads(): Promise<Lead[]> {
        return this.leadModel.find();
    }

    async getLeadById(id: string): Promise<Lead> {
        const lead = await this
            .leadModel
            .findById(id);

        if(!lead) {
            throw new Error('Lead not found');
        }

        return lead;
    }

    async handoffLead(leadId: string): Promise<void> {
        const salesAgentId = this.assignSalesAgent();

        await this.leadModel.findByIdAndUpdate(
            leadId,
            { salesAgentId, handoffStatus: 'Assigned' },
            { new: true }
        );

        console.log(`Lead ${leadId} assigned to Sales Agent ${salesAgentId}`);
    }

    private assignSalesAgent(): string {
        // Simple round-robin assignment (replace with actual logic)
        const salesAgents = ['12345', '67890', '54321'];
        return salesAgents[Math.floor(Math.random() * salesAgents.length)];
    }
}
