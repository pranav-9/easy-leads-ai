import { Controller, Post, Body } from '@nestjs/common';
import { BotpressService } from './botpress-service.service';

@Controller('botpress')
export class BotpressController {
  constructor(private readonly botpressService: BotpressService) {}

  @Post('start')
  async startConversation(
    @Body('leadId') leadId: string,
    @Body('phone') phone: string,
    @Body('message') message?: string,
  ) {
    return this.botpressService.startConversation(leadId, phone, message);
  }

  @Post('respond')
  async processResponse(
    @Body('leadId') leadId: string,
    @Body('message') message: string,
  ) {
    return this.botpressService.processResponse(leadId, message);
  }
}
