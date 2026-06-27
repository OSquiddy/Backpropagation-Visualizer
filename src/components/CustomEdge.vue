<script lang="ts" setup>
import { computed, onUpdated } from 'vue'
import { type EdgeProps, BaseEdge, EdgeLabelRenderer, getBezierPath } from '@vue-flow/core'
import { useTensorDataStore } from '@/stores/tensorDataStore'
import { storeToRefs } from 'pinia'
import { ltx } from '@/utils/LaTeXFormatter'

const tensorDataStore = useTensorDataStore()
const { tensorValuesMap } = storeToRefs(tensorDataStore)



const props = defineProps<Partial<EdgeProps>>()
const path = computed(() => getBezierPath(props as EdgeProps))

const edgeLabel = computed(() => {
  const edgeString = props.source && tensorValuesMap.value[props.source]?.outgoingValue ? props.data.label ? `${props.data.label} =  ${(tensorValuesMap.value[props.source]?.outgoingValue as number).toFixed(1)}` : props.data.label : ''
  return edgeString ? ltx(edgeString) : ''
})


</script>

<script lang="ts">
export default {
  inheritAttrs: false,
}
</script>

<template>
  <BaseEdge v-bind="props as EdgeProps" :path="path[0]" class="reverse-animation">
  </BaseEdge>

  <EdgeLabelRenderer>
    <div :style="{
      display: 'inline-block',
      cursor: 'auto',
      pointerEvents: 'all',
      position: 'absolute',
      transform: `translate(-50%, -50%) translate(${path[1]}px,${path[2]}px)`,
    }" class="nodrag nopan custom-edge-label-backdrop">
      <div class="custom-edge-label" v-html="edgeLabel"></div>
    </div>
  </EdgeLabelRenderer>
</template>

<style scoped>
@import 'katex/dist/katex.min.css';

:deep(.reverse-animation) path {
  /* stroke: green; */
  animation: reverse-flow 0.5s linear infinite !important;
}

@keyframes reverse-flow {
  0% {
    stroke-dashoffset: -10;
  }

  100% {
    stroke-dashoffset: 10;
  }
}

.custom-edge-label {
  background-color: var(--vf-node-bg);
}
</style>
