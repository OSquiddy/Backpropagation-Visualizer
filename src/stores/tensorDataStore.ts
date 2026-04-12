import { ref } from 'vue'
import { defineStore } from 'pinia'

// type TensorValue = {
//   id: string
//   type: string | 'input' | 'weight' | 'sum' | 'sigmoid' | 'loss'
//   incomingValue: number | null
//   outgoingValue: number | null
//   value?: number | null
//   gradient: number | null
//   parents: string[]
//   children: string[]
// }

export type TensorValue =
  | { id: string, type: 'input' | 'weight' | 'bias', incomingValue: number | null, outgoingValue: number | null, value: number, parents: string[], children: string[], gradient: number | null | undefined }
 | { id: string, incomingValue?: number | null | undefined, outgoingValue?: number | null | undefined, type: 'relu' | 'sigmoid' | 'tanh' | 'softmax' | 'linear', parents: string[], children: string[], gradient: number | null | undefined }
  | { id: string, incomingValue?: number | null | undefined, outgoingValue?: number | null | undefined, type: 'add' | 'subtract' | 'multiply' | 'divide' | 'dot' | 'matmul', parents: string[], children: string[], gradient: number | null | undefined }


type Layer = {
  id: number
  inputs?: Record<string, TensorValue>
  weights?: Record<string, TensorValue>
  biases?: Record<string, TensorValue>
  activations?: Record<string, TensorValue>
  operations?: Record<string, TensorValue>
}

export type LayerKeys = 'inputs' | 'weights' | 'biases' | 'activations' | 'operations'

type LayerPayload = {
  type: LayerKeys
  data: TensorValue
}

export const useTensorDataStore = defineStore('tensorData', () => {
  const tensorValuesMap = ref<Record<string, TensorValue>>({})

  function addTensorValue(tensorValue: TensorValue) {
    tensorValuesMap.value[tensorValue.id] = tensorValue
  }

  const layers = ref<Record<number, Layer>>({})
  function addLayerData(layerId: number, payload: LayerPayload) {
    let layer = layers.value[layerId]
    if (!layer) {
      layer = {
        id: layerId,
        inputs: {} as Record<string, TensorValue>,
        weights: {} as Record<string, TensorValue>,
        biases: {} as Record<string, TensorValue>,
        activations: {} as Record<string, TensorValue>,
        operations: {} as Record<string, TensorValue>,
      }
      layers.value[layerId] = layer
    }

    const bucketKey = payload.type
    if (!layer[bucketKey]) {
      layer[bucketKey] = {} as Record<string, TensorValue>
    }
    layer[bucketKey]![payload.data.id] = payload.data
  }

  function $reset() {}

  function getNumberOfLayers() {
    return Object.keys(layers.value).length
  }

  function calculateLayerValues(layerId: number) : void {
    const layer = layers.value[layerId]
    if (!layer) return

    console.log(layer)

    // for (let input of Object.values(layer.inputs)) {
    //   input ={
    //     ...input,
    //     outgoingValue: input.value,
    //   }
    // }
  }

  return { tensorValuesMap, $reset, addTensorValue, addLayerData, layers, getNumberOfLayers, calculateLayerValues }
})
