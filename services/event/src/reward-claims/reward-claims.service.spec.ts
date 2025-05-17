import { Test, TestingModule } from '@nestjs/testing';
import { RewardClaimsService } from './reward-claims.service';

describe('RewardClaimsService', () => {
  let service: RewardClaimsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RewardClaimsService],
    }).compile();

    service = module.get<RewardClaimsService>(RewardClaimsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
