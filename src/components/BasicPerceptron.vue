<script setup lang="ts">
import { ref, nextTick } from 'vue'
import type { Node, Edge } from '@vue-flow/core'
import { VueFlow, Position, useVueFlow } from '@vue-flow/core'
import TensorNode from './TensorNode.vue'
import katex from 'katex'
import { useLayout } from '@/utils/useLayout'

const initialPosition = { x: 0, y: 0 }

const ltx = (expression: string) => katex.renderToString(expression, { throwOnError: false, output: 'mathml' })


const nodes = ref<Node[]>([
  {
    id: '1a',
    type: 'tensor',
    position: initialPosition,
    sourcePosition: Position.Right,
    data: { type: 'input', label: ltx('x_1'), value: 2 },
  },
  {
    id: '1b',
    type: 'tensor',
    position: initialPosition,
    sourcePosition: Position.Right,
    data: { type: 'input', label: ltx('x_2'), value: 1 },
  },
  {
    id: '1c',
    type: 'tensor',
    position: initialPosition,
    sourcePosition: Position.Right,
    data: { type: 'input', label: ltx('x_3'), value: 4 },
  },

  {
    id: '2a',
    type: 'tensor',
    position: initialPosition,
    sourcePosition: Position.Right,
    targetPosition: Position.Left,
    data: { type: 'weight', label: ltx('w_1'), value: 1 },
  },
  {
    id: '2b',
    type: 'tensor',
    position: initialPosition,
    sourcePosition: Position.Right,
    targetPosition: Position.Left,
    data: { type: 'weight', label: ltx('w_2'), value:-2 },
  },
  {
    id: '2c',
    type: 'tensor',
    position: initialPosition,
    sourcePosition: Position.Right,
    targetPosition: Position.Left,
    data: { type: 'weight', label: ltx('w_3'), value: 3 },
  },

  {
    id: '3',
    type: 'tensor',
    position: initialPosition,
    targetPosition: Position.Left,
    sourcePosition: Position.Right,
    data: { type: 'sum', label: ltx('\\sum') },
  }
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
  },
  {
    id: '2b->3',
    source: '2b',
    target: '3',
  },
  {
    id: '2c->3',
    source: '2c',
    target: '3',
  },
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
    <VueFlow :nodes="nodes" :edges="edges" @nodes-initialized="layoutGraph">
      <template #node-tensor="props">
        <TensorNode :id="props.id" :data="props.data" :sourcePosition="props.sourcePosition" :targetPosition="props.targetPosition" />
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
  height: 350px;
  background-color: white;
}
</style>
