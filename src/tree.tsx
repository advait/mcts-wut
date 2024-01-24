import * as d3 from "d3";
import * as Plot from "@observablehq/plot";
import React from "react";
import { useEffect, useRef } from "react";
import * as seedrandom from "seedrandom";

const rng = seedrandom("advait3000");

export class MNode {
  name: string;
  accumulatedValue: number;
  children: MNode[] = [];
  visitCount: number = 0;
  lastTraversed: boolean = false;

  constructor(name: string, initValue: number = 0) {
    this.name = name;
    this.accumulatedValue = initValue;
  }

  isTerminal(): boolean {
    return this.children.length == 0;
  }

  avgValue(): number {
    if (this.visitCount == 0 || this.isTerminal()) {
      return this.accumulatedValue;
    }

    return this.accumulatedValue / this.visitCount;
  }

  /**
   * Returns the horizontal index of the node across all cousin nodes at this depth.
   */
  hIndex(): number {
    const binIndex = this.name.replace(/\./g, "");
    return parseInt(binIndex, 2);
  }

  copy(): MNode {
    const ret = new MNode(this.name, this.accumulatedValue);
    ret.children = this.children.map((c) => c.copy());
    ret.visitCount = this.visitCount;
    ret.lastTraversed = this.lastTraversed;
    return ret;
  }
}

export function generateTree(
  maxDepth: number,
  curDepth: number = 0,
  nodeName: string = "",
  fanout: number = 2,
): MNode {
  if (curDepth >= maxDepth) {
    return new MNode(nodeName);
  }

  const ret: MNode = new MNode(nodeName);
  for (let i = 0; i < fanout; i++) {
    let childName = nodeName ? `${nodeName}.${i}` : `${i}`;
    ret.children.push(generateTree(maxDepth, curDepth + 1, childName, fanout));
  }
  return ret;
}

function getTerminalNodes(tree: MNode): MNode[] {
  if (tree.isTerminal()) {
    return [tree];
  }
  return tree.children.flatMap((c) => getTerminalNodes(c));
}

export function setTerminalValues(
  tree: MNode,
  genValue: (hRatio: number) => number,
) {
  const terminalNodes = getTerminalNodes(tree);
  terminalNodes.forEach((t) => {
    const hRatio = t.hIndex() / terminalNodes.length;
    t.accumulatedValue = genValue(hRatio);
  });
}

export function performRandomTraversal(tree: MNode): MNode {
  tree = tree.copy();
  resetLastTraversed(tree);

  const visited: MNode[] = [];
  let cur = tree;
  while (true) {
    visited.push(cur);
    if (cur.isTerminal()) {
      break;
    }

    // Randomly select a child
    cur = cur.children[Math.floor(rng() * cur.children.length)];
  }

  const finalValue = cur.accumulatedValue;
  visited.forEach((node) => {
    node.lastTraversed = true;
    node.visitCount++;
    if (!node.isTerminal()) {
      node.accumulatedValue += finalValue;
    }
  });

  return tree;
}

function resetLastTraversed(tree: MNode): MNode {
  tree.lastTraversed = false;
  tree.children.forEach((c) => resetLastTraversed(c));
  return tree;
}

function flattenTree(tree: MNode): MNode[] {
  let nodes: MNode[] = [];
  nodes.push(tree);
  tree.children.forEach((c) => nodes.push(...flattenTree(c)));
  return nodes;
}

type TreePlotProps = {
  tree: MNode;
  showVisitCount: boolean;
};

export function TreePlot({ tree, showVisitCount }: TreePlotProps) {
  const plotRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // d3 trees render horizontally, so we perform a manual rotation after rendering
    const endHeight = 400;
    const endWidth = 1400;
    const maxVisitCount = tree.visitCount;

    const svg = Plot.plot({
      height: endWidth,
      width: endHeight,
      margin: 10,
      axis: null,
      color: {
        scheme: "RdYlGn",
      },
      marks: [
        Plot.tree(flattenTree(tree), {
          path: "name",
          delimiter: ".",
          r: (d: MNode) => (d.lastTraversed ? 4 : 1),
          symbol: (d: MNode) => (d.isTerminal() ? "star" : "circle"),
          fill: (d: MNode) => d.avgValue(),
          stroke: (d: MNode) => {
            if (showVisitCount) {
              return d3.interpolateTurbo(
                (d.visitCount / (maxVisitCount + 1)) ** 0.2,
              );
            }
            if (d.isTerminal() && d.visitCount == 0) {
              return 0;
            }
            return d.avgValue();
          },
          strokeWidth: (d: MNode) => (d.lastTraversed ? 4 : 1),
          text: "null",
        }),
      ],
    });

    // Manually rotate the svg so that our tree renders top to bottom
    const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
    g.setAttribute("transform", `rotate(90, 0, 0) translate(0, -${endWidth})`);
    while (svg.firstChild) {
      g.appendChild(svg.firstChild);
    }
    svg.appendChild(g);
    svg.setAttribute("viewBox", `0 0 ${endWidth} ${endHeight}`);
    svg.setAttribute("width", `${endWidth}px`);
    svg.setAttribute("height", `${endHeight}px`);

    plotRef.current!.replaceChildren(svg);

    return () => {
      plotRef.current!.removeChild(svg);
    };
  }, [tree, showVisitCount]);

  return <div ref={plotRef} />;
}
