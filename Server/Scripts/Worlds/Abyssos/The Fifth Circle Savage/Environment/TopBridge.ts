import { Entity } from "@core/Base/Entity";
import { ScriptSystem } from "@core/Systems/ScriptSystem";
import { TextureSquareDrawable } from "@scripts/Comon/Basic/Drawing/TextureSquareDrawable";
import { DrawingLayers } from "./DrawingLayers";

export class TopBridge extends ScriptSystem.Component {
    private static AssetPath = "Bridge Top.png"
    private static Size = Float32Array.from([244, 0.0, 99]);
    private static Scale = Float32Array.from([0.01, 0.01, 0.01]);
    private static Translation = Float32Array.from([-1.6, 0.0, 3.6]);
    private static Layer = DrawingLayers.PoolDebris;

    private drawable: TextureSquareDrawable;

    constructor(owner: Entity) {
        super(owner);

        this.drawable = new TextureSquareDrawable(this.ownerEntity, TopBridge.AssetPath);
        this.drawable.transform.scale(TopBridge.Size).scale(TopBridge.Scale);
        this.drawable.transform.move(TopBridge.Translation)
        this.drawable.layer = TopBridge.Layer;
        this.drawable.billboard = true;

        this.isActive = false;
    }

    preUpdate(): void {    
    }

    onUpdate(): void {
    }

    postUpdate(): void {
    }
}