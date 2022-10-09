import { Entity } from "@core/Base/Entity";
import { ScriptSystem } from "@core/Systems/ScriptSystem";
import { TextureSquareDrawable } from "@scripts/Comon/Basic/Drawing/TextureSquareDrawable";
import { DrawingLayers } from "./DrawingLayers";

export class BottomBridge extends ScriptSystem.Component {
    private static AssetPath = "Bridge Bottom.png"
    private static Size = Float32Array.from([182, 0.0, 140]);
    private static Scale = Float32Array.from([0.01, 0.01, 0.01]);
    private static Translation = Float32Array.from([2.4, 0.0, -2.2]);
    private static Layer = DrawingLayers.PoolDebris;

    private drawable: TextureSquareDrawable;

    constructor(owner: Entity) {
        super(owner);

        this.drawable = new TextureSquareDrawable(this.ownerEntity, BottomBridge.AssetPath);
        this.drawable.transform.scale(BottomBridge.Size).scale(BottomBridge.Scale);
        this.drawable.transform.move(BottomBridge.Translation)
        this.drawable.layer = BottomBridge.Layer;
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