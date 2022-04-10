"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UuidGenerator = void 0;
class UuidGenerator {
    constructor() {
        this._counter = 0;
        this._value = this._counter;
    }
    getNext() {
        let result = this._value;
        this._counter = this._counter + 1;
        this._value = this._counter;
        return result;
    }
}
exports.UuidGenerator = UuidGenerator;
