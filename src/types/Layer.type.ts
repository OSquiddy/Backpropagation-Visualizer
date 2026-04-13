import type { Tensor } from './Tensor.type'

export type Layer =
  | {
      id: number
      type: 'data'
      prev: number | null
      next: number | null
      inputs: Record<string, Tensor>
      weights: Record<string, Tensor>
      biases: Record<string, Tensor>
    }
  | {
      id: number
      type: 'activation' | 'operation' | 'loss'
      prev: number | null
      next: number | null
      data: Record<string, Tensor>
    }

export type DataTypeLayer = Extract<Layer, { type: 'data' }>

export type OperationTypeLayer = Extract<Layer, { type: 'operation' | 'loss' | 'activation' }>

export type LayerPayload = {
  id: number
  type: 'data' | 'activation' | 'operation' | 'loss'
  prev: number | null
  next: number | null
  inputs?: Tensor
  weights?: Tensor
  biases?: Tensor
  data?: Tensor
}
