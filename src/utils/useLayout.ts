import dagre from '@dagrejs/dagre'
import { Position, useVueFlow } from '@vue-flow/core'
import type { Node, Edge } from '@vue-flow/core'
import { ref } from 'vue'

export function useLayout(flowId: string) {
  const { findNode } = useVueFlow(flowId)

  const graph = ref(new dagre.graphlib.Graph())

  function layout(nodes: Node[], edges: Edge[], direction: 'TB' | 'LR' = 'LR') {
    const dagreGraph = new dagre.graphlib.Graph()
    graph.value = dagreGraph
    dagreGraph.setDefaultEdgeLabel(() => ({}))

    dagreGraph.setGraph({ rankdir: direction, ranksep: 100 })

    for (const node of nodes) {
      const graphNode = findNode(node.id)

      if (!graphNode) {
        console.error(`Node with id ${node.id} not found`)
        continue
      }

      dagreGraph.setNode(node.id, { width: graphNode.dimensions.width, height: graphNode.dimensions.height })
    }

    for (const edge of edges) {
      dagreGraph.setEdge(edge.source, edge.target)
    }

    dagre.layout(dagreGraph)

    const mappedNodes: Node[] = nodes.map((node) => {
      const nodeWithPosition = dagreGraph.node(node.id)

      return {
        ...node,
        targetPosition: node.targetPosition,
        sourcePosition: node.sourcePosition,
        position: {
          x: nodeWithPosition.x,
          y: nodeWithPosition.y,
        },
      }
    })

    const lossNode = mappedNodes.find((node) => node.data.type === 'binary_cross_entropy')
    const groundTruthNode = mappedNodes.find((node) => node.data.type === 'ground_truth')
    const lossOutputNode = mappedNodes.find((node) => node.data.type === 'loss_output')

    if (lossNode && groundTruthNode) {
      lossNode.position.y -= 50
      lossOutputNode!.position.y -= 50
      groundTruthNode.position.x = lossNode.position.x
      groundTruthNode.sourcePosition = Position.Top
      lossNode.targetPosition = Position.Bottom
    }

    return mappedNodes
  }

  return { graph, layout }

}
