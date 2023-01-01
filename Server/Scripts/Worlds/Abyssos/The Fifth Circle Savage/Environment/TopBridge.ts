import { Entity } from "@core/Base/Entity";
import { ScriptSystem } from "@core/Systems/ScriptSystem";
import { TextureSquareDrawable } from "@scripts/Comon/Basic/Drawing/TextureSquareDrawable";
import { DrawingLayers } from "./DrawingLayers";

export class TopBridge extends ScriptSystem.Component {
    private static AssetPath = "Bridge Top.png"
    private static Size = Float32Array.from([244, 0.0, 99]);
    private static Translation = Float32Array.from([-16, 0.0, 19]);
    private static Layer = DrawingLayers.PoolDebris;

    private drawable: TextureSquareDrawable;

    constructor(owner: Entity, environmentScale: Float32Array) {
        const entity = owner.world.createEntity();
        super(entity);

        this.drawable = new TextureSquareDrawable(this.ownerEntity, TopBridge.AssetPath);
        this.drawable.transform.scale(TopBridge.Size).scale(environmentScale);
        this.drawable.layer = TopBridge.Layer;
        this.drawable.billboard = true;
        
        entity.transform.move(TopBridge.Translation);

        this.isActive = false;
    }

    preUpdate(): void {    
    }

    onUpdate(): void {
    }

    postUpdate(): void {
    }
}