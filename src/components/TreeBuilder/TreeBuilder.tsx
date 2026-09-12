/**
 * TreeBuilder - Visualizes the recursion call tree using React Flow
 * 
 * Enhanced to handle:
 * - Multiple children per node (left/right branches for divide-and-conquer)
 * - Improved layout for wide trees
 * - Function name display in tree nodes
 * 
 * _Requirements: 9.4_
 */

import { useMemo, useEffect } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  useNodesState,
  useEdgesState,
  type Node,
  type Edge,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import RecursionNode, { type RecursionNodeData } from './RecursionNode';
import type { FrameObject } from '../../types';

interface TreeBuilderProps {
  frames: FrameObject[];
  currentFrameIndex: number;
}

const nodeTypes = {
  recursionNode: RecursionNode,
};

// Tree node for layout calculation
interface TreeNode {
  id: string;
  frame: FrameObject;
  children: TreeNode[];
  x: number;
  y: number;
  width: number;
}

/**
 * Build a tree structure from frames
 */
function buildTree(callFrames: FrameObject[]): Map<string, TreeNode> {
  const nodeMap = new Map<string, TreeNode>();
  
  // Create tree nodes
  for (const frame of callFrames) {
    nodeMap.set(frame.id, {
      id: frame.id,
      frame,
      children: [],
      x: 0,
      y: 0,
      width: 1,
    });
  }
  
  // Build parent-child relationships
  for (const frame of callFrames) {
    if (frame.parentFrameId && nodeMap.has(frame.parentFrameId)) {
      const parent = nodeMap.get(frame.parentFrameId)!;
      const child = nodeMap.get(frame.id)!;
      parent.children.push(child);
    }
  }
  
  return nodeMap;
}

/**
 * Calculate subtree width for proper spacing
 */
function calculateSubtreeWidth(node: TreeNode): number {
  if (node.children.length === 0) {
    node.width = 1;
    return 1;
  }
  
  let totalWidth = 0;
  for (const child of node.children) {
    totalWidth += calculateSubtreeWidth(child);
  }
  
  node.width = Math.max(1, totalWidth);
  return node.width;
}

/**
 * Position nodes using a tree layout algorithm
 */
function positionNodes(
  node: TreeNode,
  x: number,
  y: number,
  horizontalSpacing: number,
  verticalSpacing: number
): void {
  node.x = x;
  node.y = y;
  
  if (node.children.length === 0) return;
  
  // Calculate total width of children
  const totalChildWidth = node.children.reduce((sum, child) => sum + child.width, 0);
  
  // Position children centered under parent
  let currentX = x - (totalChildWidth * horizontalSpacing) / 2;
  
  for (const child of node.children) {
    const childCenterX = currentX + (child.width * horizontalSpacing) / 2;
    positionNodes(child, childCenterX, y + verticalSpacing, horizontalSpacing, verticalSpacing);
    currentX += child.width * horizontalSpacing;
  }
}

/**
 * Calculate tree layout positions with improved algorithm for wide trees
 */
function calculateLayout(
  frames: FrameObject[],
  currentIndex: number
): { nodes: Node<RecursionNodeData>[]; edges: Edge[] } {
  const nodes: Node<RecursionNodeData>[] = [];
  const edges: Edge[] = [];
  
  // Track which frames represent active stack entries
  const returnedFrameIds = new Map<string, number | string>();
  
  // Process frames up to current index to build tree state
  const callStack: string[] = [];
  
  for (let i = 0; i <= currentIndex && i < frames.length; i++) {
    const frame = frames[i];
    
    if (frame.action === 'CALL') {
      callStack.push(frame.id);
    } else if (frame.action === 'RETURN') {
      const returningId = callStack.pop();
      if (returningId && frame.returnValue !== undefined) {
        returnedFrameIds.set(returningId, frame.returnValue);
      }
    }
  }
  
  // Current active frame is top of stack
  const currentActiveId = callStack.length > 0 ? callStack[callStack.length - 1] : null;
  
  // Build nodes from CALL frames only
  const callFrames = frames
    .slice(0, currentIndex + 1)
    .filter((f) => f.action === 'CALL');
  
  if (callFrames.length === 0) {
    return { nodes, edges };
  }
  
  // Build tree structure
  const nodeMap = buildTree(callFrames);
  
  // Find root nodes (no parent or parent not in current frames)
  const rootNodes: TreeNode[] = [];
  for (const frame of callFrames) {
    if (!frame.parentFrameId || !nodeMap.has(frame.parentFrameId)) {
      rootNodes.push(nodeMap.get(frame.id)!);
    }
  }
  
  // Calculate layout
  const horizontalSpacing = 160;
  const verticalSpacing = 100;
  
  // Calculate widths and position each root tree
  let totalRootWidth = 0;
  for (const root of rootNodes) {
    calculateSubtreeWidth(root);
    totalRootWidth += root.width;
  }
  
  // Position root trees
  let currentRootX = -(totalRootWidth * horizontalSpacing) / 2;
  for (const root of rootNodes) {
    const rootCenterX = currentRootX + (root.width * horizontalSpacing) / 2;
    positionNodes(root, rootCenterX, 0, horizontalSpacing, verticalSpacing);
    currentRootX += root.width * horizontalSpacing;
  }
  
  // Create React Flow nodes and edges
  for (const [id, treeNode] of nodeMap) {
    const frame = treeNode.frame;
    const isActive = id === currentActiveId;
    const returnValue = returnedFrameIds.get(id);
    
    // Format label with function name and key parameters
    const params = frame.parameters || frame.variables;
    const paramValues = Object.values(params).map(v => {
      const str = String(v);
      return str.length > 10 ? str.substring(0, 7) + '...' : str;
    });
    const label = `${frame.functionName}(${paramValues.join(', ')})`;
    
    nodes.push({
      id,
      type: 'recursionNode',
      position: { x: treeNode.x, y: treeNode.y },
      data: {
        label,
        functionName: frame.functionName,
        variables: frame.variables,
        isActive,
        returnValue,
      },
    });
    
    // Create edge to parent
    if (frame.parentFrameId && nodeMap.has(frame.parentFrameId)) {
      edges.push({
        id: `e-${frame.parentFrameId}-${id}`,
        source: frame.parentFrameId,
        target: id,
        animated: isActive,
        style: {
          stroke: isActive ? '#2196f3' : returnValue !== undefined ? '#4caf50' : '#999',
          strokeWidth: isActive ? 2 : 1,
        },
      });
    }
  }
  
  return { nodes, edges };
}

export function TreeBuilder({ frames, currentFrameIndex }: TreeBuilderProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node<RecursionNodeData>>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  
  // Update tree when frames or current index changes
  useEffect(() => {
    const { nodes: newNodes, edges: newEdges } = calculateLayout(frames, currentFrameIndex);
    setNodes(newNodes);
    setEdges(newEdges);
  }, [frames, currentFrameIndex, setNodes, setEdges]);
  
  const defaultViewport = useMemo(() => ({ x: 300, y: 50, zoom: 0.7 }), []);
  
  return (
    <div style={{ width: '100%', height: '100%', background: '#fafafa' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        defaultViewport={defaultViewport}
        fitView
        fitViewOptions={{ padding: 0.3 }}
        minZoom={0.2}
        maxZoom={1.5}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={false}
      >
        <Background color="#e0e0e0" gap={20} />
        <Controls showInteractive={false} />
      </ReactFlow>
    </div>
  );
}

export default TreeBuilder;
