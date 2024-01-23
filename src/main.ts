import "./style.css";

import * as Plot from "@observablehq/plot";

type MctsNode = {
  name: string;
  children: MctsNode[];
};

function generateTree(
  maxDepth: number,
  curDepth: number = 0,
  nodeName: string = "",
  fanout: number = 2,
): MctsNode {
  if (curDepth >= maxDepth) {
    return { name: nodeName, children: [] };
  }

  const ret: MctsNode = { name: nodeName, children: [] };
  for (let i = 0; i < fanout; i++) {
    let childName = nodeName ? `${nodeName}.${i}` : `${i}`;
    ret.children.push(generateTree(maxDepth, curDepth + 1, childName, fanout));
  }
  return ret;
}

function flattenTree(tree: MctsNode): MctsNode[] {
  let nodes: MctsNode[] = [];
  nodes.push(tree);
  tree.children.forEach((c) => nodes.push(...flattenTree(c)));
  return nodes;
}

function renderPlot(tree: MctsNode): (SVGElement | HTMLElement) & Plot.Plot {
  return Plot.plot({
    height: 1200,
    width: 500,
    margin: 10,
    axis: null,
    marks: [
      Plot.tree(flattenTree(tree), {
        path: "name",
        delimiter: ".",
        fill: "gray",
        stroke: () => Math.random(),
        text: "null",
      }),
    ],
    style: {
      transform: "rotate(90deg)",
    },
  });
}

const div = document.querySelector<HTMLDivElement>("#app")!;
const tree = generateTree(7);
const plot = renderPlot(tree);
div.append(plot);
