# Overall Goals

- Build an interactive graph that shows a perceptron being trained.
- Upgrade the complexity of the model: Perceptron -> Multi-Layer Perceptron -> Basic Neural Network -> Small but Customizable Neural Network

## Sub-Goals

- If I hover on a node, I should be able to view its values, the gradient values, the children of that node, the parents of the node (these 2 will be shown in the graph, but I need to store the values internally for calculations)
- Each node should have animations showing the forward pass and the backward pass. Do I want the labels for each edge to be updated depending on what kind of function is being called?

### Thoughts

- How do I want to frame the nodes in the graph?
  - Should each node be a custom component that has a defined type: [weight, input, operation, output, activation]
  - Do I want to define classes for each type? Or just store data in the Vue component file? I'm not sure how I want to structure the data inside each node. I'm also not sure how I want to actually display the information in the graph.

### Decisions

- I originally designed an overall Tensor Type and then made sub-types based on the nature of the tensor (ValueTensor: input/weight/bias, ActivationTensor: sigmoid, relu, softmax, LossTensor: cross entropy/MSE), but now I am wondering if it would be better to group them according to what their input and output value types are. It might make it easier for me for the forward pass and backprop calculations:
  - Original Implementation:

    ```ts
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
          incomingValue: number | number[]
          outgoingValue: number | number[]
          parents: string[]
          children: string[]
          gradient: number | number[]
          label: string
          layerId: number
        }
      | {
          id: string
          type: 'add' | 'subtract' | 'multiply' | 'divide' | 'dot' | 'matmul' | 'sum'
          incomingValue: number[]
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
          incomingValue: number[]
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
    ```

    As you can see, there is a lot of overlap between types (specifically the incoming/outgoing values). The loss functions are kinda consistent in that they each take in only 2 inputs ($y$ and $\hat_{y}$) and return a single number as output, but the same can't be said for the ActivationTypeTensors or OperationTypeTensors. I haven't yet written this portion yet, but if I want to add a _negate_ operation, that would take a single input and provide a single output, which is different from the multi-inputs and single outputs of the other operations I have listed so far.

  - Potential New Implementation:

    ```ts
    export type BaseTensor = {
      id: string
      parents: string[]
      children: string[]
      label: string
      layerId: number
      gradient: number | number[]
    }

    export type OutputOnlyTensor = BaseTensor & {
      type: 'input' | 'bias' | 'target'
      incomingValue: null
      outgoingValue: number
    }

    export type SISOTensor = BaseTensor & {
      type: 'relu' | 'sigmoid' | 'tanh' | 'linear' | 'negate'
      incomingValue: number
      outgoingValue: number
    }

    export type MISOTensor = BaseTensor & {
      type:
        | 'add'
        | 'subtract'
        | 'multiply'
        | 'divide'
        | 'cross_entropy'
        | 'mean_squared_error'
        | 'mean_absolute_error'
      incomingValue: number[]
      outgoingValue: number
    }

    export type MIMOTensor = BaseTensor & {
      type: 'dot' | 'matmul' | 'softmax'
      incomingValue: number[]
      outgoingValue: number[]
    }
    ```

    Looks hell of a lot cleaner

### Challenges

- Struggling with TypeScript. I want certain values to return, but the compiler says it might return undefined also (Object key lookups). So each time I'm trying to access an Object value I have to use this syntax: `Object[key]!.value`. If it's a nested value, it gets annoying. There's some other stuff that I'm having trouble wrapping my head around, but it'll work out soon.
- Calculating the incoming and outgoing values is tougher than I expected. I was using basic types because I need to store them in Pinia, but I'm thinking maybe I should pivot to an OOP approach? It's getting too complex trying to write code for every tensor calculation, and I feel as though I'm rewriting a lot of the same stuff. I need to streamline this stuff. The goal for now is to get at least one working model and then I can look at making it efficient.

# Learnings

- Create a smaller base type, and build upwards for sure, instead of building a huge base type and then constantly having to use Extract on it.
- TypeScript is a pain in the ass for the first few hours, but then once you pull through the initial learning curve, it is not too bad
- Not really a learning, since I knew this already, but I spend way too much time refactoring my code. I implement something, start working on something else, and midway through my new task, I come up with a way to optimize my previous code. Which sucks, cause I spent a few hours getting everything to work again the way it did originally. On the bright side, the code is more efficient, so a win is a win.
- Each node in the hidden layer is basically a perceptron. It's abstracted in the diagrams by a single circle, but that nodes takes the weighted sum of the outputs from the previous nodes as input, passes it through an activation function and then sends the output to the next hidden layer.
- Weights live on the edges, or technically should be stored with each node that is receiving the inputs. I have been storing them as their own separate enetity in my representation. I will need to go back and rework my design. This is going to be a massive pain
-  
