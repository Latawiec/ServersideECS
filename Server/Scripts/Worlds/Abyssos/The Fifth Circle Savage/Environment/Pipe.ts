import { Entity } from "@core/Base/Entity";
import { ScriptSystem } from "@core/Systems/ScriptSystem";
import { TextureSquareDrawable } from "@scripts/Comon/Basic/Drawing/TextureSquareDrawable";
import { DrawingLayers } from "./DrawingLayers";

export class Pipe extends ScriptSystem.Component {
    private static AssetPath = "Pipe.png"
    private static Size = Float32Array.from([160, 0.0, 149]);
    private static Scale = Float32Array.from([0.01, 0.01, 0.01]);
    private static Translation = Float32Array.from([3.3, 0.0, 3.4]);
    private static Layer = DrawingLayers.Pipe;

    private drawable: TextureSquareDrawable;

    constructor(owner: Entity) {
        super(owner);

        this.drawable = new TextureSquareDrawable(this.ownerEntity, Pipe.AssetPath);
        this.drawable.transform.scale(Pipe.Size).scale(Pipe.Scale);
        this.drawable.transform.move(Pipe.Translation)
        this.drawable.layer = Pipe.Layer;
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