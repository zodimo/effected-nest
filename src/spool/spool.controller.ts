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
        this.spoolRefEff = SpoolService.makeRefSpool();
        this.start().pipe(Effect.runPromise);
    }

    @Cron('* * * * * *')
    spool() {
        this.logger.log('Running spool');
        const now = new Date();
        this.spoolService.spool(this.spoolRefEff, `Item: ${now}`).pipe(Effect.runPromise);
    }

    start() {
        // create mutex for 1
        const spoolController = this;
        const spoolService = this.spoolService;
        this.logger.log('Start Deamon if not running..');
        return Effect.gen(function* (_) {
            return yield* _(Effect.forkDaemon(spoolService.start(spoolController.spoolRefEff)));
        });
    }
}
