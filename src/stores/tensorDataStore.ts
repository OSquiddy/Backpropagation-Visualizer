import { ref, shallowRef } from 'vue'
import { defineStore } from 'pinia'
import type { Node, Edge } from '@vue-flow/core'
import { useVueFlow } from '@vue-flow/core'

export type TensorValue =
  | {
      id: string
      type: 'input' | 'weight' | 'bias'
      incomingValue: number | null
      outgoingValue: number | null
      value: number
      parents: string[]
      children: string[]
      gradient: number | null | undefined
      label: string
      layerId: number
    }
  | {
      id: string
      incomingValue: number
      outgoingValue: number
      type: 'relu' | 'sigmoid' | 'tanh' | 'softmax' | 'linear'
      parents: string[]
      children: string[]
      gradient: number | number[]
      label: string
      layerId: number
    }
  | {
      id: string
      incomingValue: number[] | number
      outgoingValue: number
      type: 'add' | 'subtract' | 'multiply' | 'divide' | 'dot' | 'matmul' | 'sum'
      parents: string[]
      children: string[]
      gradient: number | number[]
      label: string
      layerId: number
    }
  | {
      id: string
      incomingValue: number[] | number
      outgoingValue: number[] | number
      type: 'cross_entropy' | 'mean_squared_error' | 'mean_absolute_error'
      parents: string[]
      children: string[]
      gradient: number | number[]
      label: string
      layerId: number
    }

export type ValueTypeTensors = Extract<TensorValue, { type: 'input' | 'weight' | 'bias' }>
export type LossTypeTensors = Extract<
  TensorValue,
  { type: 'cross_entropy' | 'mean_squared_error' | 'mean_absolute_error' }
>
export type OperationTypeTensors = Extract<
  TensorValue,
  { type: 'add' | 'subtract' | 'multiply' | 'divide' | 'dot' | 'matmul' | 'sum' }
>
export type ActivationTypeTensors = Extract<
  TensorValue,
  { type: 'relu' | 'sigmoid' | 'tanh' | 'softmax' | 'linear' }
>

type Layer =
  | {
      id: number
      type: 'data'
      prev: number | null
      next: number | null
      inputs: Record<string, TensorValue>
      weights: Record<string, TensorValue>
      biases: Record<string, TensorValue>
    }
  | {
      id: number
      type: 'activation' | 'operation' | 'loss'
      prev: number | null
      next: number | null
      data: Record<string, TensorValue>
    }

type DataTypeLayer = Extract<Layer, { type: 'data' }>
type OperationTypeLayer = Extract<Layer, { type: 'operation' | 'loss' | 'activation' }>

export type LayerPayload = {
  id: number
  type: 'data' | 'activation' | 'operation' | 'loss'
  prev: number | null
  next: number | null
  inputs?: TensorValue
  weights?: TensorValue
  biases?: TensorValue
  data?: TensorValue
}

export const useTensorDataStore = defineStore('tensorData', () => {
  const basicPerceptronGraphData = shallowRef<{ nodes: Node[]; edges: Edge[] }>({
    nodes: [],
    edges: [],
  })

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

  const tensorValuesMap = ref<Record<string, TensorValue>>({})

  function addTensorNodeIdIfNotExists(payload: string) {
    if (!tensorValuesMap.value[payload]) {
      tensorValuesMap.value[payload] = {} as TensorValue
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

      let tensorValue: TensorValue | null = null
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

  function updateOrAddTensorValue(payload: TensorValue) {
    tensorValuesMap.value[payload.id] = payload
  }

  const layers = ref<Record<number, Layer>>({})
  function addLayerData(payload: LayerPayload) {
    const { id, type, prev, next } = payload
    if (layers.value[id]) {
      if (type === 'data') {
        const { inputs, weights, biases } = payload
        const layer: DataTypeLayer = layers.value[id] as DataTypeLayer
        if (inputs && inputs.id) layer.inputs[inputs.id] = inputs as TensorValue
        if (weights && weights.id) layer.weights[weights.id] = weights as TensorValue
        if (biases && biases.id) layer.biases[biases.id] = biases as TensorValue
      } else {
        const { data } = payload
        const layer: OperationTypeLayer = layers.value[id] as OperationTypeLayer
        layer.data[data!.id] = data!
      }
    } else {
      if (type === 'data') {
        const { inputs, weights, biases } = payload
        const layer: DataTypeLayer = {
          id: id,
          type: type,
          prev: prev,
          next: next,
          inputs: {} as Record<string, TensorValue>,
          weights: {} as Record<string, TensorValue>,
          biases: {} as Record<string, TensorValue>,
        }
        if (inputs && inputs.id) layer.inputs[inputs.id] = inputs as TensorValue
        if (weights && weights.id) layer.weights[weights.id] = weights as TensorValue
        if (biases && biases.id) layer.biases[biases.id] = biases as TensorValue
        layers.value[id] = layer
      } else {
        const { data } = payload
        const layer: OperationTypeLayer = {
          id: id,
          type: type,
          prev: prev,
          next: next,
          data: {} as Record<string, TensorValue>,
        }
        layer.data[data!.id] = data!
        layers.value[id] = layer
      }
    }
  }

  function $reset() {}

  function getNumberOfLayers() {
    return Object.keys(layers.value).length
  }

  function calculateLayerValues(layerId: number): void {
    const layer = layers.value[layerId]
    if (!layer) return

    // console.log(layer)
    if (layer.type === 'data') {
      layer as DataTypeLayer
      const { inputs, weights, biases } = layer

      if (Object.keys(inputs).length > 0) {
        for (const input of Object.values(inputs) as ValueTypeTensors[]) {
          layer.inputs[input.id]!.outgoingValue = input.value

          // Calculate incoming values for weight tensors that are children of this input tensor
          const children = input.children
          for (const child of children) {
            const childNode = layer.weights[child] as ValueTypeTensors
            if (childNode) {
              childNode.incomingValue = input.value
              childNode.outgoingValue = input.value * childNode.value
            }
          }
        }
      }
    } else {
      layer as OperationTypeLayer
      const { data } = layer

      if (Object.keys(data).length > 0) {
        // Calculate incoming values for operation tensors
        if (layer.type === 'operation') {
          type OperationTypeTensors = Extract<
            TensorValue,
            { type: 'add' | 'subtract' | 'multiply' | 'divide' | 'dot' | 'matmul' | 'sum' }
          >
          for (const operation of Object.values(data) as OperationTypeTensors[]) {
            const op = layer.data[operation.id]! as OperationTypeTensors
            op.incomingValue = [] as number[]

            const parents = op.parents
            for (const parent of parents) {
              const parentLayer = layers.value[layer.prev!] as DataTypeLayer
              if (parentLayer) {
                const parentNode = parentLayer.weights[parent] as ValueTypeTensors
                if (parentNode) {
                  op.incomingValue.push(parentNode.outgoingValue!)
                }
              }
            }

            // Calculate outgoing values for operation tensors
            if (op.type === 'add' || op.type === 'sum') {
              op.outgoingValue = op.incomingValue.reduce((acc, curr) => acc + curr, 0)
            } else if (op.type === 'subtract') {
              op.outgoingValue = op.incomingValue.reduce((acc, curr) => acc - curr, 0)
            } else if (op.type === 'multiply') {
              op.outgoingValue = op.incomingValue.reduce((acc, curr) => acc * curr, 0)
            } else if (op.type === 'divide') {
              op.outgoingValue = op.incomingValue.reduce((acc, curr) => acc / curr, 0)
            }
          }
        }

        if (layer.type === 'activation') {
          // Calculate incoming values for activation tensors
          type ActivationTypeTensors = Extract<
            TensorValue,
            { type: 'relu' | 'sigmoid' | 'tanh' | 'softmax' | 'linear' }
          >
          for (const activation of Object.values(layer.data) as ActivationTypeTensors[]) {
            const activationNode = layer.data[activation.id]! as ActivationTypeTensors
            activationNode.incomingValue = 0

            const parents = activationNode.parents
            for (const parent of parents) {
              const parentLayer = layers.value[layer.prev!] as Layer
              if (parentLayer.type === 'data') {
                const parentNode = parentLayer.weights[parent] as ValueTypeTensors
                if (parentNode) {
                  activationNode.incomingValue += parentNode.outgoingValue!
                }
              } else {
                const parentNode = parentLayer.data[parent] as OperationTypeTensors
                if (parentNode) {
                  activationNode.incomingValue += parentNode.outgoingValue!
                }
              }
            }
          }
        }
      }
    }

    // console.log('Updated layer:', layer)
  }

  return {
    $reset,
    layers,
    addLayerData,
    getNumberOfLayers,
    calculateLayerValues,
    tensorValuesMap,
    initializeTensorValues,
    updateOrAddTensorValue,
    addTensorNodeIdIfNotExists,
    basicPerceptronGraphData,
    initializeBasicPerceptronGraphData,
    updateBasicPerceptronGraphData,
  }
})
