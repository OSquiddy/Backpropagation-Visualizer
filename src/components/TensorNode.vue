<script setup lang="ts">
import { Handle, Position, useVueFlow, type Edge, type Node } from '@vue-flow/core'
import { computed, onMounted, ref } from 'vue'
import { useTensorDataStore } from '@/stores/tensorDataStore'
import { storeToRefs } from 'pinia'
import type { LayerKeys, TensorValue } from '@/stores/tensorDataStore'

const props = defineProps<{
  id: string
  data: { label: string; type: string; value?: number; layer_id: number }
  sourcePosition?: Position
  targetPosition?: Position
}>()

const { getConnectedEdges, findNode } = useVueFlow()
const tensorValuesStore = useTensorDataStore()
const { tensorValuesMap, layers } = storeToRefs(tensorValuesStore)
const { addTensorValue, addLayerData } = tensorValuesStore

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

const layerSubType = computed(() => {
  const type = props.data.type
  if (type == 'cross_entropy' || type == 'mean_squared_error' || type == 'mean_absolute_error') {
    return 'loss'
  }
  if (type == 'relu' || type == 'sigmoid' || type == 'tanh' || type == 'softmax' || type == 'linear') {
    return 'activations'
  }
  if (type == 'add' || type == 'subtract' || type == 'multiply' || type == 'divide' || type == 'dot' || type == 'matmul') {
    return 'operations'
  }
  if (type == 'input' || type == 'weight' || type == 'bias') {
    return type + 's'
  }
  return type
})

addLayerData(props.data.layer_id, {
  type: layerSubType.value as LayerKeys,
  data: {
    id: props.id,
    type: props.data.type,
    incomingValue: incomingValue.value,
    value: props.data.value,
    outgoingValue: null,
    gradient: null,
    parents: [],
    children: [],
  } as TensorValue
})

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
