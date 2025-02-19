import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { SettingsService } from './settings.service';

@Controller('settings')
export class SettingsController {
    constructor(private readonly settingsService: SettingsService) {}

    @Post('/chatbot')
    async updateChatbotSettings(@Body() body: { config: Record<string, any> }) {
        return this.settingsService.updateSettings('chatbot', body.config);
    }

    @Post('/icp')
    async updateIcpSettings(@Body() body: { config: Record<string, any> }) {
        return this.settingsService.updateSettings('icp', body.config);
    }

    @Get('/:type')
    async getSettings(@Param('type') type: string) {
        return this.settingsService.getSettings(type);
    }
}
