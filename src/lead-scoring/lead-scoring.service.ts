import { Injectable } from '@nestjs/common';

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
}
