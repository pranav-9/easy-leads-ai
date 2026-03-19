import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Lead } from '../leads/schema/leads.schema';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
import { ChatSummary, ChatSummaryDocument } from '../botpress-service/schemas/chat-summary.schema';

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

    // Company brand and ICP details
    private companyBrand = {
        name: 'YourCompany',
        values: ['innovation', 'reliability', 'customer-centric', 'transparency'],
        voice: 'professional yet approachable, solution-oriented',
        industry: 'SaaS',
        targetMarket: 'mid-size businesses and enterprises'
    };

    private idealCustomerProfile = {
        industries: ['technology', 'finance', 'healthcare', 'education', 'manufacturing'],
        companySize: 'preferably 50+ employees',
        budget: 'minimum $5,000 annually',
        painPoints: ['efficiency', 'automation', 'data analysis', 'customer engagement'],
        decisionMakers: ['CTO', 'CIO', 'Director', 'VP', 'Head of']
    };

    constructor(
        @InjectModel(Lead.name) private readonly leadModel: Model<Lead>,
        @InjectModel(ChatSummary.name) private readonly chatSummaryModel: Model<ChatSummaryDocument>,
        private configService: ConfigService,
        private httpService: HttpService
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
     * Updates the lead score based on message content, brand alignment, and ICP matching
     * @param lead The lead to update
     * @param message The message from the lead
     */
    async updateScore(lead: Lead, message: string): Promise<void> {
        try {
            this.logger.log(`Updating score for lead ${lead.name} based on message`);
            
            // Initialize score adjustment
            let scoreAdjustment = 0;
            
            // Simple keyword-based scoring (keeping this for baseline scoring)
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
            
            // Enhanced scoring with OpenAI analysis
            const aiAnalysis = await this.analyzeMessageWithAI(lead, message);
            scoreAdjustment += aiAnalysis.scoreAdjustment;
            
            // Update lead score in database
            const currentScore = lead.score || 0;
            const newScore = Math.max(0, Math.min(100, currentScore + scoreAdjustment)); // Keep score between 0-100
            
            // Determine lead category based on score
            let category = 'Cold';
            let shouldHandoff = false;
            
            if (newScore >= 50) {
                category = 'Hot';
                shouldHandoff = true;  // Hand off to sales for hot leads
            } else if (newScore >= 30) {
                category = 'Warm';
            }
            
            // Get the lead ID safely
            const leadId = lead['leadId'] || lead['_id'];
            
            // Update the lead in the database
            await this.leadModel.findByIdAndUpdate(
                leadId,
                {
                    $set: { 
                        score: newScore,
                        category: category,
                        shouldHandoff: shouldHandoff,
                        lastInteraction: new Date(),
                        brandAlignment: aiAnalysis.brandAlignment,
                        icpMatch: aiAnalysis.icpMatch,
                        aiInsights: aiAnalysis.insights,
                        clientDescription: aiAnalysis.clientDescription
                    }
                }
            );
            
            this.logger.log(`Score updated for lead ${lead.name}: ${currentScore} → ${newScore} (${scoreAdjustment > 0 ? '+' : ''}${scoreAdjustment})`);
            this.logger.log(`Lead category: ${category}, Should hand off to sales: ${shouldHandoff}`);
            this.logger.log(`AI Analysis: Brand Alignment: ${aiAnalysis.brandAlignment}%, ICP Match: ${aiAnalysis.icpMatch}%`);
            this.logger.log(`AI Insights: ${aiAnalysis.insights}`);
            this.logger.log(`Client Description: ${aiAnalysis.clientDescription}`);
            
        } catch (error) {
            this.logger.error(`Error updating score for lead ${lead.name}:`, error.stack);
            // Don't throw the error to prevent breaking the conversation flow
        }
    }

    /**
     * Analyzes the message using OpenAI to determine brand alignment and ICP match
     */
    private async analyzeMessageWithAI(lead: Lead, message: string): Promise<{
        scoreAdjustment: number;
        brandAlignment: number;
        icpMatch: number;
        insights: string;
        clientDescription: string;
    }> {
        try {
            // Get the lead ID safely
            const leadId = lead['leadId'] || lead['_id'];
            
            // Fetch previous messages from chat summary
            const chatSummary = await this.chatSummaryModel.findOne({ leadId });
            const previousConversation = chatSummary ? chatSummary.summary : '';
            
            // Prepare lead context
            const leadContext = {
                name: lead.name,
                company: lead.company,
                jobTitle: lead.jobTitle,
                industry: lead.industry,
                previousConversation
            };

            // Create the prompt for OpenAI
            const prompt = this.createAnalysisPrompt(leadContext, message);

            // Call OpenAI API using HttpService
            const url = 'https://api.openai.com/v1/chat/completions';
            const apiKey = this.configService.get<string>('OPENAI_API_KEY');
            
            const payload = {
                model: "gpt-4o",
                messages: [
                    {
                        role: "system",
                        content: "You are an expert sales qualification assistant. Your task is to analyze customer messages and determine how well they align with the company's brand and ideal customer profile."
                    },
                    {
                        role: "user",
                        content: prompt
                    }
                ],
                response_format: { type: "json_object" }
            };
            
            const response = await lastValueFrom(
                this.httpService.post(url, payload, {
                    headers: {
                        'Authorization': `Bearer ${apiKey}`,
                        'Content-Type': 'application/json'
                    }
                })
            );

            // Parse the response
            const analysisResult = JSON.parse(response.data.choices[0].message.content);
            
            // Calculate score adjustment based on brand alignment and ICP match
            const brandAlignmentScore = analysisResult.brandAlignment || 0;
            const icpMatchScore = analysisResult.icpMatch || 0;
            
            // Calculate score adjustment: higher alignment and match = higher score
            const scoreAdjustment = Math.round((brandAlignmentScore + icpMatchScore) / 4);
            
            return {
                scoreAdjustment,
                brandAlignment: brandAlignmentScore,
                icpMatch: icpMatchScore,
                insights: analysisResult.insights || "No specific insights available.",
                clientDescription: analysisResult.clientDescription || "No client description available."
            };
        } catch (error) {
            this.logger.error('Error analyzing message with AI:', error.stack);
            // Return default values on error
            return {
                scoreAdjustment: 0,
                brandAlignment: 0,
                icpMatch: 0,
                insights: "Error analyzing message with AI.",
                clientDescription: "Unable to generate client description due to an error."
            };
        }
    }

    /**
     * Creates the prompt for OpenAI analysis
     */
    private createAnalysisPrompt(leadContext: any, message: string): string {
        return `
Please analyze this customer message and provide a JSON response with the following:
1. brandAlignment: A score from 0-100 indicating how well this lead aligns with our company brand
2. icpMatch: A score from 0-100 indicating how well this lead matches our ideal customer profile
3. insights: Key insights about this lead's potential value and qualification
4. clientDescription: A concise 2-3 sentence description of this client based on available information

Customer Message: "${message}"

Lead Context:
- Name: ${leadContext.name || 'Unknown'}
- Company: ${leadContext.company || 'Unknown'}
- Job Title: ${leadContext.jobTitle || 'Unknown'}
- Industry: ${leadContext.industry || 'Unknown'}

Our Company Brand:
${JSON.stringify(this.companyBrand, null, 2)}

Our Ideal Customer Profile:
${JSON.stringify(this.idealCustomerProfile, null, 2)}

Previous Conversation:
${leadContext.previousConversation || 'No previous conversation'}

Respond with a JSON object containing brandAlignment (number), icpMatch (number), insights (string), and clientDescription (string).
`;
    }

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
