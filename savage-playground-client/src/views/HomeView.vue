<template>
  <div class="home">
    <img alt="Vue logo" src="../assets/logo.png">
    <HelloWorld msg="Welcome to Your Vue.js + TypeScript App"/>
    <GameCanvas assets-package-path="" game-host-address="localhost:8000"/>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import HelloWorld from '@/components/HelloWorld.vue'; // @ is an alias to /src
import GameCanvas from '@/components/GameCanvas/GameCanvas.vue';

export default defineComponent({
  name: 'HomeView',
  components: {
    HelloWorld,
    GameCanvas
},
});
</script>
