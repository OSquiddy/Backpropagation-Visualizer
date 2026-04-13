<script setup lang="ts">
import { nextTick, shallowRef } from 'vue'
import { VueFlow, useVueFlow } from '@vue-flow/core'
import TensorNode from './TensorNode.vue'
import { useLayout } from '@/utils/useLayout'
import CustomEdge from './CustomEdge.vue'
import { useTensorDataStore } from '@/stores/tensorDataStore'
import { initialNodes, initialEdges } from '@/utils/BasicPerceptronGraphData'
import { storeToRefs } from 'pinia'

const tensorDataStore = useTensorDataStore()
const { initializeBasicPerceptronGraphData, updateBasicPerceptronGraphData, initializeTensorValues } = tensorDataStore
const { basicPerceptronGraphData } = storeToRefs(tensorDataStore)

const flowId = 'basic-perceptron'
const { layout } = useLayout(flowId)
const { fitView } = useVueFlow({ id: flowId })


initializeBasicPerceptronGraphData(initialNodes, initialEdges)

function layoutGraph() {
  const nodes = shallowRef(layout(initialNodes, initialEdges))
  updateBasicPerceptronGraphData(nodes.value, initialEdges)
  initializeTensorValues(flowId)
  nextTick(() => {
    fitView()
  })
}
</script>

<template>
  <div class="basic-perceptron-container">
    <VueFlow :id="flowId" :nodes="basicPerceptronGraphData.nodes" :edges="basicPerceptronGraphData.edges"
      @nodes-initialized="layoutGraph" :default-edge-options="{ type: 'custom', animated: true, }" fit-view-on-init>
      <template #node-tensor="node">
        <TensorNode :id="node.id" :source-position="node.sourcePosition" :target-position="node.targetPosition" />
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
}
</style>
