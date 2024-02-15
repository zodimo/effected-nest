import { Logger } from '@nestjs/common';
import { Chunk, Effect, Queue, Ref, SynchronizedRef } from 'effect';


export class Spool<T> {
    private _spool: T[];
    constructor() {
        this._spool = [];
    }
    offer(item: T): boolean {
        this._spool.push(item);
        return true;
    }
    takeAll(): T[] {
        const _spool = [...this._spool];
        this._spool = [];
        return _spool;
    }
    get size(): number {
        return this._spool.length;
    }
}

export type SpoolRef<T> = Ref.Ref<Spool<T>>;
export type SpoolRefEff<T> = Effect.Effect<SpoolRef<T>>;


export class SpoolService {

    constructor(private logger: Logger, private spoolRefEff: SpoolRefEff<string>) {

    }

    static makeRefSpool<T>(): SpoolRefEff<T> {
        return Ref.make(new Spool());
    }

    getSpool() {
        const spoolService = this;
        return Effect.gen(function* (_) {
            const spoolRef = yield* _(spoolService.spoolRefEff);
            return yield* _(Ref.get(spoolRef));
        })
    }


    offerSpool(item: string) {
        const spoolService = this;
        return Effect.gen(function* (_) {
            const spoolRef = yield* _(spoolService.spoolRefEff);
            return yield* _(Ref.update(spoolRef, (spool) => {
                spool.offer(item);
                return spool;
            }));

        });
    }

    logSpoolSize(contextMessage = '') {
        const spoolService = this;
        return Effect.gen(function* (_) {
            const spool = yield* _(spoolService.getSpool());
            spoolService.logger.log(`queue size : ${spool.size}, message: ${contextMessage}`);
        });
    }

    spool(item: string) {
        const spoolService = this;
        return Effect.gen(function* (_) {
            spoolService.logger.log(`offer : ${item}`);
            yield* _(spoolService.offerSpool(item));
            yield* _(spoolService.logSpoolSize('After offer'));
        });
    }

    doTheWork(items: string[]) {
        const spoolService = this;
        items.forEach(item => spoolService.logger.log(`Working with ${item}`));
    }

    flush() {
        const spoolService = this;
        return Effect.gen(function* (_) {
            const spoolRef = yield* _(spoolService.spoolRefEff);
            yield* _(spoolService.logSpoolSize('Before takeall'));
            return yield* _(Ref.update(spoolRef, (spool) => {
                spoolService.doTheWork(spool.takeAll());
                return spool;
            }));
        });
    }
}
