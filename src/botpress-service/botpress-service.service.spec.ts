import { Test, TestingModule } from '@nestjs/testing';
import { BotpressService } from './botpress-service.service';

describe('BotpressServiceService', () => {
  let service: BotpressService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BotpressService],
    }).compile();

    service = module.get<BotpressService>(BotpressService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
