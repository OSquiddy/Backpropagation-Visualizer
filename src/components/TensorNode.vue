<script setup lang="ts">
import { Handle, Position, useVueFlow, type Edge } from '@vue-flow/core'
import { computed, watch } from 'vue'
import { useTensorDataStore } from '@/stores/tensorDataStore'
import { storeToRefs } from 'pinia'
import type { TensorValue } from '@/stores/tensorDataStore'
import type { LayerPayload } from '@/stores/tensorDataStore'
import { ltx } from '@/utils/LaTeXFormatter'

const props = defineProps<{
  id: string
}>()

const { getConnectedEdges, findNode } = useVueFlow()
const tensorValuesStore = useTensorDataStore()
const { layers, basicPerceptronGraphData } = storeToRefs(tensorValuesStore)
const { addLayerData } = tensorValuesStore

const children = computed(() => {
  return getConnectedEdges(props.id).filter((edge) => edge.source === props.id)
})

const parents = computed(() => {
  return getConnectedEdges(props.id).filter((edge) => edge.target === props.id)
})

const currentNode = computed(() => {
  return basicPerceptronGraphData.value.nodes.find((node) => node.id === props.id)
})

const incomingValue = computed(() => {
  switch (currentNode.value!.data.type) {
    case 'sum':
      return getConnectedEdges(props.id).filter((edge) => edge.target === props.id).reduce((acc: number, edge: Edge) => {
        return acc + (findNode(edge.source)?.data.value ?? 0)
      }, 0) as number
    default:
      return null
  }
})

const layerType = computed(() => {
  const type = currentNode.value!.data.type
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
  const type = currentNode.value!.data.type
  switch (type) {
    case 'input':
      return 'inputs'
    case 'weight':
      return 'weights'
    case 'bias':
      return 'biases'
    default:
      return type
  }
})

let layerDataPayload: LayerPayload | undefined = undefined

if (layerType.value !== 'data') {
  layerDataPayload = {
    id: currentNode.value!.data.layer_id,
    type: layerType.value as 'activation' | 'operation' | 'loss' | 'data',
    prev: currentNode.value!.data.layer_id - 1,
    next: currentNode.value!.data.layer_id + 1,
    data: {
      id: props.id,
      type: currentNode.value!.data.type,
      incomingValue: incomingValue.value,
      value: currentNode.value!.data.value,
      outgoingValue: null,
      gradient: null,
      parents: parents.value.map((edge) => edge.source),
      children: children.value.map((edge) => edge.target),
      label: currentNode.value!.data.label,
    } as TensorValue
  }
} else {
  layerDataPayload = {
    id: currentNode.value!.data.layer_id,
    type: layerType.value,
    prev: currentNode.value!.data.layer_id - 1,
    next: currentNode.value!.data.layer_id + 1,
  }
  const subType = layerSubType.value as 'inputs' | 'weights' | 'biases'
  layerDataPayload[subType] = {
    id: props.id,
    type: currentNode.value!.data.type,
    incomingValue: incomingValue.value,
    value: currentNode.value!.data.value,
    outgoingValue: null,
    gradient: null,
    parents: parents.value.map((edge) => edge.source),
    children: children.value.map((edge) => edge.target),
    label: currentNode.value!.data.label,
  } as TensorValue
}

addLayerData(layerDataPayload)

// watch(layers, (newVal) => {
//   console.log('Layers updated:', newVal)
// }, { deep: true })

const formattedLabel = computed(() => {
  return ltx(currentNode.value!.data.label)
})

</script>

<template>
  <div class="tensor-node" :class="[currentNode!.data.type]">
    <span class="label" v-html="formattedLabel"></span>
    <span class="value">{{ currentNode!.data.value }}</span>
    <Handle v-if="currentNode!.targetPosition" type="target" :position="currentNode!.targetPosition" />
    <Handle v-if="currentNode!.sourcePosition" type="source" :position="currentNode!.sourcePosition" />
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
