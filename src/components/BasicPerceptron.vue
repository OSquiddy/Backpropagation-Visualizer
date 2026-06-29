<script setup lang="ts">
import { nextTick, onUpdated, shallowRef } from 'vue'
import { VueFlow, useVueFlow } from '@vue-flow/core'
import TensorNode from './TensorNode.vue'
import { useLayout } from '@/utils/useLayout'
import CustomEdge from './CustomEdge.vue'
import { useTensorDataStore } from '@/stores/tensorDataStore'
import { initialNodes, initialEdges } from '@/utils/BasicPerceptronGraphData'
import { storeToRefs } from 'pinia'
import { useVisualizer } from '@/utils/useVisualizer'
import VisualizerControls from './VisualizerControls.vue'

const tensorDataStore = useTensorDataStore()
const { initializeBasicPerceptronGraphData, updateBasicPerceptronGraphData, initializeTensorValues, initializePerceptronLayerMap } = tensorDataStore
const { basicPerceptronGraphData } = storeToRefs(tensorDataStore)

const flowId = 'basic-perceptron'
const { layout } = useLayout(flowId)
const { fitView } = useVueFlow(flowId)
const visualizer = useVisualizer(flowId)


initializeBasicPerceptronGraphData(initialNodes, initialEdges)

function layoutGraph() {
  const nodes = shallowRef(layout(initialNodes, initialEdges))
  updateBasicPerceptronGraphData(nodes.value, initialEdges)
  initializeTensorValues(flowId)
  initializePerceptronLayerMap()
  nextTick(() => {
    fitView()
  })
}

onUpdated(() => {
  visualizer.play(1)
})
</script>

<template>
  <div class="basic-perceptron-container">
    <VisualizerControls />
    <VueFlow :id="flowId" :nodes="basicPerceptronGraphData.nodes" :edges="basicPerceptronGraphData.edges"
      @nodes-initialized="layoutGraph" :default-edge-options="{ type: 'custom', animated: false, }" fit-view-on-init>
      <template #node-tensor="node">
        <TensorNode :id="node.id" :source-position="node.sourcePosition" :target-position="node.targetPosition" :data="node.data" />
      </template>
      <template #edge-custom="customEdgeProps">
        <CustomEdge v-bind="customEdgeProps" />
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
  border: 1px solid #ccc;
  position: relative;
}
</style>
