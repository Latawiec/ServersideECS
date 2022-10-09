import { Entity } from "@core/Base/Entity";
import { ScriptSystem } from "@core/Systems/ScriptSystem";
import { TextureSquareDrawable } from "@scripts/Comon/Basic/Drawing/TextureSquareDrawable";
import { DrawingLayers } from "./DrawingLayers";


export class Platform extends ScriptSystem.Component {
    private static AssetPath = "Platform.png"
    private static Size = Float32Array.from([537, 0.0, 400]);
    private static Scale = Float32Array.from([0.01, 0.01, 0.01]);
    private static Layer = DrawingLayers.Platform;

    private drawable: TextureSquareDrawable;

    constructor(owner: Entity) {
        super(owner);
        
        this.drawable = new TextureSquareDrawable(this.ownerEntity, Platform.AssetPath);
        this.drawable.transform.scale(Platform.Size).scale(Platform.Scale);
        this.drawable.layer = Platform.Layer;
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