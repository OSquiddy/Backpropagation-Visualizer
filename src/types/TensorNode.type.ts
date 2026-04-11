export type TensorNode =
  | { type: 'input', value: number, parents: string[], children: string[], gradient: number }
  | { type: 'weight', value: number, parents: string[], children: string[], gradient: number }
  | { type: 'bias', value: number, parents: string[], children: string[], gradient: number }
  | { type: 'output', value: number, parents: string[], children: string[], gradient: number }
  | { type: 'activation', value: 'relu' | 'sigmoid' | 'tanh' | 'softmax' | 'linear', parents: string[], children: string[], gradient: number }
  | { type: 'operation', op: 'add' | 'subtract' | 'multiply' | 'divide' | 'dot' | 'matmul', parents: string[], children: string[], gradient: number }
