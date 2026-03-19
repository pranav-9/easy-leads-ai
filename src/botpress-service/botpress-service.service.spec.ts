import { Test, TestingModule } from '@nestjs/testing';
import { HttpService } from '@nestjs/axios';
import { getModelToken } from '@nestjs/mongoose';
import { BotpressService } from './botpress-service.service';
import { ChatSummary } from './schemas/chat-summary.schema';
import { SettingsService } from '../settings/settings.service';
import { LeadScoringService } from '../lead-scoring/lead-scoring.service';

describe('BotpressServiceService', () => {
  let service: BotpressService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BotpressService,
        {
          provide: HttpService,
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
      ],
    }).compile();

    service = module.get<BotpressService>(BotpressService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
