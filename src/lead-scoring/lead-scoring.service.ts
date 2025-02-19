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
        minBudget: 500, // Minimum budget required
        wrongIndustry: ['unrelated_industry'], // Industries that are disqualified
    };

    /**
     * Computes the lead score based on explicit and implicit factors.
     */
    calculateLeadScore(lead: LeadData): { score: number; category: string } {
        let score = 0;

        // Explicit Scoring (Firmographics & Budget)
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

        // Determine lead category
        let category = 'Cold';
        if (score >= 50) {
            category = 'Hot';
        } else if (score >= 30) {
            category = 'Warm';
        }

        return { score, category };
    }
}
