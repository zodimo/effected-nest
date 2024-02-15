import { Module } from '@nestjs/common';
import { SpoolService } from './spool.service';
import { SpoolController } from './spool.controller';

@Module({
  providers: [SpoolService],
  controllers: [SpoolController]
})
export class SpoolModule {}
