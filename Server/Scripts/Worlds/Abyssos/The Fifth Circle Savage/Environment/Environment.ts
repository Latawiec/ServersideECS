import { Entity } from "@core/Base/Entity";
import { ScriptSystem } from "@core/Systems/ScriptSystem";
import { OverviewCamera } from "@scripts/Comon/Basic/Camera/OverviewCamera";
import { BottomBridge } from "./BottomBridge";
import { Debris } from "./Debris";
import { Mesh } from "./Mesh";
import { Pipe } from "./Pipe";
import { Platform } from "./Platform"
import { TopBridge } from "./TopBridge";


export class Environment extends ScriptSystem.Component {

    private platform: Platform;
    private bottomBridge: BottomBridge;
    private topBridge: TopBridge;
    private mesh: Mesh;
    private pipe: Pipe;
    private debris: Debris;

    private testCamera: OverviewCamera;

    constructor(owner: Entity) {
        super(owner);
        this.testCamera = new OverviewCamera(owner);

        this.platform = new Platform(owner.world.createEntity(owner));
        this.bottomBridge = new BottomBridge(owner.world.createEntity(owner));
        this.topBridge = new TopBridge(owner.world.createEntity(owner));
        this.mesh = new Mesh(owner.world.createEntity(owner));
        this.pipe = new Pipe(owner.world.createEntity(owner));
        this.debris = new Debris(owner.world.createEntity(owner));

        this.isActive = false;
    }

    preUpdate(): void {
    }
    onUpdate(): void {
    }
    postUpdate(): void {
    }

}