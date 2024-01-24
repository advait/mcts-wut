import * as Plot from "@observablehq/plot";
import * as seedrandom from "seedrandom";

const rng = seedrandom("advait3000");

class MNode {
  name: string;
  accumulatedValue: number;
  children: MNode[] = [];
  visitCount: number = 0;

  constructor(name: string, initValue: number = 0) {
    this.name = name;
    this.accumulatedValue = initValue;
  }

  isTerminal(): boolean {
    return this.children.length == 0;
  }

  avgValue(): number {
    if (this.visitCount == 0) {
      return this.accumulatedValue;
    }

    return this.accumulatedValue / this.visitCount;
  }
}

function generateTree(
  maxDepth: number,
  terminalValueFn: (depth: number) => number,
  curDepth: number = 0,
  nodeName: string = "",
  fanout: number = 2,
): MNode {
  if (curDepth >= maxDepth) {
    return new MNode(nodeName, terminalValueFn(curDepth));
  }

  const ret: MNode = new MNode(nodeName);
  for (let i = 0; i < fanout; i++) {
    let childName = nodeName ? `${nodeName}.${i}` : `${i}`;
    ret.children.push(
      generateTree(maxDepth, terminalValueFn, curDepth + 1, childName, fanout),
    );
  }
  return ret;
}

function flattenTree(tree: MNode): MNode[] {
  let nodes: MNode[] = [];
  nodes.push(tree);
  tree.children.forEach((c) => nodes.push(...flattenTree(c)));
  return nodes;
}

function performRandomTraversal(tree: MNode) {
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
    node.visitCount++;
    node.accumulatedValue += finalValue;
  });
}

function renderPlot(tree: MNode): (SVGElement | HTMLElement) & Plot.Plot {
  // d3 trees render horizontally, so we perform a manual rotation after rendering
  const endHeight = 400;
  const endWidth = 1400;

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
        r: 4,
        symbol: (d: MNode) => (d.isTerminal() ? "square" : "circle"),
        fill: (d: MNode) => d.avgValue(),
        stroke: "gray",
        strokeWidth: 3,
        strokeLinecap: "square",
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

  return svg;
}

const div = document.querySelector<HTMLDivElement>("#app")!;

const but = document.createElement("button");
but.textContent = "Traverse";
but.onclick = () => {
  performRandomTraversal(tree);
  const plot = renderPlot(tree);
  div.replaceChild(plot, div.lastChild!);
};
div.appendChild(but);

const tree = generateTree(7, () => rng() * 2 - 1);
const plot = renderPlot(tree);

div.append(plot);
