import type { TensorType } from './Tensor.type'

export type History = {
  step: number
  type: 'forward' | 'backward'
  updatedTensors: TensorType[]
  all: TensorType[]
}
