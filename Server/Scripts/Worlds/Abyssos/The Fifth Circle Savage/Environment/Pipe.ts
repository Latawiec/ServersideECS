import { Entity } from "@core/Base/Entity";
import { ScriptSystem } from "@core/Systems/ScriptSystem";
import { TextureSquareDrawable } from "@scripts/Comon/Basic/Drawing/TextureSquareDrawable";
import { DrawingLayers } from "./DrawingLayers";

export class Pipe extends ScriptSystem.Component {
    private static AssetPath = "Pipe.png"
    private static Size = Float32Array.from([160, 0.0, 149]);
    private static Translation = Float32Array.from([21, 0.0, 28]);
    private static Layer = DrawingLayers.Pipe;

    private drawable: TextureSquareDrawable;

    constructor(parent: Entity, environmentScale: Float32Array) {
        const entity = parent.world.createEntity();
        super(entity);

        this.drawable = new TextureSquareDrawable(this.ownerEntity, Pipe.AssetPath);
        this.drawable.transform.scale(Pipe.Size).scale(environmentScale);
        this.drawable.layer = Pipe.Layer;
        this.drawable.billboard = true;

        entity.transform.move(Pipe.Translation);

        this.isActive = false;
    }

    preUpdate(): void {    
    }

    onUpdate(): void {
    }

    postUpdate(): void {
    }
}