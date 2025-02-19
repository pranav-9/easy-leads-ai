import { Test, TestingModule } from '@nestjs/testing';
import { BotpressServiceService } from './botpress-service.service';

describe('BotpressServiceService', () => {
  let service: BotpressServiceService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BotpressServiceService],
    }).compile();

    service = module.get<BotpressServiceService>(BotpressServiceService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
