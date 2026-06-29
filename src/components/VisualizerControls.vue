<script setup lang="ts">
import { useInjectedVisualizer } from '@/utils/useVisualizer'

const visualizer = useInjectedVisualizer()

function play() {
  visualizer.play(1)
}

function pause() {
  visualizer.pause(1)
}

function restart() {
  visualizer.restart()
}

function stepForward() {
  visualizer.stepForward()
}

function stepBackward() {
  visualizer.stepBackward()
}
</script>

<template>
  <div class="visualizer-controls">
    <button @click="play">
      <i class="pi pi-play"></i>
    </button>
    <button @click="pause">
      <i class="pi pi-pause"></i>
    </button>
    <button @click="restart">
      <i class="pi pi-refresh"></i>
    </button>
    <button @click="stepForward">
      <i class="pi pi-step-forward"></i>
    </button>
    <button @click="stepBackward">
      <i class="pi pi-step-backward"></i>
    </button>
  </div>
</template>

<style scoped>
.visualizer-controls {
  display: flex;
  flex-direction: row;
  gap: 10px;
  position: absolute;
  top: 0;
  right: 0;
  z-index: 1000;
  padding: 10px;
}

button {
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
  cursor: pointer;
}

</style>
