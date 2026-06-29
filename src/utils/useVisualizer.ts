import type { History } from '@/types/History.type'
import { useTensorDataStore } from '@/stores/tensorDataStore'
import { storeToRefs } from 'pinia'
import { useModel } from '@/utils/useModel'


export function useVisualizer(id: string) {
  const tensorDataStore = useTensorDataStore()
  const { perceptronLayerMap, perceptronStateHistory, tensorValuesMap } = storeToRefs(tensorDataStore)
  const { addToPerceptronStateHistory, resetPerceptronStateHistory } = tensorDataStore

  const model = useModel(id)

  function play(layerId: number): void {
    resetPerceptronStateHistory()
    const baseState = {
      step: 0,
      type: 'base',
      updatedTensors: [],
      all: [],
    } as History
    addToPerceptronStateHistory(baseState)
    for (let i = layerId; i < Object.keys(perceptronLayerMap.value).length; i++) {
      const history: History | undefined = model.forwardPass(i)
      if (history) {
        addToPerceptronStateHistory(history)
      }
    }
    const numLayers = Object.keys(perceptronLayerMap.value).length
    for (let i = numLayers - 1; i > 0; i--) {
      const history: History | undefined = model.backward(i)
      if (history) {
        addToPerceptronStateHistory(history)
      }
    }
  }

  function pause(layerId: number): void {}

  function restart(): void {
    resetPerceptronStateHistory()
    play(0)
  }

  function stepForward(): void {}
  function stepBackward(): void {}

  return {
    play,
    pause,
    restart,
    stepForward,
    stepBackward,
  }
}
