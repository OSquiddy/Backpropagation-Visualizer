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

