import { ref, shallowRef } from 'vue'
import { defineStore } from 'pinia'
import type { Node, Edge } from '@vue-flow/core'
import { useVueFlow } from '@vue-flow/core'
import type { PerceptronLayer } from '@/types/Layer.type'
import type { History } from '@/types/History.type'
import type {
  ValueTypeTensors,
  OperationTypeTensors,
  LossTypeTensors,
  ActivationTypeTensors,
  BaseTensorType,
  TensorType,
} from '@/types/Tensor.type'

export const useTensorDataStore = defineStore('tensorData', () => {
  const basicPerceptronGraphData = shallowRef<{ nodes: Node[]; edges: Edge[] }>({
    nodes: [],
    edges: [],
  })

  const perceptronStateHistory = ref<History[]>([])

  function addToPerceptronStateHistory(history: History) {
    perceptronStateHistory.value.push(history)
  }

  function resetPerceptronStateHistory() {
    perceptronStateHistory.value = [] as History[]
  }

  function initializeBasicPerceptronGraphData(nodes: Node[], edges: Edge[]) {
    basicPerceptronGraphData.value = { nodes, edges }
    for (const node of nodes) {
      addTensorNodeIdIfNotExists(node.id)
    }
  }

  function updateBasicPerceptronGraphData(nodes: Node[], edges: Edge[]) {
    basicPerceptronGraphData.value = {
      nodes: nodes ?? basicPerceptronGraphData.value.nodes,
      edges: edges ?? basicPerceptronGraphData.value.edges,
    }
  }

  const tensorValuesMap = ref<Record<string, TensorType>>({})

  function addTensorNodeIdIfNotExists(payload: string) {
    if (!tensorValuesMap.value[payload]) {
      tensorValuesMap.value[payload] = {} as TensorType
    }
  }

  function initializeTensorValues(flowId: string): void {
    const vf = useVueFlow(flowId)
    for (const node of basicPerceptronGraphData.value.nodes) {
      const children = vf.getConnectedEdges(node.id).filter((edge) => edge.source === node.id)
      const parents = vf.getConnectedEdges(node.id).filter((edge) => edge.target === node.id)
      const incomingValue = 0
      const outgoingValue = 0
      const value = node.data.value
      const type = node.data.type
      const label = node.data.label
      const gradient = 0
      const incomingGradient = 0
      const localGradient = 0
      const layerId = node.data.layer_id

      const baseTensorValue = {
        id: node.id,
        type: node.data.type,
        parents: parents.map((edge) => {
          return { id: edge.source, type: edge.sourceNode.data.type }
        }),
        children: children.map((edge) => {
          return { id: edge.target, type: edge.targetNode.data.type }
        }),
        label: node.data.label,
        layerId: node.data.layer_id,
      }

      let tensorValue: BaseTensorType | null = null
      if (type === 'input' || type === 'weight' || type === 'bias') {
        const obj = {
          ...baseTensorValue,
          incomingValue: incomingValue,
          value: value,
          outgoingValue: outgoingValue,
          gradient: gradient,
          incomingGradient: incomingGradient,
          localGradient: localGradient,
        }
        tensorValue = obj as ValueTypeTensors
      } else if (
        type === 'relu' ||
        type === 'sigmoid' ||
        type === 'tanh' ||
        type === 'softmax' ||
        type === 'linear'
      ) {
        const obj = {
          ...baseTensorValue,
          incomingValue: incomingValue,
          outgoingValue: outgoingValue,
          gradient: gradient,
          incomingGradient: incomingGradient,
          localGradient: localGradient,
        } as ActivationTypeTensors
        tensorValue = obj as ActivationTypeTensors
      } else if (
        type === 'add' ||
        type === 'subtract' ||
        type === 'multiply' ||
        type === 'divide' ||
        type === 'dot' ||
        type === 'matmul' ||
        type === 'sum'
      ) {
        const obj = {
          ...baseTensorValue,
          incomingValue: [],
          outgoingValue: outgoingValue,
          gradient: gradient,
          incomingGradient: incomingGradient,
          localGradient: localGradient,
        } as OperationTypeTensors
        tensorValue = obj as OperationTypeTensors
      } else {
        const obj = {
          ...baseTensorValue,
          incomingValue: incomingValue,
          outgoingValue: outgoingValue,
          gradient: gradient,
          incomingGradient: incomingGradient,
          localGradient: localGradient,
        } as LossTypeTensors
        tensorValue = obj as LossTypeTensors
      }

      if (tensorValue) {
        updateOrAddTensorValue(tensorValue)
      }
    }
  }

  function updateOrAddTensorValue(payload: TensorType) {
    tensorValuesMap.value[payload.id] = payload
  }

  const perceptronLayerMap = ref<Record<number, PerceptronLayer>>({})

  function initializePerceptronLayerMap() {
    for (const tensor of Object.values(tensorValuesMap.value)) {
      let layerType
      if (
        tensor.type === 'input' ||
        tensor.type === 'weight' ||
        tensor.type === 'bias' ||
        tensor.type === 'ground-truth'
      ) {
        layerType = 'data'
      } else if (
        tensor.type === 'relu' ||
        tensor.type === 'sigmoid' ||
        tensor.type === 'tanh' ||
        tensor.type === 'softmax' ||
        tensor.type === 'linear'
      ) {
        layerType = 'activation'
      } else if (
        tensor.type === 'add' ||
        tensor.type === 'subtract' ||
        tensor.type === 'multiply' ||
        tensor.type === 'divide' ||
        tensor.type === 'dot' ||
        tensor.type === 'matmul' ||
        tensor.type === 'sum'
      ) {
        layerType = 'operation'
      } else if (
        tensor.type === 'cross_entropy' ||
        tensor.type === 'mean_squared_error' ||
        tensor.type === 'mean_absolute_error' ||
        tensor.type === 'binary_cross_entropy'
      ) {
        layerType = 'loss'
      }

      addLayerToPerceptronLayerMap(tensor.layerId, {
        type: layerType as 'data' | 'activation' | 'operation' | 'loss',
        prev: tensor.layerId > 0 ? tensor.layerId - 1 : null,
        next: tensor.layerId + 1,
      })

      addToOrUpdatePerceptronLayerMap(tensor.layerId, tensor.id)
    }
  }

  function addLayerToPerceptronLayerMap(
    layerId: number,
    payload: Omit<PerceptronLayer, 'tensorIds'>,
  ) {
    if (!perceptronLayerMap.value[layerId]) {
      perceptronLayerMap.value[layerId] = {
        tensorIds: new Set<string>(),
        type: payload.type,
        prev: payload.prev,
        next: payload.next,
      }
    }
  }

  function addToOrUpdatePerceptronLayerMap(layerId: number, payload: string | string[]): void {
    if (!perceptronLayerMap.value[layerId]) {
      console.error(`Layer ${layerId} not found in perceptronLayerMap`)
      return
    }

    if (
      payload === 'data' ||
      payload === 'operation' ||
      payload === 'activation' ||
      payload === 'loss'
    ) {
      perceptronLayerMap.value[layerId].type = payload
      return
    }

    if (Array.isArray(payload)) {
      for (const tensorId of payload) {
        perceptronLayerMap.value[layerId].tensorIds.add(tensorId)
      }
    } else {
      perceptronLayerMap.value[layerId].tensorIds.add(payload)
    }
  }

  function $reset() {}

  return {
    $reset,
    tensorValuesMap,
    initializeTensorValues,
    updateOrAddTensorValue,
    addTensorNodeIdIfNotExists,
    basicPerceptronGraphData,
    initializeBasicPerceptronGraphData,
    updateBasicPerceptronGraphData,
    perceptronLayerMap,
    initializePerceptronLayerMap,
    addLayerToPerceptronLayerMap,
    addToOrUpdatePerceptronLayerMap,
    perceptronStateHistory,
    resetPerceptronStateHistory,
    addToPerceptronStateHistory,
  }
})
