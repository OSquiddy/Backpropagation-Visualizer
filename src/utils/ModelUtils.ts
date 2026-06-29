import { useTensorDataStore } from "@/stores/tensorDataStore";
import { storeToRefs } from "pinia";
import type { TensorType, Tensor } from "@/types/Tensor.type";
import { sum, exp, array, NDArrayCore, Complex, prod, add, multiply, clip, divide, subtract  } from "numpy-ts/core";


export function calculateIncomingValue(tensor: TensorType): Tensor {

  const tensorDataStore = useTensorDataStore()
  const { tensorValuesMap } = storeToRefs(tensorDataStore)

  let result: number | bigint | NDArrayCore | Complex | Record<string | number, Tensor> = 0
  if (tensor.type === 'sum' || tensor.type === 'add') {
    // Sum will have multiple parents. Let's separate the parents by type and then calculate the total sum

    // Separate the parents by type and then calculate the total sum
    const weightedInputParents = tensor.parents.filter((parent) => parent.type === 'weight')
    const biasParents = tensor.parents.filter((parent) => parent.type === 'bias')

    // Map the values into arrays
    const weightedInputIncomingValues = weightedInputParents.map((parent) => tensorValuesMap.value[parent.id]?.outgoingValue ?? 0)
    const biasIncomingValues = biasParents.map((parent) => tensorValuesMap.value[parent.id]?.outgoingValue ?? 0)

    result = { weightedInputs: weightedInputIncomingValues, bias: biasIncomingValues } as Record<string | number, Tensor>
  }
  if (tensor.type === 'multiply') {
    const incomingValuesArray: NDArrayCore = array(tensor.parents.map((parent) => tensorValuesMap.value[parent]?.outgoingValue ?? 0))
    result = incomingValuesArray
  }
  if (tensor.type === 'sigmoid') {
    // A sigmoid will only have one parent
    const parentId = tensor.parents[0]!.id
    result = tensorValuesMap.value[parentId]!.outgoingValue as number
  }
  if (tensor.type === 'bias') {
    // A bias will not have any parents
    console.log('bias', tensor.value)
    result = tensor.value
  }
  if (tensor.type === 'input') {
    // Only the initial input will not have an incoming value
    // All other inputs will have an incoming value, and no inherent value

    // An input may or may not have a parent, so we need to check if it does
    const parentId = tensor.parents[0]!.id
    result = tensorValuesMap.value[parentId]!.outgoingValue as number
  }
  if (tensor.type === 'weight') {
    // Each weight will only have one parent, which is the input node
    const parentId = tensor.parents[0]!.id
    result = tensorValuesMap.value[parentId]!.outgoingValue as number
  }
  if (
    tensor.type === 'hinge_loss' ||
    tensor.type === 'binary_cross_entropy' ||
    tensor.type === 'cross_entropy' ||
    tensor.type === 'mean_squared_error' ||
    tensor.type === 'mean_absolute_error'
  ) {
    // A loss node will have two parents. One is the predicted value and the other is the ground truth value.

    // Predicted value
    const predictedValueTensorId = tensor.parents.find((parent) => parent.type !== 'ground_truth')!.id
    const predictedValue = tensorValuesMap.value[predictedValueTensorId]!.outgoingValue as number

    // Ground truth value
    const groundTruthValueTensorId = tensor.parents.find((parent) => parent.type === 'ground_truth')!.id
    const groundTruthValue = tensorValuesMap.value[groundTruthValueTensorId]!.outgoingValue as number

    result = { 'predictedValue': predictedValue, 'groundTruthValue': groundTruthValue } as Record<string, Tensor>
  }
  return result
}
export function calculateOutgoingValue(tensor: TensorType): Tensor {

  const tensorDataStore = useTensorDataStore()
  const { tensorValuesMap } = storeToRefs(tensorDataStore)

  let result: number | bigint | NDArrayCore | Complex = 0
  if (tensor.type === 'multiply') {
    const outgoingValuesArray: NDArrayCore = array(tensor.children.map((parent) => tensorValuesMap.value[parent]?.incomingValue ?? 0))
    result = prod(tensor.incomingValue, 0)
  }
  if (tensor.type === 'sigmoid') {
    result = 1 / (1 + Math.exp(-tensor.incomingValue))
  }
  if (tensor.type === 'input' || tensor.type === 'bias') {
    result = tensor.value
  }
  if (tensor.type === 'weight') {
    result = tensor.incomingValue * tensor.value
  }
  if (tensor.type === 'sum' || tensor.type === 'add') {
    // const outgoingValuesArray: NDArrayCore = array(tensor.children.map((parent) => tensorValuesMap.value[parent]?.incomingValue ?? 0))
    console.log('sum or add', tensor.incomingValue)
    const consolidatedIncomingValues = array([...tensor.incomingValue.weightedInputs, ...tensor.incomingValue.bias])
    result = sum(consolidatedIncomingValues)
  }
  if (tensor.type === 'binary_cross_entropy') {
    const binaryCrossEntropy = (y: number, y_hat: number) => -y * Math.log(y_hat) - (1 - y) * Math.log(1 - y_hat)
    result = binaryCrossEntropy(tensor.incomingValue.groundTruthValue!, tensor.incomingValue.predictedValue!)
    console.log('loss', result)
  }
  return result
}
export function calculateGradient(tensor: TensorType): Tensor {
  const tensorDataStore = useTensorDataStore()
  const { tensorValuesMap } = storeToRefs(tensorDataStore)

  let result: number | bigint | NDArrayCore | Complex = 0
  if (tensor.type === 'sum' || tensor.type === 'add') {
    result = tensor.gradient
  }
  if (tensor.type === 'binary_cross_entropy') {
    const BCELocalGradient = (y: number, y_hat: number) => {
      y = y === 0 ? 1e-15 : y
      return (-y / y_hat + (1 - y) / (1 - y_hat)).toFixed(2)
    }
    tensor.localGradient = Number(BCELocalGradient(tensor.incomingValue.groundTruthValue!, tensor.incomingValue.predictedValue!))
    tensor.incomingGradient = 1
    const gradient = multiply(array(tensor.incomingGradient), array(tensor.localGradient))
    console.log('Loss Node')
    console.log('dL/dL', tensor.incomingGradient)
    console.log('dL/da', tensor.localGradient)
    console.log('dL/dL * dL/da', gradient.data[0])
    result = gradient.data[0]
  }
  if (tensor.type === 'sigmoid') {
    tensor.localGradient = (tensor.outgoingValue as number) * (1 - (tensor.outgoingValue as number)) as Tensor
    tensor.incomingGradient = tensorValuesMap.value[tensor.children[0]!.id]!.gradient as Tensor
    const gradient = multiply(array(tensor.incomingGradient), array(tensor.localGradient))
    console.log('\nSigmoid Node')
    console.log('dL/da', tensor.incomingGradient)
    console.log('da/dz', tensor.localGradient)
    console.log('dL/da * da/dz', gradient.data[0])
    result = gradient.data[0]

  }
  if (tensor.type === 'sum' || tensor.type === 'add') {
    tensor.localGradient = 1
    const localGradientsOfParents = tensor.parents.map((parent) => {
      const localGradient = () => {
        if (parent.type === 'weight') {
          return tensorValuesMap.value[parent.id!]?.incomingValue
        } else if (parent.type === 'bias') {
          return 1
        }
      }
      return { 'id': parent.id, 'localGradient': localGradient() }
    })
    tensor.localGradient = localGradientsOfParents
    console.log('\ndz/dw1 | dz/dw2 | dz/dw3', tensor.localGradient)
    tensor.incomingGradient = tensorValuesMap.value[tensor.children[0]!.id]!.gradient as Tensor
    const gradient = localGradientsOfParents.map(x => {
      return { 'id': x.id, 'gradient': x.localGradient as number * tensor.incomingGradient as number }
    })
    // const gradient = multiply(array(tensor.incomingGradient), array(tensor.localGradient))
    console.log(gradient)
    console.log('\nSum or Add Node')
    console.log('dL/dz', tensor.incomingGradient)
    console.log('dz/dw1 | dz/dw2 | dz/dw3', tensor.localGradient)
    console.log('dL/dL * dL/da', gradient)
    result = gradient
  }
  if (tensor.type === 'bias') {
    tensor.localGradient = 1
    console.log('\nBias Node')
    tensor.incomingGradient = tensorValuesMap.value[tensor.children[0]!.id]!.gradient.find(x => x.id === tensor.id)
    console.log(tensor.incomingGradient)
    const gradient = tensor.incomingGradient as number * tensor.localGradient
    result = gradient
  }
  if (tensor.type === 'weight') {
    tensor.localGradient = tensor.incomingValue as Tensor
    tensor.incomingGradient = tensorValuesMap.value[tensor.children[0]!.id]!.gradient.find(x => x.id === tensor.id).gradient as Tensor
    const gradient = tensor.incomingGradient * tensor.localGradient
    console.log('\nWeight Node')
    console.log('localGradient: ', tensor.localGradient)
    console.log('incomingGradient: ', tensor.incomingGradient)
    console.log('gradient: ', gradient)
    result = gradient
  }
  if (tensor.type === 'input') {
    console.log('\nInput Node')
    tensor.localGradient = tensorValuesMap.value[tensor.children[0]!.id].value
    tensor.incomingGradient = tensorValuesMap.value[tensor.children[0]!.id]!.gradient as Tensor
    const gradient = tensor.incomingGradient * tensor.localGradient
    console.log('Gradient: ', gradient)
    result = gradient
  }
  return result
}
