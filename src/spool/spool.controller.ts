import { Controller, Logger } from '@nestjs/common';
import { SpoolService } from './spool.service';
import { Cron } from '@nestjs/schedule';
import { Effect, Queue, Ref, SynchronizedRef } from 'effect';

@Controller('spool')
export class SpoolController {
    private logger = new Logger(SpoolController.name);   
    private spoolService: SpoolService;
    constructor() {
        this.spoolService = new SpoolService(
            new Logger(SpoolService.name),
            SpoolService.makeRefSpool()
        )       
    }

    @Cron('*/5 * * * * *')
    spool() {
        this.logger.log('Running spool');
        const now = new Date();
        this.spoolService.spool( `Item: ${now}`).pipe(Effect.runPromise);
    }

    @Cron('* * * * * *')
    flush() {
        this.logger.log('Running flush');
        return this.spoolService.flush().pipe(Effect.runPromise);
    }
}
