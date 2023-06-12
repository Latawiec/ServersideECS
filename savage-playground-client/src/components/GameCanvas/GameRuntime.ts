import { AssetStorage } from "./Assets/AssetStorage";
import { GameCommunication } from "./Communication/GameCommuinication";
import { GameUpdateEvent } from "./Communication/GameRuntime/ServerEvents/GameUpdateEvent";
import { GameRenderer } from "./Rendering/GameRenderer";


export class GameRuntime {
    private _assetStorage: AssetStorage;
    private _renderer: GameRenderer;
    private _communication: GameCommunication;

    private _assetPackagePath: string;
    private _gameServerAddress: string;

    constructor(gameCanvas: HTMLCanvasElement, assetPackagePath: string, gameServerAddress: string) {
        this._assetPackagePath = assetPackagePath;
        this._gameServerAddress = gameServerAddress;

        this._assetStorage = new AssetStorage();
        this._renderer = new GameRenderer(gameCanvas, this._assetStorage);
        this._communication = new GameCommunication(gameServerAddress);
    }

    async initialize() {
        await this._assetStorage.downloadPackage(this._assetPackagePath);
        
        this._communication.on('gameUpdate', this.onGameUpdate);
    }

    private onGameUpdate(event: GameUpdateEvent) {
        const worldSnapshot = event.snapshot;
        this._renderer.render(worldSnapshot);
    }
}