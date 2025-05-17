import { Test, TestingModule } from '@nestjs/testing';
import { RewardClaimsController } from './reward-claims.controller';

describe('RewardClaimsController', () => {
  let controller: RewardClaimsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RewardClaimsController],
    }).compile();

    controller = module.get<RewardClaimsController>(RewardClaimsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
