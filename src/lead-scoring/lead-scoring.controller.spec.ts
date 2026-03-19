import { Test, TestingModule } from '@nestjs/testing';
import { LeadScoringController } from './lead-scoring.controller';
import { LeadScoringService } from './lead-scoring.service';

describe('LeadScoringController', () => {
  let controller: LeadScoringController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LeadScoringController],
      providers: [
        {
          provide: LeadScoringService,
          useValue: {},
        },
      ],
    }).compile();

    controller = module.get<LeadScoringController>(LeadScoringController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
