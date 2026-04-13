import { ref, shallowRef } from 'vue'
import { defineStore } from 'pinia'
import type { Node, Edge } from '@vue-flow/core'
import { useVueFlow } from '@vue-flow/core'
import type { Layer, LayerPayload } from '@/types/Layer.type'

import type {
  Tensor,
  ValueTypeTensors,
  OperationTypeTensors,
  LossTypeTensors,
  ActivationTypeTensors,
} from '@/types/Tensor.type'

export const useTensorDataStore = defineStore('tensorData', () => {
  const basicPerceptronGraphData = shallowRef<{ nodes: Node[]; edges: Edge[] }>({
    nodes: [],
    edges: [],
  })

  // const perceptronStateHistory = ref<History>([])

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

  const tensorValuesMap = ref<Record<string, Tensor>>({})

  function addTensorNodeIdIfNotExists(payload: string) {
    if (!tensorValuesMap.value[payload]) {
      tensorValuesMap.value[payload] = {} as Tensor
    }
  }

  function calculateIncomingValue(flowId: string, nodeId: string): number {
    const vf = useVueFlow({ id: flowId })
    const node = vf.findNode(nodeId)
    const parents = vf.getConnectedEdges(nodeId).filter((edge) => edge.target === nodeId)
    if (node?.data.type === 'sum') {
      return parents.reduce((acc, curr) => acc + (vf.findNode(curr.source)?.data.value ?? 0), 0)
    }
    if (node?.data.type === 'add') {
      return parents.reduce((acc, curr) => acc + (vf.findNode(curr.source)?.data.value ?? 0), 0)
    }
    if (node?.data.type === 'subtract') {
      return parents.reduce((acc, curr) => acc - (vf.findNode(curr.source)?.data.value ?? 0), 0)
    }
    if (node?.data.type === 'multiply') {
      return parents.reduce((acc, curr) => acc * (vf.findNode(curr.source)?.data.value ?? 0), 0)
    }
    if (node?.data.type === 'divide') {
      return parents.reduce((acc, curr) => acc / (vf.findNode(curr.source)?.data.value ?? 0), 0)
    }
    return 0
  }

  function calculateOutgoingValue(flowId: string, nodeId: string): number {
    const vf = useVueFlow({ id: flowId })
    const node = vf.findNode(nodeId)
    const children = vf.getConnectedEdges(nodeId).filter((edge) => edge.target === nodeId)
    if (node?.data.type === 'add') {
      return children.reduce((acc, curr) => acc + (vf.findNode(curr.source)?.data.value ?? 0), 0)
    }
    return 0
  }

  function initializeTensorValues(flowId: string): void {
    const vf = useVueFlow({ id: flowId })
    for (const node of basicPerceptronGraphData.value.nodes) {
      const children = vf.getConnectedEdges(node.id).filter((edge) => edge.source === node.id)
      const parents = vf.getConnectedEdges(node.id).filter((edge) => edge.target === node.id)
      const incomingValue = 0
      const outgoingValue = 0
      const value = node.data.value
      const type = node.data.type
      const label = node.data.label
      const gradient = 0
      const layerId = node.data.layer_id

      const baseTensorValue = {
        id: node.id,
        type: node.data.type,
        parents: parents.map((edge) => edge.source),
        children: children.map((edge) => edge.target),
        label: node.data.label,
        layerId: node.data.layer_id,
      }

      let tensorValue: Tensor | null = null
      if (type === 'input' || type === 'weight' || type === 'bias') {
        const obj = {
          ...baseTensorValue,
          incomingValue: incomingValue,
          value: value,
          outgoingValue: outgoingValue,
          gradient: gradient,
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
          incomingValue: [] as number[],
          outgoingValue: outgoingValue,
          gradient: gradient,
        }
        tensorValue = obj as OperationTypeTensors
      } else {
        const obj = {
          ...baseTensorValue,
          incomingValue: incomingValue,
          outgoingValue: outgoingValue,
          gradient: gradient,
        } as LossTypeTensors
        tensorValue = obj as LossTypeTensors
      }

      if (tensorValue) {
        updateOrAddTensorValue(tensorValue)
      }
    }
  }

  function updateOrAddTensorValue(payload: Tensor) {
    tensorValuesMap.value[payload.id] = payload
  }

  const layers = ref<Record<number, Layer>>({})
  function addLayerData(payload: LayerPayload) {
    // const { id, type, prev, next } = payload
    // if (layers.value[id]) {
    //   if (type === 'data') {
    //     const { inputs, weights, biases } = payload
    //     const layer: DataTypeLayer = layers.value[id] as DataTypeLayer
    //     if (inputs && inputs.id) layer.inputs[inputs.id] = inputs as Tensor
    //     if (weights && weights.id) layer.weights[weights.id] = weights as Tensor
    //     if (biases && biases.id) layer.biases[biases.id] = biases as Tensor
    //   } else {
    //     const { data } = payload
    //     const layer: OperationTypeLayer = layers.value[id] as OperationTypeLayer
    //     layer.data[data!.id] = data!
    //   }
    // } else {
    //   if (type === 'data') {
    //     const { inputs, weights, biases } = payload
    //     const layer: DataTypeLayer = {
    //       id: id,
    //       type: type,
    //       prev: prev,
    //       next: next,
    //       inputs: {} as Record<string, Tensor>,
    //       weights: {} as Record<string, Tensor>,
    //       biases: {} as Record<string, Tensor>,
    //     }
    //     if (inputs && inputs.id) layer.inputs[inputs.id] = inputs as Tensor
    //     if (weights && weights.id) layer.weights[weights.id] = weights as Tensor
    //     if (biases && biases.id) layer.biases[biases.id] = biases as Tensor
    //     layers.value[id] = layer
    //   } else {
    //     const { data } = payload
    //     const layer: OperationTypeLayer = {
    //       id: id,
    //       type: type,
    //       prev: prev,
    //       next: next,
    //       data: {} as Record<string, Tensor>,
    //     }
    //     layer.data[data!.id] = data!
    //     layers.value[id] = layer
    //   }
    // }
  }

  function getNumberOfLayers() {
    return Object.keys(layers.value).length
  }

  const perceptronLayerMap = ref<Record<number, PerceptronLayer>>({})

  type PerceptronLayer = {
    tensorIds: Set<string>
    type: 'data' | 'operation' | 'activation' | 'loss'
    prev: number | null
    next: number | null
  }

  function addLayerToPerceptronLayerMap(layerId: number, payload: PerceptronLayer) {
    if (!perceptronLayerMap.value[layerId]) {
      perceptronLayerMap.value[layerId] = {
        tensorIds: new Set<string>(),
        type: payload.type,
        prev: payload.prev,
        next: payload.next,
      }
    }
    for (const tensorId of payload.tensorIds) {
      perceptronLayerMap.value[layerId].tensorIds.add(tensorId)
    }
  }

  function updatePerceptronLayerMap(layerId: number, payload: string | string[]): void {
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

  function forwardPass(layerId: number): void {}

  // function calculateLayerValues(layerId: number): void {
  //   const layer = layers.value[layerId]
  //   if (!layer) return

  //   // console.log(layer)
  //   if (layer.type === 'data') {
  //     layer as DataTypeLayer
  //     const { inputs, weights, biases } = layer

  //     if (Object.keys(inputs).length > 0) {
  //       for (const input of Object.values(inputs) as ValueTypeTensors[]) {
  //         layer.inputs[input.id]!.outgoingValue = input.value

  //         // Calculate incoming values for weight tensors that are children of this input tensor
  //         const children = input.children
  //         for (const child of children) {
  //           const childNode = layer.weights[child] as ValueTypeTensors
  //           if (childNode) {
  //             childNode.incomingValue = input.value
  //             childNode.outgoingValue = input.value * childNode.value
  //           }
  //         }
  //       }
  //     }
  //   } else {
  //     layer as OperationTypeLayer
  //     const { data } = layer

  //     if (Object.keys(data).length > 0) {
  //       // Calculate incoming values for operation tensors
  //       if (layer.type === 'operation') {
  //         type OperationTypeTensors = Extract<
  //           Tensor,
  //           { type: 'add' | 'subtract' | 'multiply' | 'divide' | 'dot' | 'matmul' | 'sum' }
  //         >
  //         for (const operation of Object.values(data) as OperationTypeTensors[]) {
  //           const op = layer.data[operation.id]! as OperationTypeTensors
  //           op.incomingValue = [] as number[]

  //           const parents = op.parents
  //           for (const parent of parents) {
  //             const parentLayer = layers.value[layer.prev!] as DataTypeLayer
  //             if (parentLayer) {
  //               const parentNode = parentLayer.weights[parent] as ValueTypeTensors
  //               if (parentNode) {
  //                 op.incomingValue.push(parentNode.outgoingValue!)
  //               }
  //             }
  //           }

  //           // Calculate outgoing values for operation tensors
  //           if (op.type === 'add' || op.type === 'sum') {
  //             op.outgoingValue = op.incomingValue.reduce((acc, curr) => acc + curr, 0)
  //           } else if (op.type === 'subtract') {
  //             op.outgoingValue = op.incomingValue.reduce((acc, curr) => acc - curr, 0)
  //           } else if (op.type === 'multiply') {
  //             op.outgoingValue = op.incomingValue.reduce((acc, curr) => acc * curr, 0)
  //           } else if (op.type === 'divide') {
  //             op.outgoingValue = op.incomingValue.reduce((acc, curr) => acc / curr, 0)
  //           }
  //         }
  //       }

  //       if (layer.type === 'activation') {
  //         // Calculate incoming values for activation tensors
  //         type ActivationTypeTensors = Extract<
  //           Tensor,
  //           { type: 'relu' | 'sigmoid' | 'tanh' | 'softmax' | 'linear' }
  //         >
  //         for (const activation of Object.values(layer.data) as ActivationTypeTensors[]) {
  //           const activationNode = layer.data[activation.id]! as ActivationTypeTensors
  //           activationNode.incomingValue = 0

  //           const parents = activationNode.parents
  //           for (const parent of parents) {
  //             const parentLayer = layers.value[layer.prev!] as Layer
  //             if (parentLayer.type === 'data') {
  //               const parentNode = parentLayer.weights[parent] as ValueTypeTensors
  //               if (parentNode) {
  //                 activationNode.incomingValue += parentNode.outgoingValue!
  //               }
  //             } else {
  //               const parentNode = parentLayer.data[parent] as OperationTypeTensors
  //               if (parentNode) {
  //                 activationNode.incomingValue += parentNode.outgoingValue!
  //               }
  //             }
  //           }
  //         }
  //       }
  //     }
  //   }

  //   // console.log('Updated layer:', layer)
  // }

  function $reset() {}

  return {
    $reset,
    layers,
    addLayerData,
    getNumberOfLayers,
    // calculateLayerValues,
    tensorValuesMap,
    initializeTensorValues,
    updateOrAddTensorValue,
    addTensorNodeIdIfNotExists,
    basicPerceptronGraphData,
    initializeBasicPerceptronGraphData,
    updateBasicPerceptronGraphData,
    perceptronLayerMap,
    addLayerToPerceptronLayerMap,
    updatePerceptronLayerMap,
  }
})
