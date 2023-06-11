<template>
    <canvas id="gameCanvas" ref="gameCanvas"></canvas>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { AssetStorage } from './Assets/AssetStorage';
import { CommitedResourceStorage } from './Assets/Commited/CommitedResourceStorage'

class GameCanvasHandle {
    private canvas: HTMLCanvasElement;
    private gl: WebGLRenderingContext;

    private assetStorage: AssetStorage;
    private commitedResourceStorage: CommitedResourceStorage;

    constructor(gameCanvas: HTMLCanvasElement, assetPackagePath: string) {
        this.canvas = gameCanvas;
        this.gl = gameCanvas.getContext('webgl',
            {
                alpha: false
            }
        )!;
        
        const gl = this.gl;
        gl.enable(gl.DEPTH_TEST);
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

        this.assetStorage = new AssetStorage();
        this.commitedResourceStorage = new CommitedResourceStorage(gl, this.assetStorage);

        this.assetStorage.downloadPackage(assetPackagePath);
    }
}

export default defineComponent({
    name: 'GameCanvas',
    data() {
        return {
            _private: {
                canvasHandle: {} as GameCanvasHandle
            }
        };
    },
    props: {
        assetsPackagePath: {
            type: String,
            required: true
        },
        gameHostAddress: {
            type: String,
            required: true
        }
    },
    mounted() {
        const assetPackagePath = this.$props.assetsPackagePath;

        this.$data._private.canvasHandle = new GameCanvasHandle(this.$refs.gameCanvas as HTMLCanvasElement, assetPackagePath);
    }
});

</script>

<style scoped>
#gameCanvas {
    width: 1200px;
    height: 1200px;
}
</style>