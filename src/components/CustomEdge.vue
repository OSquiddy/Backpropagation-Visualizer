<script lang="ts" setup>
import { computed } from 'vue'
import { type EdgeProps, BaseEdge, EdgeLabelRenderer, getBezierPath } from '@vue-flow/core'

const props = defineProps<Partial<EdgeProps>>()

const path = computed(() => getBezierPath(props as EdgeProps))
</script>

<script lang="ts">
export default {
  inheritAttrs: false,
}
</script>

<template>
  <BaseEdge v-bind="props as EdgeProps" :path="path[0]">
  </BaseEdge>

  <EdgeLabelRenderer>
    <div
      :style="{
        display: 'inline-block',
        cursor: 'auto',
        pointerEvents: 'all',
        position: 'absolute',
        transform: `translate(-50%, -50%) translate(${path[1]}px,${path[2]}px)`,
      }"
      class="nodrag nopan custom-edge-label-backdrop"
    >
      <div class="custom-edge-label" v-html="props.data.katexLabel"></div>
    </div>
  </EdgeLabelRenderer>
</template>

<style scoped>
@import 'katex/dist/katex.min.css';

.custom-edge-label {
  background-color: var(--vf-node-bg);
}
</style>
