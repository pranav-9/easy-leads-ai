import { Controller, Post, Body, Get, Param, Patch } from '@nestjs/common';
import { LeadsService } from './leads.service';

@Controller('leads')
export class LeadsController {
    constructor(private readonly leadsService: LeadsService) { }

    @Post()
    async createLead(@Body() body: any) {
        return this.leadsService.createLead(body);
    }

    @Get()
    async getLeads() {
        return this.leadsService.getLeads();
    }


    @Get(':id')
    async getLead(@Param('id') id: string) {
        return this.leadsService.getLeadById(id);
    }

    @Patch(':id')
    async updateLead(@Param('id') id: string, @Body() body: any) {
        return this.leadsService.updateLead(id, body);
    }
}
