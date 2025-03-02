import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { lastValueFrom } from 'rxjs';
import { Lead } from '../leads/schema/leads.schema';
import { ChatSummary, ChatSummaryDocument } from '../botpress-service/schemas/chat-summary.schema';
import { SettingsService } from '../settings/settings.service';
import { LeadScoringService } from '../lead-scoring/lead-scoring.service';

@Injectable()
export class WhatsappService {
    private readonly logger = new Logger(WhatsappService.name);

    constructor(
        private httpService: HttpService,
        private configService: ConfigService,
        @InjectModel(ChatSummary.name) private chatSummaryModel: Model<ChatSummaryDocument>,
        private settingsService: SettingsService,
        private leadScoringService: LeadScoringService,
    ) {}

    async startConversation(lead: Lead): Promise<any> {
        try {
            const chatbotSettings = await this.settingsService.getChatbotSettings();
            const icpSettings = await this.settingsService.getICPSettings();
            const initialSummary = `Conversation started with ${lead.name}.`; // Initialize summary

            // @ts-expect-error - _id is a property of lead
            await this.chatSummaryModel.create({ leadId: lead._id, summary: initialSummary });
            const message = this.generateFirstMessage(lead, chatbotSettings, icpSettings);
            return this.sendMessage(lead.phone, message);
        } catch (error) {
            this.logger.error(`Failed to start conversation with lead ${lead.name}:`, error.stack);
            throw new Error(`Failed to start conversation: ${error.message}`);
        }
    }

    async processResponse(lead: Lead, message: string): Promise<void> {
        try {
            // @ts-expect-error - _id is a property of lead
            const chatSummary = await this.chatSummaryModel.findOne({ leadId: lead._id });
            const previousSummary = chatSummary ? chatSummary.summary : '';

            // Generate AI response based on summary and new message
            const newResponse = await this.generateResponseFromAiClient(previousSummary, message);

            // Update conversation summary
            const updatedSummary = `${previousSummary}\nUser: ${message}\nBot: ${newResponse}`;
            await this.chatSummaryModel.findOneAndUpdate(
                // @ts-expect-error - _id is a property of lead
                { leadId: lead._id },
                { summary: updatedSummary },
                { upsert: true }
            );

            // Send AI-generated response back to the lead
            await this.sendMessage(lead.phone, newResponse);
            
            // Update lead scoring using the correct method name
            await this.leadScoringService.updateScore(lead, message);
        } catch (error) {
            this.logger.error(`Failed to process response for lead ${lead.name}:`, error.stack);
            throw new Error(`Failed to process response: ${error.message}`);
        }
    }

    private generateFirstMessage(lead: Lead, chatbotSettings: any, icpSettings: any): string {
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

    private async generateResponseFromAiClient(previousSummary: string, message: string): Promise<string> {
        try {
            const apiUrl = "https://api.openai.com/v1/chat/completions";
            const apiKey = this.configService.get('OPENAI_API_KEY');

            if (!apiKey) {
                throw new Error("OpenAI API key is not configured");
            }

            const payload = {
                model: "gpt-4o",
                messages: [
                    { role: "system", content: "You are a helpful assistant guiding leads through a conversation." },
                    { role: "user", content: `Previous conversation summary: ${previousSummary}` },
                    { role: "user", content: `New message from lead: ${message}` }
                ],
                temperature: 0.7
            };

            const response = await lastValueFrom(
                this.httpService.post(apiUrl, payload, {
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${apiKey}`
                    }
                })
            );

            return response.data.choices[0].message.content;
        } catch (error) {
            this.logger.error('Error generating AI response:', error.stack);
            return "I'm sorry, I'm having trouble processing your request right now. Could you please try again later?";
        }
    }

    async sendMessage(phone: string, message: string): Promise<any> {
        try {
            // Format phone number (ensure it has country code)
            const formattedPhone = phone.startsWith('+') ? phone : `+${phone}`;
            
            // WhatsApp Business API endpoint
            const whatsappUrl = `https://graph.facebook.com/v17.0/${this.configService.get('WHATSAPP_PHONE_NUMBER_ID')}/messages`;
            
            // WhatsApp API payload
            const payload = {
                messaging_product: "whatsapp",
                recipient_type: "individual",
                to: formattedPhone,
                type: "text",
                text: { 
                    body: message 
                }
            };
            
            this.logger.debug('WhatsApp API Request:', {
                url: whatsappUrl,
                method: 'POST',
                payload
            });
            
            const response = await lastValueFrom(
                this.httpService.post(
                    whatsappUrl,
                    payload,
                    {
                        headers: {
                            'Authorization': `Bearer ${this.configService.get('WHATSAPP_API_TOKEN')}`,
                            'Content-Type': 'application/json'
                        }
                    }
                )
            );
            
            this.logger.debug('WhatsApp API Response:', {
                status: response.status,
                data: response.data
            });
            
            return response.data;
        } catch (error) {
            this.logger.error('WhatsApp API Error:', {
                phone,
                message: error.message,
                status: error.response?.status,
                data: error.response?.data,
                stack: error.stack
            });
            
            throw new Error(`Failed to send WhatsApp message: ${error.message}`);
        }
    }

    async sendTemplate(phone: string, templateName: string, components: any[]): Promise<any> {
        try {
            // Format phone number (ensure it has country code)
            const formattedPhone = phone.startsWith('+') ? phone : `+${phone}`;
            
            // WhatsApp Business API endpoint
            const whatsappUrl = `https://graph.facebook.com/v17.0/${this.configService.get('WHATSAPP_PHONE_NUMBER_ID')}/messages`;
            
            // WhatsApp API payload for template message
            const payload = {
                messaging_product: "whatsapp",
                recipient_type: "individual",
                to: formattedPhone,
                type: "template",
                template: { 
                    name: templateName,
                    language: {
                        code: "en_US"
                    },
                    components: components
                }
            };
            
            this.logger.debug('WhatsApp Template API Request:', {
                url: whatsappUrl,
                method: 'POST',
                payload
            });
            
            const response = await lastValueFrom(
                this.httpService.post(
                    whatsappUrl,
                    payload,
                    {
                        headers: {
                            'Authorization': `Bearer ${this.configService.get('WHATSAPP_API_TOKEN')}`,
                            'Content-Type': 'application/json'
                        }
                    }
                )
            );
            
            this.logger.debug('WhatsApp Template API Response:', {
                status: response.status,
                data: response.data
            });
            
            return response.data;
        } catch (error) {
            this.logger.error('WhatsApp Template API Error:', {
                phone,
                templateName,
                message: error.message,
                status: error.response?.status,
                data: error.response?.data,
                stack: error.stack
            });
            
            throw new Error(`Failed to send WhatsApp template message: ${error.message}`);
        }
    }

    // Process incoming webhook data
    async processWebhook(data: any): Promise<any> {
        try {
            this.logger.debug('Processing WhatsApp webhook - raw data:', JSON.stringify(data));
            
            // Extract the relevant information from the webhook payload
            if (data.object === 'whatsapp_business_account') {
                this.logger.debug('Webhook identified as WhatsApp Business Account');
                const entries = data.entry || [];
                
                this.logger.debug(`Found ${entries.length} entries in webhook data`);
                
                for (const entry of entries) {
                    const changes = entry.changes || [];
                    
                    this.logger.debug(`Processing entry ID: ${entry.id} with ${changes.length} changes`);
                    
                    for (const change of changes) {
                        this.logger.debug(`Processing change with field: ${change.field}`);
                        
                        if (change.field === 'messages') {
                            const value = change.value || {};
                            const messages = value.messages || [];
                            
                            this.logger.debug(`Found ${messages.length} messages in change`);
                            
                            for (const message of messages) {
                                const from = message.from;
                                const messageId = message.id;
                                const timestamp = message.timestamp;
                                
                                this.logger.debug(`Processing message ID: ${messageId} from ${from} at ${timestamp}`);
                                
                                // Handle different message types
                                if (message.type === 'text') {
                                    const text = message.text?.body;
                                    this.logger.log(`Received text message from ${from}: ${text}`);
                                    
                                    // Find the lead by phone number
                                    this.logger.debug(`Looking up lead for phone: ${from}`);
                                    const lead = await this.findOrCreateLead(from, text);
                                    
                                    if (lead) {
                                        this.logger.debug(`Found/created lead: ${lead.name} (ID: ${(lead as any)._id || 'unknown'})`);
                                        // Process the message and generate a response
                                        this.logger.debug(`Processing response for message: ${text}`);
                                        await this.processResponse(lead, text);
                                        this.logger.debug(`Response processed successfully`);
                                    } else {
                                        this.logger.warn(`Failed to find or create lead for phone: ${from}`);
                                    }
                                    
                                    return {
                                        from,
                                        messageId,
                                        timestamp,
                                        type: 'text',
                                        content: text
                                    };
                                } else if (message.type === 'image') {
                                    this.logger.log(`Received image message from ${from}`);
                                    // Handle image messages
                                } else if (message.type === 'location') {
                                    this.logger.log(`Received location message from ${from}`);
                                    // Handle location messages
                                } else {
                                    this.logger.warn(`Received unsupported message type: ${message.type} from ${from}`);
                                }
                            }
                        } else {
                            this.logger.debug(`Ignoring change with field: ${change.field}`);
                        }
                    }
                }
            } else {
                this.logger.warn(`Webhook object type not recognized: ${data.object}`);
            }
            
            this.logger.debug('No processable messages found in webhook data');
            return null;
        } catch (error) {
            this.logger.error('Error processing WhatsApp webhook:', {
                message: error.message,
                stack: error.stack,
                data: JSON.stringify(data)
            });
            throw new Error(`Failed to process WhatsApp webhook: ${error.message}`);
        }
    }

    // Helper method to find or create a lead based on phone number
    private async findOrCreateLead(phone: string, initialMessage: string): Promise<Lead | null> {
        try {
            // This would need to be implemented based on your Lead model and repository
            // For now, we'll assume there's a LeadService that can handle this
            
            // Example implementation:
            // const existingLead = await this.leadService.findByPhone(phone);
            
            // if (existingLead) {
            //     return existingLead;
            // }
            
            // Create a new lead if one doesn't exist
            // const newLead = await this.leadService.create({
            //     name: 'Unknown',
            //     phone: phone,
            //     source: 'WhatsApp',
            //     notes: `Initial message: ${initialMessage}`
            // });
            
            // return newLead;
            
            // For now, return a mock lead for testing with all required properties
            return {
                _id: 'mock-id',
                name: 'WhatsApp User',
                phone: phone,
                email: '',
                source: 'WhatsApp',
                status: 'New',
                createdAt: new Date(),
                score: 0,         // Add missing property
                category: 'New'   // Add missing property
            } as Lead;
        } catch (error) {
            this.logger.error(`Error finding or creating lead for phone ${phone}:`, error.stack);
            return null;
        }
    }

    // Verify webhook with challenge response
    verifyWebhook(mode: string, token: string, challenge: string): string | null {
        const verifyToken = this.configService.get('WHATSAPP_VERIFY_TOKEN');
        
        if (mode === 'subscribe' && token === verifyToken) {
            this.logger.log('WhatsApp webhook verified successfully');
            return challenge;
        }
        
        this.logger.error('WhatsApp webhook verification failed', {
            expectedToken: verifyToken,
            receivedToken: token
        });
        
        return null;
    }
}
