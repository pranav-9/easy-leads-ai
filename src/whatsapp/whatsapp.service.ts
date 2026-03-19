import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { lastValueFrom } from 'rxjs';
import { Lead } from '../leads/schema/leads.schema';
import {
  ChatSummary,
  ChatSummaryDocument,
} from '../botpress-service/schemas/chat-summary.schema';
import { SettingsService } from '../settings/settings.service';
import { LeadScoringService } from '../lead-scoring/lead-scoring.service';
import { LeadsService } from '../leads/leads.service';

@Injectable()
export class WhatsappService {
  private readonly logger = new Logger(WhatsappService.name);

  constructor(
    private httpService: HttpService,
    private configService: ConfigService,
    @InjectModel(ChatSummary.name)
    private chatSummaryModel: Model<ChatSummaryDocument>,
    private settingsService: SettingsService,
    private leadScoringService: LeadScoringService,
    private leadsService: LeadsService,
  ) {}

  async startConversation(lead: Lead): Promise<any> {
    try {
      const chatbotSettings = await this.settingsService.getChatbotSettings();
      const icpSettings = await this.settingsService.getICPSettings();
      const initialSummary = `Conversation started with ${lead.name}.`; // Initialize summary

      // Get the lead ID safely
      const leadId = lead['leadId'] || lead['_id'];

      await this.chatSummaryModel.create({ leadId, summary: initialSummary });
      const message = this.generateFirstMessage(
        lead,
        chatbotSettings,
        icpSettings,
      );
      return this.sendMessage(lead.phone, message);
    } catch (error) {
      this.logger.error(
        `Failed to start conversation with lead ${lead.name}:`,
        error.stack,
      );
      throw new Error(`Failed to start conversation: ${error.message}`);
    }
  }

  async processResponse(lead: Lead, message: string): Promise<void> {
    try {
      // Get the lead ID safely
      const leadId = lead['leadId'] || lead['_id'];

      const chatSummary = await this.chatSummaryModel.findOne({ leadId });
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
      await this.sendMessage(lead.phone, newResponse);

      // Update lead scoring using the message
      await this.leadScoringService.updateScore(lead, message);
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
      const apiKey = this.configService.get('OPENAI_API_KEY');

      if (!apiKey) {
        throw new Error('OpenAI API key is not configured');
      }

      const payload = {
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: `You are a lead qualification chatbot representing [Company Name]. Your goal is to engage leads via WhatsApp, qualify them based on the company's Ideal Customer Profile (ICP), and guide them toward conversion (a sales call, a demo request, or further nurturing). Adapt your conversation dynamically based on the company's brand tone and lead responses.

1. Company Branding & Communication Style – On The Move
Company Name: On The Move
Industry: Personalized Fitness & Lifestyle Coaching
Primary Product/Service: Personalized fitness, nutrition, and mindset coaching tailored for busy professionals.
Target Audience: Busy professionals (Corporate, Tech, Finance, Entrepreneurs) in their 30s-40s looking for a sustainable fitness lifestyle integrated into their daily routines.
Company's Unique Value Proposition: On The Move offers a habit-driven, holistic approach to fitness, shifting focus from extreme methods and aesthetics to long-term health, performance, and well-being. Through data-driven coaching, personalized fitness plans, and an exclusive community, we help individuals sustainably integrate fitness into their lifestyle without burnout.

🔹 Brand Voice & Personality
Tone:
✅ Empathetic, Encouraging, and Professional – The chatbot should sound supportive and motivating, inspiring confidence in potential clients.
✅ Empowering & Expertise-Driven – It should convey trust and knowledge while making fitness feel approachable and achievable.
✅ Conversational & Relatable – The language should feel like a coach and accountability partner, not a salesperson.
Formality Level:
☑ Balanced – Professional yet Conversational (Avoids overly formal or salesy tones)
Use of Emojis:
☑ Yes, but sparingly – To keep engagement friendly and motivational, without being overwhelming.
Engagement Style:
☑ Consultative & Value-Driven – Focused on educating and guiding rather than directly selling.
☑ Conversational & Supportive – Encouraging leads to open up about their fitness struggles & goals.
☑ Motivational & Action-Oriented – Encouraging users to take ownership of their health.

🔹 Messaging Preferences
✅ Keep messages concise but impactful.
✅ Use real-world insights and examples to help leads visualize their fitness transformation.
✅ Avoid aggressive sales tactics – instead, guide leads toward a realization of why they need a structured fitness plan.
Call-to-action (CTA) should be:
☑ Midway or After Qualification – Ensure the lead is interested and sees the value before suggesting a call.
Handling Objections:
If a lead hesitates about budget → Provide an example of how clients see long-term ROI on their health.
If a lead is unsure about commitment → Offer a breakdown of how the program fits into their schedule seamlessly.
If they ask about why this over other programs → Highlight personalization, expert coaching, and habit-driven sustainability.

🔹 Brand Messaging Examples
✅ Motivational Hook:
"Fitness isn't a 12-week challenge—it's a lifestyle shift. Let's build a plan that works for you, not against you."
✅ Thoughtful Qualification Question:
"What's been your biggest challenge in staying consistent with your fitness goals?"
✅ Objection Handling Example (Budget Concern):
"I totally get it! Many of our clients felt the same way before starting. The key difference? This isn't a generic plan—it's built for YOU. Plus, investing in your health now prevents costly health issues later!"
✅ Call-to-Action (Warm Lead):
"Would you like to see how a personalized fitness plan can fit into your lifestyle? We can set up a quick chat!"


## **2. Ideal Customer Profile (ICP) – Lead Qualification Criteria**
These are the **must-have characteristics** of an ideal lead and the factors used to qualify/disqualify them.

Ideal Customer Profile (ICP) for OTM


Demographic Information:
Age Range: 30-45 years old
Gender: All genders
Location: 
NRIs in Bay Area, Dubai
Urban areas in India, particularly in cities like Mumbai, Delhi, Bangalore, Chennai, and Hyderabad
Income Level: High income
Occupation: 
Entrepreneurs, business owners,
restaurant owners, and new business owners in architecture
high-paid professionals
high-paid tech employees, individuals in the music industry (e.g., Universal), 
Education Level: College educated
Exclusion Criteria (What to Avoid):
Low-Quality Leads: Individuals with poor language skills (pronunciation, manners, greetings), low social skills, low education levels, and low IQ.



Psychographic Information:
Lifestyle: Health-conscious individuals who value quality and luxury. Prefer glamping over camping.
Values: Discipline, routine, and a strong sense of loyalty. They value high quality and luxury in their lifestyle choices.
Interests:
Aditya, Nishiket, Kartik: High-end cars, running, trekking, rafting, and adventure sports. They enjoy outdoor activities.
Akanksha Singla: Socializing, traveling, and trying new things.
Raksha: Traveling, running, and using saunas and ice baths.
Jannis: Music, luxury backpacking, unique experiences, and yoga.
Dislikes:
Aditya, Nishiket, Kartik: Aches and pains.
Akanksha Singla: Low-quality food, stress, cities.
Goals: Aiming to build muscle, improve overall fitness, maintain a balanced and luxurious lifestyle, and cope with the stress of demanding jobs.
Challenges: 
Time constraints due to busy work schedules, finding motivation, and staying consistent with fitness and nutrition plans.
Lack of knowledge



Behavioral Information:
Fitness Level: 
Intermediate fitness enthusiasts.
Not complete beginners or sick people
Preferably some background in either sports or fitness
They enjoy outdoor activities.
using saunas and ice baths.
Running, trekking, rafting, and adventure sports. 
Eating Habits: 
Interested in balanced diets, meal planning, and healthy recipes. Preference for high-quality, luxury dining experiences.
Food and Drink: High-quality and luxurious options, such as Vaayu Second House.
Liquor: Mid to top-tier options like Jameson, Black Label, and Gin Hapusa.
Technology Usage: Active on social media, uses fitness and health apps, and comfortable with online consultations and virtual fitness classes.
Spending Habits: Willing to invest in high-quality and luxurious health and wellness services and products that provide value and convenience.
Clothing and Footwear: Premium and luxury brands like Adidas Originals, Birkenstock, Nike Premium, and Under Armour (Not Puma, considered too mass-market).





Example ICP Niche: Professional Physically Active People:
Corporates with Unsuccessful Fitness Attempts: Those who have tried various fitness methods but haven't seen long-term success.
Extreme Fitness Attempts: People who have tried extreme fitness or nutrition methods and are looking for a balanced approach that avoids injuries and extreme calorie restrictions.



---

## **3. Lead Scoring Adjustments Based on Responses**
Increase or decrease the lead score dynamically as ChatGPT processes responses.

- Quick response time → **+5 points**  
- Detailed answer indicating clear need → **+10 points**  
- Expresses specific pain point → **+8 points**  
- Shows objections → **-5 points**  
- Not a decision-maker → **-5 points**  
- No budget available → **-10 points** (disqualify)  

---

## **4. Conversation Flow & CTA Execution**
📌 **Direct Sales Approach:**  
- Quickly qualify the lead and push them to book a sales call or demo.  

📌 **Long-Term Nurturing Approach:**  
- Provide free insights before nudging them toward a conversion.  

📌 **CTA Preferences Based on Lead Score:**  
- **Hot Leads (80+ points):** Offer to book a call immediately.  
- **Warm Leads (50-79 points):** Offer a free resource or case study before CTA.  
- **Cold Leads (<50 points):** Store lead for later engagement or exit politely.  

---

## **5. Response Guardrails & Best Practices**
- Avoid robotic responses; make the conversation feel natural.  
- Don't push sales aggressively; adapt based on the lead's engagement level.  
- If a lead asks about competitors, focus on [Company's Key Differentiator].  
- Keep replies concise but informative—avoid overwhelming the lead.  
- If the lead disengages, end politely: *"No worries! Feel free to reach out anytime."*  

---


`,
          },
          {
            role: 'user',
            content: `Previous conversation summary: ${previousSummary}`,
          },
          { role: 'user', content: `New message from lead: ${message}` },
        ],
        temperature: 0.7,
      };

      const response = await lastValueFrom(
        this.httpService.post(apiUrl, payload, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
          },
        }),
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
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: formattedPhone,
        type: 'text',
        text: {
          body: message,
        },
      };

      this.logger.debug('WhatsApp API Request:', {
        url: whatsappUrl,
        method: 'POST',
        payload,
      });

      const response = await lastValueFrom(
        this.httpService.post(whatsappUrl, payload, {
          headers: {
            Authorization: `Bearer ${this.configService.get('WHATSAPP_API_TOKEN')}`,
            'Content-Type': 'application/json',
          },
        }),
      );

      this.logger.debug('WhatsApp API Response:', {
        status: response.status,
        data: response.data,
      });

      return response.data;
    } catch (error) {
      this.logger.error('WhatsApp API Error:', {
        phone,
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        stack: error.stack,
      });

      throw new Error(`Failed to send WhatsApp message: ${error.message}`);
    }
  }

  async sendTemplate(
    phone: string,
    templateName: string,
    components: any[],
  ): Promise<any> {
    try {
      // Format phone number (ensure it has country code)
      const formattedPhone = phone.startsWith('+') ? phone : `+${phone}`;

      // WhatsApp Business API endpoint
      const whatsappUrl = `https://graph.facebook.com/v17.0/${this.configService.get('WHATSAPP_PHONE_NUMBER_ID')}/messages`;

      // WhatsApp API payload for template message
      const payload = {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: formattedPhone,
        type: 'template',
        template: {
          name: templateName,
          language: {
            code: 'en_US',
          },
          components: components,
        },
      };

      this.logger.debug('WhatsApp Template API Request:', {
        url: whatsappUrl,
        method: 'POST',
        payload,
      });

      const response = await lastValueFrom(
        this.httpService.post(whatsappUrl, payload, {
          headers: {
            Authorization: `Bearer ${this.configService.get('WHATSAPP_API_TOKEN')}`,
            'Content-Type': 'application/json',
          },
        }),
      );

      this.logger.debug('WhatsApp Template API Response:', {
        status: response.status,
        data: response.data,
      });

      return response.data;
    } catch (error) {
      this.logger.error('WhatsApp Template API Error:', {
        phone,
        templateName,
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        stack: error.stack,
      });

      throw new Error(
        `Failed to send WhatsApp template message: ${error.message}`,
      );
    }
  }

  // Process incoming webhook data
  async processWebhook(data: any): Promise<any> {
    try {
      this.logger.debug(
        'Processing WhatsApp webhook - raw data:',
        JSON.stringify(data),
      );

      // Extract the relevant information from the webhook payload
      if (data.object === 'whatsapp_business_account') {
        this.logger.debug('Webhook identified as WhatsApp Business Account');
        const entries = data.entry || [];

        this.logger.debug(`Found ${entries.length} entries in webhook data`);

        for (const entry of entries) {
          const changes = entry.changes || [];

          this.logger.debug(
            `Processing entry ID: ${entry.id} with ${changes.length} changes`,
          );

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

                this.logger.debug(
                  `Processing message ID: ${messageId} from ${from} at ${timestamp}`,
                );

                // Handle different message types
                if (message.type === 'text') {
                  const text = message.text?.body;
                  this.logger.log(
                    `Received text message from ${from}: ${text}`,
                  );

                  // Find the lead by phone number
                  this.logger.debug(`Looking up lead for phone: ${from}`);
                  const lead = await this.findOrCreateLead(from, text);

                  if (lead) {
                    this.logger.debug(
                      `Found/created lead: ${lead.name} (ID: ${(lead as any)._id || 'unknown'})`,
                    );
                    // Process the message and generate a response
                    this.logger.debug(
                      `Processing response for message: ${text}`,
                    );
                    await this.processResponse(lead, text);
                    this.logger.debug(`Response processed successfully`);
                  } else {
                    this.logger.warn(
                      `Failed to find or create lead for phone: ${from}`,
                    );
                  }

                  return {
                    from,
                    messageId,
                    timestamp,
                    type: 'text',
                    content: text,
                  };
                } else if (message.type === 'image') {
                  this.logger.log(`Received image message from ${from}`);
                  // Handle image messages
                } else if (message.type === 'location') {
                  this.logger.log(`Received location message from ${from}`);
                  // Handle location messages
                } else {
                  this.logger.warn(
                    `Received unsupported message type: ${message.type} from ${from}`,
                  );
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
        data: JSON.stringify(data),
      });
      throw new Error(`Failed to process WhatsApp webhook: ${error.message}`);
    }
  }

  // Helper method to find or create a lead based on phone number
  private async findOrCreateLead(
    phone: string,
    initialMessage: string,
  ): Promise<Lead | null> {
    try {
      // Replace the mock lead with a call to LeadsService
      return this.leadsService.findOrCreateByPhone(phone, {
        name: 'WhatsApp User',
        source: 'WhatsApp',
        notes: `Initial message: ${initialMessage}`,
      });
    } catch (error) {
      this.logger.error(
        `Error finding or creating lead for phone ${phone}:`,
        error.stack,
      );
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
      receivedToken: token,
    });

    return null;
  }
}
