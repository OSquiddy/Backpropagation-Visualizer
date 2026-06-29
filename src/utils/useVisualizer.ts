import type { History } from '@/types/History.type'
import { useTensorDataStore } from '@/stores/tensorDataStore'
import { storeToRefs } from 'pinia'
import { useModel } from '@/utils/useModel'
import { useVueFlow } from '@vue-flow/core'
import { inject, type InjectionKey } from 'vue'

export type VisualizerApi = ReturnType<typeof useVisualizer>
export const visualizerKey: InjectionKey<VisualizerApi> = Symbol('visualizer')

export function useVisualizer(id: string) {
  const tensorDataStore = useTensorDataStore()
  const { perceptronLayerMap, perceptronStateHistory, tensorValuesMap } = storeToRefs(tensorDataStore)
  const { addToPerceptronStateHistory, resetPerceptronStateHistory } = tensorDataStore
  const { updateEdgeData, getEdges } = useVueFlow(id)
  const edgeAnimationTimeouts = new Map<string, number>()
  let playbackRunId = 0

  const model = useModel(id)
  const delay = (ms: number) => new Promise<void>((resolve) => window.setTimeout(resolve, ms))

  async function play(layerId: number): Promise<void> {
    const runId = ++playbackRunId
    resetEdgeAnimations()
    resetPerceptronStateHistory()
    const baseState = {
      step: 0,
      type: 'base',
      updatedTensors: [],
      all: [],
    } as History
    addToPerceptronStateHistory(baseState)
    for (let i = layerId; i < Object.keys(perceptronLayerMap.value).length; i++) {
      animateEdgesForLayer(i, 'forward')
      await delay(1500)
      if (runId !== playbackRunId) {
        return
      }
      const history: History | undefined = model.forwardPass(i)
      if (history) {
        addToPerceptronStateHistory(history)
      }
    }
    const numLayers = Object.keys(perceptronLayerMap.value).length
    for (let i = numLayers - 1; i > 0; i--) {
      animateEdgesForLayer(i, 'backward')
      await delay(1500)
      if (runId !== playbackRunId) {
        return
      }
      const history: History | undefined = model.backward(i)
      if (history) {
        addToPerceptronStateHistory(history)
      }
    }
    model.updateWeights(1)
  }

  function pause(layerId: number): void {}

  function restart(): void {
    resetPerceptronStateHistory()
    void play(1)
  }

  function stepForward(): void {}
  function stepBackward(): void {}

  function animateEdgesForLayer(layerId: number, direction: 'forward' | 'backward'): void {
    const layer = perceptronLayerMap.value[layerId]
    if (!layer) {
      console.error(`Layer ${layerId} not found in perceptronLayerMap`)
      return
    }

    const layerTensorIds = new Set(layer.tensorIds)
    const edgeIds = getEdges.value
      .filter((edge) => {
        if (direction === 'forward') {
          return layerTensorIds.has(edge.target)
        }

        return layerTensorIds.has(edge.source)
      })
      .map((edge) => edge.id)

    for (const edgeId of edgeIds) {
      const existingTimeout = edgeAnimationTimeouts.get(edgeId)
      if (existingTimeout) {
        window.clearTimeout(existingTimeout)
      }

      updateEdgeData(edgeId, {
        isAnimating: true,
        animationDirection: direction,
        animationToken: Date.now() + Math.random(),
      })

      const timeoutId = window.setTimeout(() => {
        updateEdgeData(edgeId, {
          isAnimating: false,
        })
        edgeAnimationTimeouts.delete(edgeId)
      }, 1400)

      edgeAnimationTimeouts.set(edgeId, timeoutId)
    }
  }

  function resetEdgeAnimations(): void {
    const resetAnimationToken = Date.now() + Math.random()

    for (const edge of getEdges.value) {
      const timeoutId = edgeAnimationTimeouts.get(edge.id)
      if (timeoutId) {
        window.clearTimeout(timeoutId)
      }

      updateEdgeData(edge.id, {
        isAnimating: false,
        resetAnimationToken,
      })
    }

    edgeAnimationTimeouts.clear()
  }

  return {
    play,
    pause,
    restart,
    stepForward,
    stepBackward,
  }
}

export function useInjectedVisualizer(): VisualizerApi {
  const visualizer = inject(visualizerKey)
  if (!visualizer) {
    throw new Error('useInjectedVisualizer must be used within a visualizer provider')
  }
  return visualizer
}
