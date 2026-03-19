import { Test, TestingModule } from '@nestjs/testing';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { getModelToken } from '@nestjs/mongoose';
import { WhatsappService } from './whatsapp.service';
import { ChatSummary } from '../botpress-service/schemas/chat-summary.schema';
import { SettingsService } from '../settings/settings.service';
import { LeadScoringService } from '../lead-scoring/lead-scoring.service';
import { LeadsService } from '../leads/leads.service';

describe('WhatsappService', () => {
  let service: WhatsappService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WhatsappService,
        {
          provide: HttpService,
          useValue: {},
        },
        {
          provide: ConfigService,
          useValue: {},
        },
        {
          provide: getModelToken(ChatSummary.name),
          useValue: {},
        },
        {
          provide: SettingsService,
          useValue: {},
        },
        {
          provide: LeadScoringService,
          useValue: {},
        },
        {
          provide: LeadsService,
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<WhatsappService>(WhatsappService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
