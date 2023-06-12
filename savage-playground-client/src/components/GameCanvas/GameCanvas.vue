<template>
    <canvas id="gameCanvas" ref="gameCanvas"></canvas>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { GameRuntime } from './GameRuntime';

export default defineComponent({
    name: 'GameCanvas',
    data() {
        return {
            _private: {
                runtime: {} as GameRuntime
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
        const gameHostAddress = this.$props.gameHostAddress;

        this.$data._private.runtime = new GameRuntime(this.$refs.gameCanvas as HTMLCanvasElement, assetPackagePath, gameHostAddress);
        this.$data._private.runtime.initialize();
    }
});

</script>

<style scoped>
#gameCanvas {
    width: 1200px;
    height: 1200px;
}
</style>