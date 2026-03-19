import { Test, TestingModule } from '@nestjs/testing';
import { BotpressController } from './botpress-service.controller';
import { BotpressService } from './botpress-service.service';
import { LeadsService } from '../leads/leads.service';

describe('BotpressController', () => {
  let controller: BotpressController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BotpressController],
      providers: [
        {
          provide: BotpressService,
          useValue: {},
        },
        {
          provide: LeadsService,
          useValue: {},
        },
      ],
    }).compile();

    controller = module.get<BotpressController>(BotpressController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
