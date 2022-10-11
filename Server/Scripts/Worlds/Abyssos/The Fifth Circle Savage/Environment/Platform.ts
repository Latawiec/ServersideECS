import { Entity } from "@core/Base/Entity";
import { ScriptSystem } from "@core/Systems/ScriptSystem";
import { TextureSquareDrawable } from "@scripts/Comon/Basic/Drawing/TextureSquareDrawable";
import { DrawingLayers } from "./DrawingLayers";


export class Platform extends ScriptSystem.Component {
    private static AssetPath = "Platform.png"
    private static Size = Float32Array.from([537, 0.0, 400]);
    private static Layer = DrawingLayers.Platform;

    private drawable: TextureSquareDrawable;

    constructor(parent: Entity, environmentScale: Float32Array) {
        const entity = parent.world.createEntity();
        super(entity);
        
        this.drawable = new TextureSquareDrawable(this.ownerEntity, Platform.AssetPath);
        this.drawable.transform.scale(Platform.Size).scale(environmentScale);
        this.drawable.layer = Platform.Layer;
        this.drawable.billboard = true;
        this.drawable.opacity = 0.2;
        
        this.isActive = false;
    }

    preUpdate(): void {    
    }

    onUpdate(): void {
    }

    postUpdate(): void {
    }
    
}