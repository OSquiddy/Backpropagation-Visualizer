<script setup lang="ts">
import { Handle, Position } from '@vue-flow/core'
import { computed } from 'vue'
import { useTensorDataStore } from '@/stores/tensorDataStore'
import { storeToRefs } from 'pinia'
import type { ValueTypeTensors } from '@/types/Tensor.type'
import { ltx } from '@/utils/LaTeXFormatter'

const props = defineProps<{
  id: string,
  sourcePosition: Position | undefined
  targetPosition: Position | undefined
  data: any
}>()

const tensorValuesStore = useTensorDataStore()
const { tensorValuesMap } = storeToRefs(tensorValuesStore)

const currentNode = computed(() => {
  return tensorValuesMap.value[props.id]
})

const formattedLabel = computed(() => {
  if (currentNode.value!.label) {
    return ltx(currentNode.value!.label)
  }
  return ''
})
</script>

<template>
  <div class="tensor-node" :class="[currentNode!.type]">
    <span class="label" v-html="formattedLabel"></span>
    <span class="value">{{ (currentNode! as ValueTypeTensors).value }}</span>
    <Handle v-for="handle in data.handles" :key="handle.id" :id="handle.id" :type="handle.type" :position="handle.position" />
    <Handle v-if="targetPosition" type="target" :position="targetPosition" />
    <Handle v-if="sourcePosition" type="source" :position="sourcePosition" />
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

.tensor-node.loss_output {
  border: none;
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
