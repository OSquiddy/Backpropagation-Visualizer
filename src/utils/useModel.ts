import { useTensorDataStore } from '@/stores/tensorDataStore'
import { storeToRefs } from 'pinia'
import type { History } from '@/types/History.type'

const tensorDataStore = useTensorDataStore()
const { perceptronLayerMap } = storeToRefs(tensorDataStore)

export function useModel(id?: string) {

  function forwardPass(layerId: number): History {
    return {
      step: 0,
      type: 'forward',
      updatedTensors: [],
      all: [],
    }
  }

  function backward(layerId: number): History {
    return {
      step: 0,
      type: 'backward',
      updatedTensors: [],
      all: [],
    }
  }

  return {
    forwardPass,
    backward,
  }
}
