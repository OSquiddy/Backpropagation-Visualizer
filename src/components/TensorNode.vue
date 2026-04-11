<script setup lang="ts">
import { Handle, Position, useVueFlow } from '@vue-flow/core'
// import type { TensorNode } from '@/types/TensorNode.type'
// import type { PropType } from 'vue'

const props = defineProps<{
  id: string
  data: { label: string; value?: number; type: string }
  sourcePosition?: Position
  targetPosition?: Position
}>()

// const { updateNodeData, getConnectedEdges } = useVueFlow()
</script>

<template>
  <div class="tensor-node" :class="[props.data.type]">
    <span class="label" v-html="props.data.label"></span>
    <span class="value">{{ props.data.value }}</span>
    <Handle v-if="props.targetPosition" type="target" :position="props.targetPosition" />
    <Handle v-if="props.sourcePosition" type="source" :position="props.sourcePosition" />
  </div>
</template>

<style scoped>
.tensor-node {
  display: flex;
  width: 50px;
  border: 1px solid black;
  border-radius: 50%;
  height: 50px;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  .label {
    margin-bottom: 2px;
  }
}

.tensor-node.input {
  border-color: blue;
}

.tensor-node.weight {
  border-color: green;
}

.tensor-node.sum {
  border-color: red;
}
</style>
