<script setup lang="ts">
import { ref, nextTick, computed, watch } from 'vue'
import type { Node, Edge } from '@vue-flow/core'
import { VueFlow, Position, useVueFlow } from '@vue-flow/core'
import TensorNode from './TensorNode.vue'
import katex from 'katex'
import { useLayout } from '@/utils/useLayout'
import CustomEdge from './CustomEdge.vue'
import { useTensorDataStore } from '@/stores/tensorDataStore'

const tensorDataStore = useTensorDataStore()
const { getNumberOfLayers, calculateLayerValues } = tensorDataStore

const initialPosition = { x: 0, y: 0 }

const ltx = (expression: string) => katex.renderToString(expression, { throwOnError: false, output: 'mathml' })

const numberOfLayers = computed(() => getNumberOfLayers())
console.log(numberOfLayers.value)

watch(numberOfLayers, (newVal: number) => {
  for (let i = 1; i <= newVal; i++) {
    calculateLayerValues(i)
  }
})

const nodes = ref<Node[]>([
  {
    id: '1a',
    type: 'tensor',
    position: initialPosition,
    sourcePosition: Position.Right,
    data: { type: 'input', label: ltx('x_1'), value: 2, layer_id: 1 },
  },
  {
    id: '1b',
    type: 'tensor',
    position: initialPosition,
    sourcePosition: Position.Right,
    data: { type: 'input', label: ltx('x_2'), value: 1, layer_id: 1 },
  },
  {
    id: '1c',
    type: 'tensor',
    position: initialPosition,
    sourcePosition: Position.Right,
    data: { type: 'input', label: ltx('x_3'), value: 4, layer_id: 1 },
  },

  {
    id: '2a',
    type: 'tensor',
    position: initialPosition,
    sourcePosition: Position.Right,
    targetPosition: Position.Left,
    data: { type: 'weight', label: ltx('w_1'), value: 1, layer_id: 1 },
  },
  {
    id: '2b',
    type: 'tensor',
    position: initialPosition,
    sourcePosition: Position.Right,
    targetPosition: Position.Left,
    data: { type: 'weight', label: ltx('w_2'), value:-2, layer_id: 1 },
  },
  {
    id: '2c',
    type: 'tensor',
    position: initialPosition,
    sourcePosition: Position.Right,
    targetPosition: Position.Left,
    data: { type: 'weight', label: ltx('w_3'), value: 3, layer_id: 1 },
  },
  {
    id: '3',
    type: 'tensor',
    position: initialPosition,
    targetPosition: Position.Left,
    sourcePosition: Position.Right,
    data: { type: 'sum', label: ltx('\\sum'), layer_id: 2 },
  },
  {
    id: '4',
    type: 'tensor',
    position: initialPosition,
    targetPosition: Position.Left,
    sourcePosition: Position.Right,
    data: { type: 'sigmoid', label: ltx('\\sigma'), layer_id: 3 },
  },
  {
    id: '5',
    type: 'tensor',
    position: initialPosition,
    targetPosition: Position.Left,
    sourcePosition: Position.Right,
    data: { type: 'loss', label: ltx('L'), layer_id: 4 },
  },
])

const edges = ref<Edge[]>([
  {
    id: '1a->2a',
    source: '1a',
    target: '2a',
  },
  {
    id: '1b->2b',
    source: '1b',
    target: '2b',
  },
  {
    id: '1c->2c',
    source: '1c',
    target: '2c',
  },
  {
    id: '2a->3',
    source: '2a',
    target: '3',
    data: {
      katexLabel: ltx('w_1x_1'),
    }
  },
  {
    id: '2b->3',
    source: '2b',
    target: '3',
    data: {
      katexLabel: ltx('w_2x_2'),
    }
  },
  {
    id: '2c->3',
    source: '2c',
    target: '3',
    data: {
      katexLabel: ltx('w_3x_3'),
    }
  },
  {
    id: '3->4',
    source: '3',
    target: '4',
    data: {
      katexLabel: ltx('z'),
    }
  },
  {
    id: '4->5',
    source: '4',
    target: '5',
    data: {
      katexLabel: ltx('a'),
    }
  }
])

const { layout } = useLayout()
const { fitView } = useVueFlow()

function layoutGraph() {
  nodes.value = layout(nodes.value, edges.value)
  nextTick(() => {
    fitView()
  })
}
</script>

<template>
  <div class="basic-perceptron-container">
    <VueFlow
      :nodes="nodes"
      :edges="edges"
      @nodes-initialized="layoutGraph"
      :default-edge-options="{ type: 'custom', animated: true, }"
      fit-view-on-init
    >
      <template #node-tensor="props">
        <TensorNode :id="props.id" :data="props.data" :sourcePosition="props.sourcePosition" :targetPosition="props.targetPosition" />
      </template>
      <template #edge-custom="customEdgeProps">
        <CustomEdge
          v-bind="customEdgeProps"
        />
      </template>
    </VueFlow>
  </div>
</template>

<style scoped>
@import 'katex/dist/katex.min.css';
.basic-perceptron-container {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 400px;
  background-color: white;
}
</style>
