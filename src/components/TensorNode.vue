<script setup lang="ts">
import { Handle, Position } from '@vue-flow/core'
import { computed } from 'vue'
import { useTensorDataStore } from '@/stores/tensorDataStore'
import { storeToRefs } from 'pinia'
import type { OperationTypeTensors, LossTypeTensors, ActivationTypeTensors, ValueTypeTensors } from '@/types/Tensor.type'
import type { LayerPayload } from '@/types/Layer.type'
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


const layerType = computed(() => {
  const type = currentNode.value!.type
  if (type == 'cross_entropy' || type == 'mean_squared_error' || type == 'mean_absolute_error') {
    return 'loss'
  }
  if (type == 'relu' || type == 'sigmoid' || type == 'tanh' || type == 'softmax' || type == 'linear') {
    return 'activation'
  }
  if (type == 'add' || type == 'subtract' || type == 'multiply' || type == 'divide' || type == 'dot' || type == 'matmul' || type == 'sum') {
    return 'operation'
  }
  if (type == 'input' || type == 'weight' || type == 'bias') {
    return 'data'
  }
  return type
})

const layerSubType = computed(() => {
  const type = currentNode.value!.type
  switch (type) {
    case 'input':
      return 'inputs'
    case 'weight':
      return 'weights'
    case 'bias':
      return 'biases'
    case 'loss_output':
      return 'loss_output'
    default:
      return type
  }
})

let layerDataPayload: LayerPayload | undefined = undefined
const node = currentNode.value

layerDataPayload = {
  id: node!.layerId,
  type: layerType.value,
  prev: node!.layerId - 1,
  next: node!.layerId + 1,
}

const commonTensorData = {
  id: props.id,
  type: node!.type,
  incomingValue: node!.incomingValue,
  parents: node!.parents,
  children: node!.children,
  label: node!.label,
  layerId: node!.layerId,
}

if (layerType.value === 'data') {
  const subType = layerSubType.value as 'inputs' | 'weights' | 'biases'
  layerDataPayload[subType] = {
    ...commonTensorData,
    value: (node as ValueTypeTensors).value,
    outgoingValue: 0,
    gradient: 0,
  } as ValueTypeTensors
} else {
  layerDataPayload.data = {
    ...commonTensorData,
    outgoingValue: 0,
    gradient: 0,
  } as OperationTypeTensors | LossTypeTensors | ActivationTypeTensors
}


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
