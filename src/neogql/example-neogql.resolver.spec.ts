import { Test, TestingModule } from '@nestjs/testing';
import { NeogqlResolver } from './neogql.resolver';

describe('NeogqlResolver', () => {
  let resolver: NeogqlResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [NeogqlResolver],
    }).compile();

    resolver = module.get<NeogqlResolver>(NeogqlResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
