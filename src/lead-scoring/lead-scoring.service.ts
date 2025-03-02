import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Lead } from '../leads/schema/leads.schema';

interface LeadData {
    jobTitle?: string;
    budget?: number;
    companySize?: number;
    industry?: string;
    engagementLevel?: number;
    responseTime?: number;
    questionsAsked?: number;
}

interface ScoringWeights {
    jobTitle: number;
    budget: number;
    companySize: number;
    industry: number;
    engagementLevel: number;
    responseTime: number;
    questionsAsked: number;
}

@Injectable()
export class LeadScoringService {
    private readonly logger = new Logger(LeadScoringService.name);

    constructor(
        // Inject any required models or services
    ) {}

    private weights: ScoringWeights = {
        jobTitle: 10,
        budget: 10,
        companySize: 8,
        industry: 8,
        engagementLevel: 7,
        responseTime: 5,
        questionsAsked: 5,
    };

    private disqualificationCriteria = {
        minBudget: 500,
        wrongIndustry: ['unrelated_industry'],
    };

    /**
     * Computes the lead score and determines if it should be handed off to sales.
     */
    calculateLeadScore(lead: LeadData): { score: number; category: string; shouldHandoff: boolean } {
        let score = 0;

        // Explicit Scoring
        if (lead.jobTitle) score += this.weights.jobTitle;
        if (lead.budget && lead.budget >= this.disqualificationCriteria.minBudget) {
            score += this.weights.budget;
        }
        if (lead.companySize) score += this.weights.companySize;
        if (lead.industry && !this.disqualificationCriteria.wrongIndustry.includes(lead.industry)) {
            score += this.weights.industry;
        }

        // Implicit Scoring (Engagement)
        if (lead.engagementLevel) score += lead.engagementLevel * this.weights.engagementLevel;
        if (lead.responseTime) score += this.weights.responseTime / lead.responseTime;
        if (lead.questionsAsked) score += lead.questionsAsked * this.weights.questionsAsked;

        // Determine category
        let category = 'Cold';
        let shouldHandoff = false;

        if (score >= 50) {
            category = 'Hot';
            shouldHandoff = true;  // Only hand off "Hot" leads
        } else if (score >= 30) {
            category = 'Warm';
        }

        return { score, category, shouldHandoff };
    }

    /**
     * Updates the lead score based on message content
     * @param lead The lead to update
     * @param message The message from the lead
     */
    async updateScore(lead: Lead, message: string): Promise<void> {
        try {
            this.logger.log(`Updating score for lead ${lead.name} based on message`);
            
            // Initialize score adjustment
            let scoreAdjustment = 0;
            
            // Simple keyword-based scoring
            const lowerMessage = message.toLowerCase();
            
            // Positive indicators
            if (lowerMessage.includes('interested') || lowerMessage.includes('buy')) {
                scoreAdjustment += 10;
            }
            if (lowerMessage.includes('price') || lowerMessage.includes('cost')) {
                scoreAdjustment += 5;
            }
            if (lowerMessage.includes('demo') || lowerMessage.includes('trial')) {
                scoreAdjustment += 15;
            }
            if (lowerMessage.includes('budget') && /\d+/.test(lowerMessage)) {
                scoreAdjustment += 20; // Mentioned specific budget with numbers
            }
            
            // Negative indicators
            if (lowerMessage.includes('not interested') || lowerMessage.includes('too expensive')) {
                scoreAdjustment -= 15;
            }
            if (lowerMessage.includes('just browsing') || lowerMessage.includes('just looking')) {
                scoreAdjustment -= 5;
            }
            
            // Update lead score in database
            // This implementation depends on your Lead model structure
            // For example:
            // await this.leadModel.findByIdAndUpdate(lead._id, {
            //     $inc: { score: scoreAdjustment }
            // });
            
            // For now, just log the score adjustment
            this.logger.log(`Score adjustment for lead ${lead.name}: ${scoreAdjustment}`);
            
            // You might want to implement threshold-based lead status updates
            // For example, if score > 50, update lead status to "Qualified"
            
        } catch (error) {
            this.logger.error(`Error updating score for lead ${lead.name}:`, error.stack);
            // Don't throw the error to prevent breaking the conversation flow
        }
    }
}
