import type { NDArrayCore, DType } from 'numpy-ts/core'

export type Tensor = number | Tensor[] | DType | NDArrayCore

export type BaseTensorType = {
  id: string
  parents: { id: string, type: string }[]
  children: { id: string, type: string }[]
  label: string
  layerId: number
  incomingGradient: Tensor,
  localGradient: Tensor,
  gradient?: Tensor,
  incomingValue: Tensor | Record<string | number, Tensor>
  outgoingValue: Tensor | Record<string | number, Tensor>
}

export type ValueTypeTensors = BaseTensorType & {
  type: 'input' | 'weight' | 'bias' | 'ground-truth' | 'loss_output'
  value: Tensor
}

export type LossTypeTensors = BaseTensorType & {
  type: 'cross_entropy' | 'mean_squared_error' | 'mean_absolute_error' | 'hinge_loss' | 'binary_cross_entropy'
}

export type OperationTypeTensors = BaseTensorType & {
  type: 'add' | 'subtract' | 'multiply' | 'divide' | 'dot' | 'matmul' | 'sum'
}

export type ActivationTypeTensors = BaseTensorType & {
  type: 'relu' | 'sigmoid' | 'tanh' | 'softmax' | 'linear'
}

export type TensorType = ValueTypeTensors | LossTypeTensors | OperationTypeTensors | ActivationTypeTensors
