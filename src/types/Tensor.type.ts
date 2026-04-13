export type Tensor =
  | {
      id: string
      type: 'input' | 'weight' | 'bias'
      incomingValue: number | null
      outgoingValue: number | null
      value: number
      parents: string[]
      children: string[]
      gradient: number | null | undefined
      label: string
      layerId: number
    }
  | {
      id: string
      type: 'relu' | 'sigmoid' | 'tanh' | 'softmax' | 'linear'
      incomingValue: number
      outgoingValue: number
      parents: string[]
      children: string[]
      gradient: number | number[]
      label: string
      layerId: number
    }
  | {
      id: string
      type: 'add' | 'subtract' | 'multiply' | 'divide' | 'dot' | 'matmul' | 'sum'
      incomingValue: number[] | number
      outgoingValue: number
      parents: string[]
      children: string[]
      gradient: number | number[]
      label: string
      layerId: number
    }
  | {
      id: string
      type: 'cross_entropy' | 'mean_squared_error' | 'mean_absolute_error'
      incomingValue: number[] | number
      outgoingValue: number
      parents: string[]
      children: string[]
      gradient: number | number[]
      label: string
      layerId: number
    }

export type ValueTypeTensors = Extract<Tensor, { type: 'input' | 'weight' | 'bias' }>
export type LossTypeTensors = Extract<
  Tensor,
  { type: 'cross_entropy' | 'mean_squared_error' | 'mean_absolute_error' }
>
export type OperationTypeTensors = Extract<
  Tensor,
  { type: 'add' | 'subtract' | 'multiply' | 'divide' | 'dot' | 'matmul' | 'sum' }
>
export type ActivationTypeTensors = Extract<
  Tensor,
  { type: 'relu' | 'sigmoid' | 'tanh' | 'softmax' | 'linear' }
>
