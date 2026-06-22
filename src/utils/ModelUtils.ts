import { useTensorDataStore } from "@/stores/tensorDataStore";
import { storeToRefs } from "pinia";
import type { TensorType, Tensor } from "@/types/Tensor.type";
import { sum, exp, array, NDArrayCore, Complex, prod, add  } from "numpy-ts/core";


export function calculateIncomingValue(tensor: TensorType): Tensor {

  const tensorDataStore = useTensorDataStore()
  const { tensorValuesMap } = storeToRefs(tensorDataStore)

  let result: number | bigint | NDArrayCore | Complex | Object = 0
  if (tensor.type === 'sum' || tensor.type === 'add') {
    // Sum will have multiple parents. Let's separate the parents by type and then calculate the total sum

    // Separate the parents by type and then calculate the total sum
    const weightedInputParents = tensor.parents.filter((parent) => parent.type === 'weight')
    const biasParents = tensor.parents.filter((parent) => parent.type === 'bias')

    // Map the values into arrays
    const weightedInputIncomingValues = weightedInputParents.map((parent) => tensorValuesMap.value[parent.id]?.outgoingValue ?? 0)
    const biasIncomingValues = biasParents.map((parent) => tensorValuesMap.value[parent.id]?.outgoingValue ?? 0)

    result = { weightedInputs: weightedInputIncomingValues, bias: biasIncomingValues } as Object
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

    result = { predictedValue: predictedValue, groundTruthValue: groundTruthValue } as Object
  }
  return result
}
export function calculateOutgoingValue(tensor: TensorType): Tensor {
  let result: number | bigint | NDArrayCore | Complex = 0
  if (tensor.type === 'sum' || tensor.type === 'add') {
    // const outgoingValuesArray: NDArrayCore = array(tensor.children.map((parent) => tensorValuesMap.value[parent]?.incomingValue ?? 0))
    const consolidatedIncomingValues = array([...tensor.incomingValue.weightedInputs, ...tensor.incomingValue.bias])
    result = sum(consolidatedIncomingValues)
  }
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
  if (tensor.type === 'binary_cross_entropy') {
    const binaryCrossEntropy = (y: number, y_hat: number) => -y * Math.log(y_hat) - (1 - y) * Math.log(1 - y_hat)
    result = binaryCrossEntropy(tensor.incomingValue.groundTruthValue!, tensor.incomingValue.predictedValue!)
  }
  return result
}
