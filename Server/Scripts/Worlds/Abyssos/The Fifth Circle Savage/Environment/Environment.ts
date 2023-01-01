import { Entity } from "@core/Base/Entity";
import { ScriptSystem } from "@core/Systems/ScriptSystem";
import { OverviewCamera } from "@scripts/Comon/Basic/Camera/OverviewCamera";
import { BottomBridge } from "./BottomBridge";
import { Debris } from "./Debris";
import { Mesh } from "./Mesh";
import { Pipe } from "./Pipe";
import { Platform } from "./Platform"
import { PoolEdge } from "./PoolEdge";
import { TopBridge } from "./TopBridge";


export class Environment extends ScriptSystem.Component {

    public static PixelsToYalmsScale = Float32Array.from([2*0.0397995, 2*0.0397995, 2*0.0397995]); // yalms / pixel

    private platform: Platform;
    private bottomBridge: BottomBridge;
    private topBridge: TopBridge;
    private mesh: Mesh;
    private pipe: Pipe;
    private debris: Debris;
    private poolEdge: PoolEdge;

    private testCamera: OverviewCamera;

    constructor(owner: Entity) {
        super(owner);
        this.testCamera = new OverviewCamera(owner);

        this.debris = new Debris(owner, Environment.PixelsToYalmsScale);
        this.bottomBridge = new BottomBridge(owner, Environment.PixelsToYalmsScale);
        this.topBridge = new TopBridge(owner, Environment.PixelsToYalmsScale);
        this.mesh = new Mesh(owner, Environment.PixelsToYalmsScale);
        this.pipe = new Pipe(owner, Environment.PixelsToYalmsScale);
        this.platform = new Platform(owner, Environment.PixelsToYalmsScale);
        this.poolEdge = new PoolEdge(owner, Environment.PixelsToYalmsScale);
        
        this.isActive = false;
    }

    preUpdate(): void {
    }
    onUpdate(): void {
    }
    postUpdate(): void {
    }

}