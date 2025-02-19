import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Lead } from './schema/leads.schema';

@Injectable()
export class LeadsService {
    constructor(@InjectModel(Lead.name) private leadModel: Model<Lead>) { }

    async createLead(data: any): Promise<Lead> {
        return await new this.leadModel(data).save();
    }

    async getLeads(): Promise<Lead[]> {
        try {
            const leads = await this.leadModel.find();

            if (!leads) {
                return [];
            }
            return leads;

        } catch (error) {
            console.error('error listing leads',error);
            return [];
        }
    }

    async getLeadById(id: string): Promise<Lead> {
        const lead = await this.leadModel.findById(id);
        if (!lead) {
            throw new Error('Lead not found');
        }
        return lead;
    }

    async updateLead(id: string, updateData: any): Promise<Lead> {
        const updatedLead = await this.leadModel.findByIdAndUpdate(id, updateData, { new: true });
        if (!updatedLead) {
            throw new Error('Lead not found');
        }
        return updatedLead;
    }
}
