import { 
    Controller, 
    Post, 
    Body, 
    Get, 
    Query, 
    Logger,
    HttpCode,
    HttpStatus,
    HttpException,
    Param
} from '@nestjs/common';
import { WhatsappService } from './whatsapp.service';
import { LeadsService } from '../leads/leads.service';

@Controller('whatsapp')
export class WhatsappController {
    private readonly logger = new Logger(WhatsappController.name);

    constructor(
        private readonly whatsappService: WhatsappService,
        private readonly leadsService: LeadsService
    ) {}

    @Post('send')
    async sendMessage(@Body() body: { phone: string; message: string }) {
        this.logger.log(`Sending message to ${body.phone}`);
        return this.whatsappService.sendMessage(body.phone, body.message);
    }

    @Post('send-template')
    async sendTemplate(@Body() body: { 
        phone: string; 
        templateName: string;
        components: any[];
    }) {
        this.logger.log(`Sending template ${body.templateName} to ${body.phone}`);
        return this.whatsappService.sendTemplate(
            body.phone, 
            body.templateName, 
            body.components
        );
    }

    @Post('start/:leadId')
    async startConversation(@Param('leadId') leadId: string) {
        this.logger.log(`Starting conversation with lead ${leadId}`);
        
        try {
            const lead = await this.leadsService.getLeadById(leadId);
            
            if (!lead) {
                throw new HttpException('Lead not found', HttpStatus.NOT_FOUND);
            }
            
            return this.whatsappService.startConversation(lead);
        } catch (error) {
            this.logger.error(`Error starting conversation with lead ${leadId}:`, error.stack);
            throw new HttpException(
                `Failed to start conversation: ${error.message}`, 
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    @Post('webhook')
    @HttpCode(HttpStatus.OK)
    async webhook(@Body() body: any) {
        this.logger.debug('Received webhook from WhatsApp - controller entry point');
        
        try {
            this.logger.debug(`Webhook payload: ${JSON.stringify(body)}`);
            
            if (!body || Object.keys(body).length === 0) {
                this.logger.warn('Empty webhook payload received');
                return { success: true, message: 'Empty payload received' };
            }
            
            this.logger.debug('Forwarding webhook data to WhatsappService.processWebhook');
            const result = await this.whatsappService.processWebhook(body);
            
            if (result) {
                this.logger.debug(`Webhook processing result: ${JSON.stringify(result)}`);
            } else {
                this.logger.debug('Webhook processed with no result (null/undefined returned)');
            }
            
            // WhatsApp expects a 200 OK response
            return { success: true };
        } catch (error) {
            this.logger.error('Error processing webhook in controller:', {
                message: error.message,
                stack: error.stack
            });
            // Still return 200 to WhatsApp to acknowledge receipt
            return { success: false, error: error.message };
        }
    }

    @Get('webhook')
    verifyWebhook(
        @Query('hub.mode') mode: string,
        @Query('hub.verify_token') token: string,
        @Query('hub.challenge') challenge: string,
    ) {
        this.logger.debug('Verifying WhatsApp webhook');
        
        const result = this.whatsappService.verifyWebhook(mode, token, challenge);
        
        if (result) {
            return result;
        }
        
        throw new HttpException('Webhook verification failed', HttpStatus.FORBIDDEN);
    }
}
