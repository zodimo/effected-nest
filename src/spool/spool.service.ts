import { Injectable, Logger } from '@nestjs/common';
import { Chunk, Effect, Queue } from 'effect';

@Injectable()
export class SpoolService {
    private logger = new Logger(SpoolService.name);
    private queue: Effect.Effect<Queue.Queue<string>>;

    constructor() {
        this.queue = Queue.bounded<string>(100);
    }

    logSpoolSize(queue: Queue.Queue<string>, message = '') {
        const spool = this;
        return Effect.gen(function* (_) {
            const queueSize = yield* _(Queue.size(queue));
            spool.logger.log(`queue size : ${queueSize}, message:${message}`);
        });
    }

    spool(item: string) {
        const spool = this;
        return Effect.gen(function* (_) {
            const queue = yield* _(spool.queue);
            spool.logger.log(`offer : ${item}`);
            yield* _(Queue.offer(queue, item));
            yield* _(spool.logSpoolSize(queue,'After offer'));
            return queue;
        });
    }

    doTheWork(items: string[]) {
        const spool = this;
        items.forEach(item => spool.logger.log(`Working with ${item}`));
    }

    flush() {
        const spool = this;
        return Effect.gen(function* (_) {
            const queue = yield* _(spool.queue);
            yield* _(spool.logSpoolSize(queue, 'before takeAll'));
            const result = yield* _(queue.takeAll);
            spool.doTheWork(Chunk.toArray(result));
            return queue;
        });
    }
}
