import { Entity } from "@core/Base/Entity";
import { ScriptSystem } from "@core/Systems/ScriptSystem";
import { TextureSquareDrawable } from "@scripts/Comon/Basic/Drawing/TextureSquareDrawable";
import { DrawingLayers } from "./DrawingLayers";

export class Mesh extends ScriptSystem.Component {
    private static AssetPath = "Mesh.png"
    private static Size = Float32Array.from([152, 0.0, 135]);
    private static Translation = Float32Array.from([21.5, 0.0, 12]);
    private static Layer = DrawingLayers.PoolDebris;

    private drawable: TextureSquareDrawable;

    constructor(parent: Entity, environmentScale: Float32Array) {
        const entity = parent.world.createEntity();
        super(entity);

        this.drawable = new TextureSquareDrawable(this.ownerEntity, Mesh.AssetPath);
        this.drawable.transform.scale(Mesh.Size).scale(environmentScale);
        this.drawable.layer = Mesh.Layer;
        this.drawable.billboard = true;
        
        entity.transform.move(Mesh.Translation)

        this.isActive = false;
    }

    preUpdate(): void {    
    }

    onUpdate(): void {
    }

    postUpdate(): void {
    }
}