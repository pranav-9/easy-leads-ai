import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { LeadsService } from './leads.service';
import { Lead } from './schema/leads.schema';
import { Settings } from '../settings/schemas/settings.schema';
import { LeadScoringService } from '../lead-scoring/lead-scoring.service';

describe('LeadsService', () => {
  let service: LeadsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LeadsService,
        {
          provide: getModelToken(Lead.name),
          useValue: {},
        },
        {
          provide: getModelToken(Settings.name),
          useValue: {},
        },
        {
          provide: LeadScoringService,
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<LeadsService>(LeadsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
