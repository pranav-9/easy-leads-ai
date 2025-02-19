import { Controller, Post, Body } from '@nestjs/common';
import { LeadScoringService } from './lead-scoring.service';

@Controller('lead-scoring')
export class LeadScoringController {
    constructor(private readonly leadScoringService: LeadScoringService) { }

    @Post('score')
    async computeLeadScore(@Body() leadData: any) {
        return this.leadScoringService.calculateLeadScore(leadData);
    }
}
