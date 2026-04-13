import type { Tensor } from './Tensor.type'

export type History = {
  step: number
  type: 'forward' | 'backward'
  updatedTensors: Tensor[]
  all: Tensor[]
}
