import { Logger } from '@nestjs/common';
import { Chunk, Effect, Queue, Ref, SynchronizedRef } from 'effect';


export type SpoolRef<T> = SynchronizedRef.SynchronizedRef<Effect.Effect<Queue.Queue<T>>>;
export type SpoolRefEff<T> = Effect.Effect<SpoolRef<T>>;


export class SpoolService {

    constructor(private logger: Logger) {
    }

    static makeRefSpool<T>(): SpoolRefEff<T> {
        return SynchronizedRef.make(Queue.unbounded());
    }

    getSpool(spoolRefEff: SpoolRefEff<string>) {
        return Effect.gen(function* (_) {
            const syncSpoolRef = yield* _(spoolRefEff);
            const queueEff = yield* _(SynchronizedRef.get(syncSpoolRef));
            return yield* _(queueEff);
        })
    }


    offerSpool(spoolRefEff: SpoolRefEff<string>, item: string) {
        return Effect.gen(function* (_) {
            const spoolRef = yield* _(spoolRefEff);
            return yield* _(SynchronizedRef.updateEffect(spoolRef, (spool) => {
                return Effect.gen(function* (_) {
                    const queue = yield* _(spool);
                    return Queue.offer(queue, item).pipe(Effect.map(_ => queue));
                });
            }));
        });
    }

    logSpoolSize(spoolRefEff: SpoolRefEff<string>, contextMessage = '') {
        const spoolService = this;
        return Effect.gen(function* (_) {
            const spool = yield* _(spoolService.getSpool(spoolRefEff));
            const spoolSize = yield* _(Queue.size(spool));
            spoolService.logger.log(`queue size : ${spoolSize}, message: ${contextMessage}`);
        });
    }

    spool(spoolRefEff: SpoolRefEff<string>, item: string) {
        const spoolService = this;
        return Effect.gen(function* (_) {
            spoolService.logger.log(`offer : ${item}`);
            yield* _(spoolService.offerSpool(spoolRefEff, item));
            yield* _(spoolService.logSpoolSize(spoolRefEff, 'After offer'));
        });
    }

    doTheWork(items: string[]) {
        const spoolService = this;
        items.forEach(item => spoolService.logger.log(`Working with ${item}`));
    }

    flush(spoolRefEff: SpoolRefEff<string>) {
        const spoolService = this;
        return Effect.gen(function* (_) {
            const spoolRef = yield* _(spoolRefEff);
            yield* _(spoolService.logSpoolSize(spoolRefEff, 'Before takeall'));
            return yield* _(SynchronizedRef.updateEffect(spoolRef, (spool) => {
                return Effect.gen(function* (_) {
                    const queue = yield* _(spool);
                    const result = yield* _(queue.takeAll);
                    spoolService.doTheWork(Chunk.toArray(result));
                    return Effect.succeed(queue);
                });
            }));
        });

    }
}
