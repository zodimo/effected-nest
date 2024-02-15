import { Controller, Logger } from '@nestjs/common';
import { SpoolRefEff, SpoolService } from './spool.service';
import { Cron } from '@nestjs/schedule';
import { Effect, Queue, Ref, SynchronizedRef } from 'effect';

@Controller('spool')
export class SpoolController {
    private logger = new Logger(SpoolController.name);
    private spoolService: SpoolService;
    private spoolRefEff: SpoolRefEff<string>;

    constructor() {
        this.spoolService = new SpoolService(
            new Logger(SpoolService.name),
            
        )
        this.spoolRefEff=SpoolService.makeRefSpool();
    }

    @Cron('* * * * * *')
    spool() {
        this.logger.log('Running spool');
        const now = new Date();
        this.spoolService.spool(this.spoolRefEff, `Item: ${now}`).pipe(Effect.runPromise);
    }

    @Cron('*/10 * * * * *')
    flush() {
        this.logger.log('Running flush');
        return this.spoolService.flush(this.spoolRefEff,).pipe(Effect.runPromise);
    }
}
