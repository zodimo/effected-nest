import { Controller, Logger } from '@nestjs/common';
import { SpoolService } from './spool.service';
import { Cron } from '@nestjs/schedule';
import { Effect } from 'effect';

@Controller('spool')
export class SpoolController {
    private logger = new Logger(SpoolController.name);

    constructor(private spoolService: SpoolService) { }

    @Cron('*/5 * * * * *')
    spool() {
        this.logger.log('Running spool');
        const now = new Date();
        this.spoolService.spool(`Item: ${now}`).pipe(Effect.runPromise);
    }

    @Cron('* * * * * *')
    flush() {
        this.logger.log('Running flush');
        this.spoolService.flush().pipe(Effect.runPromise);
    }
}
