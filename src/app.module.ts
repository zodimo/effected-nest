import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SpoolModule } from './spool/spool.module';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    SpoolModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
