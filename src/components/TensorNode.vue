<script setup lang="ts">
import { Handle, Position, useVueFlow, type Edge } from '@vue-flow/core'
import { computed } from 'vue'
import { useTensorDataStore } from '@/stores/tensorDataStore'
// import { storeToRefs } from 'pinia'
import type { TensorValue } from '@/stores/tensorDataStore'
import type { LayerPayload } from '@/stores/tensorDataStore'

const props = defineProps<{
  id: string
  data: { label: string; type: string; value?: number; layer_id: number }
  sourcePosition?: Position
  targetPosition?: Position
}>()

const { getConnectedEdges, findNode } = useVueFlow()
const tensorValuesStore = useTensorDataStore()
// const { tensorValuesMap, layers } = storeToRefs(tensorValuesStore)
const { addLayerData } = tensorValuesStore

const children = computed(() => {
  return getConnectedEdges(props.id).filter((edge) => edge.source === props.id)
})

const parents = computed(() => {
  return getConnectedEdges(props.id).filter((edge) => edge.target === props.id)
})

const incomingValue = computed(() => {
  switch (props.data.type) {
    case 'sum':
      return getConnectedEdges(props.id).filter((edge) => edge.target === props.id).reduce((acc: number, edge: Edge) => {
        return acc + (findNode(edge.source)?.data.value ?? 0)
      }, 0) as number
    default:
      return null
  }
})

const layerType = computed(() => {
  const type = props.data.type
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
  const type = props.data.type
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
    id: props.data.layer_id,
    type: layerType.value as 'activation' | 'operation' | 'loss' | 'data',
    prev: props.data.layer_id - 1,
    next: props.data.layer_id + 1,
    data: {
      id: props.id,
      type: props.data.type,
      incomingValue: incomingValue.value,
      value: props.data.value,
      outgoingValue: null,
      gradient: null,
      parents: parents.value.map((edge) => edge.source),
      children: children.value.map((edge) => edge.target),
    } as TensorValue
  }
} else {
  layerDataPayload = {
    id: props.data.layer_id,
    type: layerType.value,
    prev: props.data.layer_id - 1,
    next: props.data.layer_id + 1,
  }
  const subType = layerSubType.value as 'inputs' | 'weights' | 'biases'
  layerDataPayload[subType] = {
    id: props.id,
    type: props.data.type,
    incomingValue: incomingValue.value,
    value: props.data.value,
    outgoingValue: null,
    gradient: null,
    parents: parents.value.map((edge) => edge.source),
    children: children.value.map((edge) => edge.target),
  } as TensorValue
}

addLayerData(layerDataPayload)

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
