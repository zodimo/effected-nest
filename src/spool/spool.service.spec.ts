import { Test, TestingModule } from '@nestjs/testing';
import { SpoolService } from './spool.service';

describe('SpoolService', () => {
  let service: SpoolService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SpoolService],
    }).compile();

    service = module.get<SpoolService>(SpoolService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
