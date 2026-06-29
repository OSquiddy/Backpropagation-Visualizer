<script lang="ts" setup>
import { computed, nextTick, ref, watch } from 'vue'
import { type EdgeProps, BaseEdge, EdgeLabelRenderer, getBezierPath, useVueFlow } from '@vue-flow/core'
import { useTensorDataStore } from '@/stores/tensorDataStore'
import { storeToRefs } from 'pinia'
import { ltx } from '@/utils/LaTeXFormatter'

const tensorDataStore = useTensorDataStore()
const { tensorValuesMap } = storeToRefs(tensorDataStore)



const props = defineProps<Partial<EdgeProps>>()

const { updateEdgeData } = useVueFlow(props.data?.flowId)
const completedPathRef = ref<SVGPathElement | null>(null)
const overlayPathRef = ref<SVGPathElement | null>(null)
const isAnimating = computed({
  get: () => props.data?.isAnimating || false,
  set: (value: boolean) => {
    if (props.id) {
      updateEdgeData(props.id, { isAnimating: value })
    }
  },
})

let animation: Animation | null = null

const path = computed(() => getBezierPath(props as EdgeProps))

const edgeLabel = computed(() => {
  const edgeString = props.source && tensorValuesMap.value[props.source]?.outgoingValue ? props.data.label ? `${props.data.label} =  ${(tensorValuesMap.value[props.source]?.outgoingValue as number).toFixed(1)}` : props.data.label : ''
  return edgeString ? ltx(edgeString) : ''
})

watch(
  () => [props.data?.isAnimating, props.data?.animationToken, props.data?.animationDirection],
  ([animating]) => {
    if (animating && props.data?.animationDirection) {
      runAnimation(props.data.animationDirection)
    }
  },
)

watch(
  () => props.data?.resetAnimationToken,
  () => {
    cancelAnimationOverlay()
  },
)

function applyCompletedState(direction: 'forward' | 'backward'): void {
  const completedPathEl = completedPathRef.value

  if (!completedPathEl) {
    return
  }

  completedPathEl.style.opacity = '1'
  completedPathEl.style.stroke = direction === 'forward' ? '#2563eb' : '#dc2626'
  completedPathEl.style.strokeWidth = '2'
  completedPathEl.style.strokeLinecap = 'round'
  completedPathEl.style.strokeLinejoin = 'round'
}

function cancelAnimationOverlay(): void {
  animation?.cancel()
  animation = null

  const pathEl = overlayPathRef.value
  if (!pathEl) {
    return
  }

  pathEl.style.opacity = '0'
  pathEl.style.stroke = 'transparent'
  pathEl.style.strokeDasharray = 'none'
  pathEl.style.strokeDashoffset = '0'
}

function runAnimation(direction: 'forward' | 'backward'): void {
  const pathEl = overlayPathRef.value

  if (!pathEl) {
    console.warn('Overlay edge path element not found')
    return
  }

  cancelAnimationOverlay()

  nextTick(() => {
    const totalLength = pathEl.getTotalLength()
    const strokeColor = direction === 'forward' ? '#2563eb' : '#dc2626'
    const pathLengthDuration = totalLength * 5

    pathEl.style.opacity = '1'
    pathEl.style.stroke = strokeColor
    pathEl.style.strokeWidth = '2'
    pathEl.style.strokeLinecap = 'round'
    pathEl.style.strokeLinejoin = 'round'
    pathEl.style.strokeDasharray = `${totalLength} ${totalLength}`
    pathEl.style.strokeDashoffset = direction === 'forward' ? String(totalLength) : String(-totalLength)

    const keyframes =
      direction === 'forward'
        ? [{ strokeDashoffset: totalLength }, { strokeDashoffset: 0 }]
        : [{ strokeDashoffset: -totalLength }, { strokeDashoffset: 0 }]

    const pathAnimation = pathEl.animate(keyframes, {
      duration: Math.min(Math.max(pathLengthDuration, 1500), 3000), // Clamp duration between 1.5s and 3s
      easing: 'linear',
      iterations: 1,
    })

    const handleAnimationEnd = (persistCompletedState: boolean) => {
      if (persistCompletedState) {
        applyCompletedState(direction)
      }

      pathEl.style.stroke = 'transparent'
      pathEl.style.strokeDasharray = 'none'
      pathEl.style.strokeDashoffset = '0'
      pathEl.style.opacity = '0'
      animation = null
      isAnimating.value = false
    }

    pathAnimation.oncancel = () => handleAnimationEnd(false)
    pathAnimation.onfinish = () => handleAnimationEnd(true)
    animation = pathAnimation
  })
}


</script>

<script lang="ts">
export default {
  inheritAttrs: false,
}
</script>

<template>
  <BaseEdge v-bind="props as EdgeProps" :path="path[0]" class="base-edge-path" />
  <path
    ref="completedPathRef"
    :d="path[0]"
    fill="none"
    class="edge-completed-path"
    pointer-events="none"
  />
  <path
    ref="overlayPathRef"
    :d="path[0]"
    fill="none"
    class="edge-animation-overlay"
    pointer-events="none"
  />

  <EdgeLabelRenderer>
    <div :style="{
      display: 'inline-block',
      cursor: 'auto',
      pointerEvents: 'all',
      position: 'absolute',
      transform: `translate(-50%, -50%) translate(${path[1]}px,${path[2]}px)`,
    }" class="nodrag nopan custom-edge-label-backdrop">
      <div class="custom-edge-label" v-html="edgeLabel"></div>
    </div>

  </EdgeLabelRenderer>
</template>

<style scoped>
@import 'katex/dist/katex.min.css';

.base-edge-path:deep(.vue-flow__edge-path),
:deep(.base-edge-path .vue-flow__edge-path) {
  stroke-dasharray: 5 5;
}

.edge-animation-overlay {
  opacity: 0;
  stroke: transparent;
  stroke-width: 4;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.edge-completed-path {
  opacity: 0;
  stroke: transparent;
  stroke-width: 4;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.custom-edge-label {
  background-color: var(--vf-node-bg);
}
</style>
