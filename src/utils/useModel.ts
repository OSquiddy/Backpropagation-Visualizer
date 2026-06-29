import { useTensorDataStore } from '@/stores/tensorDataStore'
import { storeToRefs } from 'pinia'
import type { History } from '@/types/History.type'
import type { TensorType } from '@/types/Tensor.type'
import * as ModelUtils from '@/utils/ModelUtils'


export function useModel(id?: string) {

  const tensorDataStore = useTensorDataStore()
  const { perceptronLayerMap, tensorValuesMap } = storeToRefs(tensorDataStore)

  // Forward pass is used to calculate the output of a layer.
  function forwardPass(layerId: number): History | undefined {
    console.log('forwardPass', layerId)

    const layer = perceptronLayerMap.value[layerId]
    if (!layer) {
      console.error(`Layer ${layerId} not found in perceptronLayerMap`)
      return
    }

    const updatedTensors = []
    const all = []

    for (const tensorId of layer.tensorIds) {
      const tensor = tensorValuesMap.value[tensorId]
      if (!tensor) {
        console.error(`Tensor ${tensorId} not found in tensorValuesMap`)
        continue
      }

      /**
       * If layer is of type 'data', it will have inputs, weights, and biases. Process inputs first, then weights, then biases.
       */

      if (tensor.type === 'input' || tensor.type === 'bias' || tensor.type === 'ground-truth') {
        tensor.outgoingValue = ModelUtils.calculateOutgoingValue(tensor)
      } else {
        tensor.incomingValue = ModelUtils.calculateIncomingValue(tensor)
        tensor.outgoingValue = ModelUtils.calculateOutgoingValue(tensor)

        if (tensor.type !== 'weight') {
          updatedTensors.push(tensor)
        }
      }

      all.push(tensor)



    }

    return {
      step: layerId,
      type: 'forward',
      updatedTensors: updatedTensors,
      all: all,
    }
  }

  function backward(layerId: number): History | undefined {
    const all = []

    const layer = perceptronLayerMap.value[layerId]
    if (!layer) {
      console.error(`Layer ${layerId} not found in perceptronLayerMap`)
      return
    }

    for (const tensorId of [...layer.tensorIds].reverse()) {
      const tensor = tensorValuesMap.value[tensorId]
      if (!tensor) {
        console.error(`Tensor ${tensorId} not found in tensorValuesMap`)
        continue
      }

      // if (tensor.type === 'ground-truth') {
      //   continue
      // }

      tensor.gradient = ModelUtils.calculateGradient(tensor)
      // console.log('Tensor', tensor, 'gradient', tensor.gradient)

      all.push(tensor)
    }

    return {
      step: layerId,
      type: 'backward',
      updatedTensors: all,
      all: all,
    }
  }

  return {
    forwardPass,
    backward,
  }
}
