import { Test, TestingModule } from '@nestjs/testing';
import { SpoolController } from './spool.controller';

describe('SpoolController', () => {
  let controller: SpoolController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SpoolController],
    }).compile();

    controller = module.get<SpoolController>(SpoolController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
