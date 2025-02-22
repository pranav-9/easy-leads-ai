import { Controller, Post, Body } from '@nestjs/common';
import { BotpressService } from './botpress-service.service';
import { LeadsService } from '../leads/leads.service';
import { Lead } from '../leads/schema/leads.schema';

@Controller('botpress')
export class BotpressController {
    constructor(
        private readonly botpressService: BotpressService,
        private readonly leadsService: LeadsService
    ) {}

    @Post('start')
    async startConversation(@Body('leadId') leadId: string) {
        const lead: Lead = await this.leadsService.getLeadById(leadId);
        if (!lead) throw new Error('Lead not found');
        return this.botpressService.startConversation(lead);
    }

    @Post('respond')
    async processResponse(
        @Body('leadId') leadId: string,
        @Body('message') message: string
    ) {
        const lead: Lead = await this.leadsService.getLeadById(leadId);
        if (!lead) throw new Error('Lead not found');
        return this.botpressService.processResponse(lead, message);
    }
}
