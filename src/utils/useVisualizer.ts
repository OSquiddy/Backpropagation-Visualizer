import type { History } from '@/types/History.type'
import { useTensorDataStore } from '@/stores/tensorDataStore'
import { storeToRefs } from 'pinia'
import { useModel } from '@/utils/useModel'

const tensorDataStore = useTensorDataStore()
const { perceptronLayerMap, perceptronStateHistory, tensorValuesMap } = storeToRefs(tensorDataStore)
const { addToPerceptronStateHistory, resetPerceptronStateHistory } = tensorDataStore

export function useVisualizer(id: string) {

  const model = useModel(id)

  function play(layerId: number): void {
    for (let i = layerId; i < Object.keys(perceptronLayerMap.value).length; i++) {
      const history: History = model.forwardPass(i)
      addToPerceptronStateHistory(history)
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
