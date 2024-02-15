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

    constructor(private logger: Logger) {
    }

    static makeRefSpool<T>(): SpoolRefEff<T> {
        return Ref.make(new Spool());
    }

    getSpool(spoolRefEff: SpoolRefEff<string>) {
        return Effect.gen(function* (_) {
            const spoolRef = yield* _(spoolRefEff);
            return yield* _(Ref.get(spoolRef));
        })
    }


    offerSpool(spoolRefEff: SpoolRefEff<string>, item: string) {
        return Effect.gen(function* (_) {
            const spoolRef = yield* _(spoolRefEff);
            return yield* _(Ref.update(spoolRef, (spool) => {
                spool.offer(item);
                return spool;
            }));

        });
    }

    logSpoolSize(spoolRefEff: SpoolRefEff<string>, contextMessage = '') {
        const spoolService = this;
        return Effect.gen(function* (_) {
            const spool = yield* _(spoolService.getSpool(spoolRefEff));
            spoolService.logger.log(`queue size : ${spool.size}, message: ${contextMessage}`);
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
            return yield* _(Ref.update(spoolRef, (spool) => {
                spoolService.doTheWork(spool.takeAll());
                return spool;
            }));
        });
    }
}
