import { Entity } from "@core/Base/Entity";
import { ScriptSystem } from "@core/Systems/ScriptSystem";
import { TextureSquareDrawable } from "@scripts/Comon/Basic/Drawing/TextureSquareDrawable";
import { DrawingLayers } from "./DrawingLayers";

export class Mesh extends ScriptSystem.Component {
    private static AssetPath = "Mesh.png"
    private static Size = Float32Array.from([152, 0.0, 135]);
    private static Scale = Float32Array.from([0.01, 0.01, 0.01]);
    private static Translation = Float32Array.from([3.5, 0.0, 1.7]);
    private static Layer = DrawingLayers.PoolDebris;

    private drawable: TextureSquareDrawable;

    constructor(owner: Entity) {
        super(owner);

        this.drawable = new TextureSquareDrawable(this.ownerEntity, Mesh.AssetPath);
        this.drawable.transform.scale(Mesh.Size).scale(Mesh.Scale);
        this.drawable.transform.move(Mesh.Translation)
        this.drawable.layer = Mesh.Layer;
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