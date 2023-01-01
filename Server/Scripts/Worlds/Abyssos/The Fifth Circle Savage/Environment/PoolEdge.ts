import { Entity } from "@core/Base/Entity";
import { ScriptSystem } from "@core/Systems/ScriptSystem";
import { TextureAlignment, TextureSquareDrawable } from "@scripts/Comon/Basic/Drawing/TextureSquareDrawable";
import { DrawingLayers } from "./DrawingLayers";

export class PoolEdge extends ScriptSystem.Component {
    private static WholePoolEdgeAssetPath = "Pool Edge.png"
    private static WholePoolEdgeSize = Float32Array.from([910, 0, 641]);
    private static WholePoolEdgeLayer = DrawingLayers.PoolEdge;

    private static BottomPoolEdgeAssetPath = "Pool Edge Bottom.png"
    private static BottomPoolEdgeSize = Float32Array.from([910, 0, 320]);
    private static BottomPoolEdgeLayer = DrawingLayers.PoolEdgeBottom;
    
    private poolEdgeWhole: TextureSquareDrawable;
    private poolEdgeBottom: TextureSquareDrawable;

    constructor(parent: Entity, environmentScale: Float32Array) {
        const entity = parent.world.createEntity();
        super(entity);
        
        this.poolEdgeWhole = new TextureSquareDrawable(this.ownerEntity, PoolEdge.WholePoolEdgeAssetPath);
        this.poolEdgeWhole.transform.scale(PoolEdge.WholePoolEdgeSize).scale(environmentScale);
        this.poolEdgeWhole.layer = PoolEdge.WholePoolEdgeLayer;
        this.poolEdgeWhole.billboard = true;

        this.poolEdgeBottom = new TextureSquareDrawable(this.ownerEntity, PoolEdge.BottomPoolEdgeAssetPath);
        this.poolEdgeBottom.alignment = TextureAlignment.Top;
        this.poolEdgeBottom.transform.scale(PoolEdge.BottomPoolEdgeSize);
        this.poolEdgeBottom.transform.scale(environmentScale);
        this.poolEdgeBottom.layer = PoolEdge.BottomPoolEdgeLayer;
        this.poolEdgeBottom.billboard = true;
        
        this.isActive = false;
    }

    preUpdate(): void {
    }
    onUpdate(): void {
    }
    postUpdate(): void {
    }
    
}