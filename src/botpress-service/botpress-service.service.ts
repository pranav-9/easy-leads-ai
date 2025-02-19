import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class BotpressService {
    private botpressUrl = process.env.BOTPRESS_URL || 'https://api.botpress.cloud/v1';
    private botpressToken = process.env.BOTPRESS_TOKEN || 'token';

    /**
     * Start a WhatsApp conversation with a lead
     */
    async startConversation(leadId: string, phone: string, initialMessage?: string) {
        try {
            const response = await axios.post(
                `${this.botpressUrl}/chat/conversations`,
                {
                    leadId,
                    phone,
                    message: initialMessage || "Hello, let's begin your qualification process.",
                },
                {
                    headers: {
                        Authorization: `Bearer ${this.botpressToken}`,
                        'Content-Type': 'application/json',
                    },
                },
            );
            return response.data;
        } catch (error) {
            throw new HttpException(
                error.response?.data || 'Error starting conversation',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    /**
     * Process a response from the user
     */
    async processResponse(leadId: string, userResponse: string) {
        try {
            const response = await axios.post(
                `${this.botpressUrl}/conversations/respond`,
                {
                    leadId,
                    message: userResponse,
                },
                {
                    headers: {
                        Authorization: `Bearer ${this.botpressToken}`,
                        'Content-Type': 'application/json',
                    },
                },
            );
            return response.data;
        } catch (error) {
            throw new HttpException(
                error.response?.data || 'Error processing response',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }
}
