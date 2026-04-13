<script setup lang="ts">
import { ref, nextTick, computed, watch } from 'vue'
import type { Node, Edge } from '@vue-flow/core'
import { VueFlow, useVueFlow } from '@vue-flow/core'
import TensorNode from './TensorNode.vue'
import { useLayout } from '@/utils/useLayout'
import CustomEdge from './CustomEdge.vue'
import { useTensorDataStore } from '@/stores/tensorDataStore'
import { initialNodes, initialEdges } from '@/utils/BasicPerceptronGraphData'
const tensorDataStore = useTensorDataStore()
const { getNumberOfLayers, calculateLayerValues } = tensorDataStore

const numberOfLayers = computed(() => getNumberOfLayers())

watch(numberOfLayers, (newVal: number) => {
  for (let i = 1; i <= newVal; i++) {
    calculateLayerValues(i)
  }
})

const nodes = ref<Node[]>(initialNodes)
const edges = ref<Edge[]>(initialEdges)

const { layout } = useLayout()
const { fitView } = useVueFlow()

function layoutGraph() {
  nodes.value = layout(initialNodes, initialEdges)
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
