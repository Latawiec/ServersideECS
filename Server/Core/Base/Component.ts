import { EventEmitter } from "stream";
import { Entity } from "./Entity"
import { MetaClass, MetaName } from "./MetaName";
import { Uuid } from "./UuidGenerator"

export abstract class ComponentBase implements MetaClass {
    public isActive = true;
    private _systemAsignedId: Uuid;
    private _ownerEntity: Entity;

    constructor(owner: Entity) {
        const world = owner.world;
        this._systemAsignedId = world.registerComponent(owner, this);
        this._ownerEntity = owner;
    }

    unregister() {
        const world = this._ownerEntity.world;
        world.unregisterComponent(this);
    }

    get systemAsignedId(): Uuid {
        return this._systemAsignedId;
    }
    
    get ownerEntity(): Entity {
        return this._ownerEntity
    }

    abstract get systemMetaName(): MetaName;
    abstract get metaName(): string;
}

export abstract class EventfulComponentBase extends ComponentBase implements EventEmitter {
    private _eventEmitter = new EventEmitter();

    addListener(eventName: string | symbol, listener: (...args: any[]) => void): this {
        this._eventEmitter.addListener(eventName, listener);
        return this;
    }
    on(eventName: string | symbol, listener: (...args: any[]) => void): this {
        this._eventEmitter.on(eventName, listener);
        return this;
    }
    once(eventName: string | symbol, listener: (...args: any[]) => void): this {
        this._eventEmitter.once(eventName, listener);
        return this;
    }
    removeListener(eventName: string | symbol, listener: (...args: any[]) => void): this {
        this._eventEmitter.removeListener(eventName, listener);
        return this;
    }
    off(eventName: string | symbol, listener: (...args: any[]) => void): this {
        this._eventEmitter.off(eventName, listener);
        return this;
    }
    removeAllListeners(event?: string | symbol | undefined): this {
        this._eventEmitter.removeAllListeners(event);
        return this;
    }
    setMaxListeners(n: number): this {
        this._eventEmitter.setMaxListeners(n);
        return this;
    }
    getMaxListeners(): number {
        return this._eventEmitter.getMaxListeners();
    }
    listeners(eventName: string | symbol): Function[] {
        return this._eventEmitter.listeners(eventName);
    }
    rawListeners(eventName: string | symbol): Function[] {
        return this._eventEmitter.rawListeners(eventName);
    }
    emit(eventName: string | symbol, ...args: any[]): boolean {
        return this._eventEmitter.emit(eventName, args);
    }
    listenerCount(eventName: string | symbol): number {
        return this._eventEmitter.listenerCount(eventName);
    }
    prependListener(eventName: string | symbol, listener: (...args: any[]) => void): this {
        this._eventEmitter.prependListener(eventName, listener);
        return this;
    }
    prependOnceListener(eventName: string | symbol, listener: (...args: any[]) => void): this {
        this._eventEmitter.prependOnceListener(eventName, listener);
        return this;
    }
    eventNames(): (string | symbol)[] {
        return this._eventEmitter.eventNames();
    }
}