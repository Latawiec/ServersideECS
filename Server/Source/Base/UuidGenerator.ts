import { throws } from "assert";

export type Uuid = number;

export class UuidGenerator {
    private _counter: number = 0; 
    private _value: Uuid;

    constructor() {
        this._value = this._counter;
    }

    getNext(): Readonly<Uuid> {
        let result = this._value;
        this._counter = this._counter + 1;
        this._value = this._counter;
        return result;
    }
}