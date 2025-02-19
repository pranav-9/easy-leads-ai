import { Test, TestingModule } from '@nestjs/testing';
import { LeadScoringController } from './lead-scoring.controller';

describe('LeadScoringController', () => {
  let controller: LeadScoringController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LeadScoringController],
    }).compile();

    controller = module.get<LeadScoringController>(LeadScoringController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
