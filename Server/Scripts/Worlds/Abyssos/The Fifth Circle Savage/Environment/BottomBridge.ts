import { Entity } from "@core/Base/Entity";
import { ScriptSystem } from "@core/Systems/ScriptSystem";
import { TextureSquareDrawable } from "@scripts/Comon/Basic/Drawing/TextureSquareDrawable";
import { DrawingLayers } from "./DrawingLayers";

export class BottomBridge extends ScriptSystem.Component {
    private static AssetPath = "Bridge Bottom.png"
    private static Size = Float32Array.from([182, 0.0, 140]);
    private static Translation = Float32Array.from([17.5, 0.0, -17]);
    private static Layer = DrawingLayers.PoolDebris;

    private drawable: TextureSquareDrawable;

    constructor(parent: Entity, environmentScale: Float32Array) {
        const entity = parent.world.createEntity();
        super(entity);

        this.drawable = new TextureSquareDrawable(this.ownerEntity, BottomBridge.AssetPath);
        this.drawable.transform.scale(BottomBridge.Size).scale(environmentScale);
        this.drawable.layer = BottomBridge.Layer;
        this.drawable.billboard = true;

        entity.transform.move(BottomBridge.Translation);
        
        this.isActive = false;
    }

    preUpdate(): void {    
    }

    onUpdate(): void {
    }

    postUpdate(): void {
    }
}