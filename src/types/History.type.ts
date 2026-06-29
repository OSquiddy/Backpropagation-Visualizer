import type { TensorType } from './Tensor.type'

export type History = {
  step: number
  type: 'forward' | 'backward' | 'base'
  updatedTensors: TensorType[]
  all: TensorType[]
}
