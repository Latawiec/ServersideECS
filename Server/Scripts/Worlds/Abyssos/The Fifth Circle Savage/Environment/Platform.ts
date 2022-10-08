import { Entity } from "@core/Base/Entity";
import { ScriptSystem } from "@core/Systems/ScriptSystem";
import { TextureSquareDrawable } from "@scripts/Comon/Basic/Drawing/TextureSquareDrawable";
import { DrawingLayers } from "./DrawingLayers";


export class Platform extends ScriptSystem.Component {
    private static PlatformAssetPath = "The Fifth Circle Savage/Platform.png"
    private static PlatformScale = 7.21;
    private static PlatformLayer = DrawingLayers.Platform;

    private drawable: TextureSquareDrawable;

    constructor(owner: Entity) {
        super(owner);
        
        this.drawable = new TextureSquareDrawable(this.ownerEntity, Platform.PlatformAssetPath);
        this.drawable.transform.scale([Platform.PlatformScale, Platform.PlatformScale, Platform.PlatformScale]);
        this.drawable.layer = Platform.PlatformLayer;
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