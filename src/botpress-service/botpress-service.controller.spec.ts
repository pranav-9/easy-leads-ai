import { Test, TestingModule } from '@nestjs/testing';
import { BotpressServiceController } from './botpress-service.controller';

describe('BotpressServiceController', () => {
  let controller: BotpressServiceController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BotpressServiceController],
    }).compile();

    controller = module.get<BotpressServiceController>(BotpressServiceController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
