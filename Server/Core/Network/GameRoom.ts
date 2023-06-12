import { Uuid } from "@core/Base/UuidGenerator";
import { World } from "@core/World/World";
import { ClientConnection } from "./ClientConnection";
import { ClientConnectionSystem } from "@core/Systems/ClientConnectionSystem";
import { Serializer } from "@core/Serialization/Serializer"
import { AbyssosTheFifthCircleSavage } from "@scripts/Worlds/Abyssos/The Fifth Circle Savage/World";
import { GameConfig } from "@shared/GameConfig/GameConfig";

export class GameRoom {
    private _world: World | undefined;
    private _isRunning: boolean = false;
    private _isPreparing: boolean = false;
    private _connectionIdComponentMap: Map<Uuid, ClientConnectionSystem.Component> = new Map();
    private _serializer = new Serializer();

    private _clientsPreparationStatus: Map<Uuid, boolean> = new Map();
    
    public gameMasterConnectionId: Uuid | undefined;

    constructor(config: GameConfig) {
        // TODO: world creation based on Config.
        const world = new AbyssosTheFifthCircleSavage();
        this._world = world;
    }

    get world(): Readonly<World> | undefined {
        return this._world;
    }

    start(connection: ClientConnection) {
        if (!this._world) {
            // Starting a game without world set.
            return;
        }

        if (this._isRunning) {
            // It's already runnig.
            return;
        }

        this._isPreparing = true;
        this._clientsPreparationStatus.clear();

        const response = new GamePreparationResponse();
        response.requiredAssetsPath = this._world.getAssetPackagePath();

        this._gameRoomMessageRouter.broadcast(JSON.stringify(response))
    }

    playerInput(connection: ClientConnection, request: GameInputRequest) {
        if (!this._connectionIdComponentMap.has(connection.id)) {
            // We got input from a player that isn't in the room.
            return;
        }
        
        const connectionComponent = this._connectionIdComponentMap.get(connection.id)!;

        if (request.keyPressed) {
            connectionComponent.emit('keyPressed', request.keyPressed)
        }

        if (request.keyReleased) {
            connectionComponent.emit('keyReleased', request.keyReleased);
        }
    }

    preparation(connection: ClientConnection, request: GamePreparationRequest) {
        if (!this._isPreparing || this._isRunning) {
            // We're not preparing the game.
            return;
        }

        // TODO: Verify all players in game.
        if (request.assetsReady) {
            this._isPreparing = false;
            this._isRunning = true;
        }
    }

    addConnection(connection: ClientConnection) {
        this._gameRoomMessageRouter.addConnection(connection);
        if (this.gameMasterConnectionId === undefined) {
            // First person to join. They are now the Game Master.
            this.gameMasterConnectionId = connection.id;
        }
    }

    removeConnection(connection: ClientConnection) {
        this._gameRoomMessageRouter.removeConnection(connection);
        if (this.gameMasterConnectionId && connection.id === this.gameMasterConnectionId) {
            // Game master lost. Give it to someone else.
        }
    }

    update() {
        if (this._isRunning) {
            this._world!.update();
            this._serializer.update(this._world!);
            const response = new GameUpdateResponse();
            response.data = this._serializer.asSnapshot();
            this._gameRoomMessageRouter.broadcast(JSON.stringify(response));
        }
    }
}