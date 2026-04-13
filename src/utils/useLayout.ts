import dagre from '@dagrejs/dagre'
import { useVueFlow } from '@vue-flow/core'
import type { Node, Edge } from '@vue-flow/core'
import { ref } from 'vue'

export function useLayout(flowId: string) {
  const { findNode } = useVueFlow({ id: flowId })

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

    return nodes.map((node) => {
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
  }

  return { graph, layout }

}
