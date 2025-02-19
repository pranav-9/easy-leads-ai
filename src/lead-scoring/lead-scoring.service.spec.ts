import { Test, TestingModule } from '@nestjs/testing';
import { LeadScoringService } from './lead-scoring.service';

describe('LeadScoringService', () => {
  let service: LeadScoringService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LeadScoringService],
    }).compile();

    service = module.get<LeadScoringService>(LeadScoringService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
