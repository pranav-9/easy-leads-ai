import { Test, TestingModule } from '@nestjs/testing';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { getModelToken } from '@nestjs/mongoose';
import { LeadScoringService } from './lead-scoring.service';
import { Lead } from '../leads/schema/leads.schema';
import { ChatSummary } from '../botpress-service/schemas/chat-summary.schema';

describe('LeadScoringService', () => {
  let service: LeadScoringService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LeadScoringService,
        {
          provide: getModelToken(Lead.name),
          useValue: {},
        },
        {
          provide: getModelToken(ChatSummary.name),
          useValue: {},
        },
        {
          provide: ConfigService,
          useValue: {},
        },
        {
          provide: HttpService,
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<LeadScoringService>(LeadScoringService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
