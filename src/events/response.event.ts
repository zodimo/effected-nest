export class ResponseEvent<T>{
    id: string;
    correlationId: string;
    payload: T
}