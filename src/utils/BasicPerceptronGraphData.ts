import type { Node, Edge } from '@vue-flow/core'
import { Position } from '@vue-flow/core'
import { ltx } from './LaTeXFormatter'

const initialPosition = { x: 0, y: 0 }
const CUSTOM_NODE_TYPE = 'tensor'

export const initialNodes: Node[] = [
  {
    id: '1a',
    type: CUSTOM_NODE_TYPE,
    position: initialPosition,
    sourcePosition: Position.Right,
    data: { type: 'input', label: 'x_1', value: 2, layer_id: 1 },
  },
  {
    id: '1b',
    type: CUSTOM_NODE_TYPE,
    position: initialPosition,
    sourcePosition: Position.Right,
    data: { type: 'input', label: 'x_2', value: 1, layer_id: 1 },
  },
  {
    id: '1c',
    type: CUSTOM_NODE_TYPE,
    position: initialPosition,
    sourcePosition: Position.Right,
    data: { type: 'input', label: 'x_3', value: 4, layer_id: 1 },
  },

  {
    id: '2a',
    type: CUSTOM_NODE_TYPE,
    position: initialPosition,
    sourcePosition: Position.Right,
    targetPosition: Position.Left,
    data: { type: 'weight', label: 'w_1', value: 1, layer_id: 1 },
  },
  {
    id: '2b',
    type: CUSTOM_NODE_TYPE,
    position: initialPosition,
    sourcePosition: Position.Right,
    targetPosition: Position.Left,
    data: { type: 'weight', label: 'w_2', value:-2, layer_id: 1 },
  },
  {
    id: '2c',
    type: CUSTOM_NODE_TYPE,
    position: initialPosition,
    sourcePosition: Position.Right,
    targetPosition: Position.Left,
    data: { type: 'weight', label: 'w_3', value: 3, layer_id: 1 },
  },
  {
    id: '3',
    type: CUSTOM_NODE_TYPE,
    position: initialPosition,
    targetPosition: Position.Left,
    sourcePosition: Position.Right,
    data: { type: 'sum', label: '\\sum', layer_id: 2 },
  },
  {
    id: '4',
    type: CUSTOM_NODE_TYPE,
    position: initialPosition,
    targetPosition: Position.Left,
    sourcePosition: Position.Right,
    data: { type: 'sigmoid', label: '\\sigma', layer_id: 3 },
  },
  {
    id: '5',
    type: CUSTOM_NODE_TYPE,
    position: initialPosition,
    targetPosition: Position.Left,
    sourcePosition: Position.Right,
    data: { type: 'loss', label: 'L', layer_id: 4 },
  },
]

export const initialEdges: Edge[] = [
  {
    id: '1a->2a',
    source: '1a',
    target: '2a',
  },
  {
    id: '1b->2b',
    source: '1b',
    target: '2b',
  },
  {
    id: '1c->2c',
    source: '1c',
    target: '2c',
  },
  {
    id: '2a->3',
    source: '2a',
    target: '3',
    data: {
      katexLabel: ltx('w_1x_1'),
    }
  },
  {
    id: '2b->3',
    source: '2b',
    target: '3',
    data: {
      katexLabel: ltx('w_2x_2'),
    }
  },
  {
    id: '2c->3',
    source: '2c',
    target: '3',
    data: {
      katexLabel: ltx('w_3x_3'),
    }
  },
  {
    id: '3->4',
    source: '3',
    target: '4',
    data: {
      katexLabel: ltx('z'),
    }
  },
  {
    id: '4->5',
    source: '4',
    target: '5',
    data: {
      katexLabel: ltx('a'),
    }
  }
]
