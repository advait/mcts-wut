import * as Plot from "@observablehq/plot";

type MctsNode = {
  name: string;
  value: number;
  children: MctsNode[];
};

function generateTree(
  maxDepth: number,
  terminalValueFn: (depth: number) => number,
  curDepth: number = 0,
  nodeName: string = "",
  fanout: number = 2,
): MctsNode {
  if (curDepth >= maxDepth) {
    return { name: nodeName, value: terminalValueFn(curDepth), children: [] };
  }

  const ret: MctsNode = { name: nodeName, value: 0, children: [] };
  for (let i = 0; i < fanout; i++) {
    let childName = nodeName ? `${nodeName}.${i}` : `${i}`;
    ret.children.push(
      generateTree(maxDepth, terminalValueFn, curDepth + 1, childName, fanout),
    );
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
    height: 1400,
    width: 400,
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
        symbol: (d: MctsNode) => (d.children.length ? "circle" : "square"),
        fill: (d) => d.value,
        stroke: "gray",
        strokeWidth: 3,
        strokeLinecap: "square",
        text: "null",
      }),
    ],
    style: {
      transform: "rotate(90deg)",
    },
  });
}

const div = document.querySelector<HTMLDivElement>("#app")!;
const tree = generateTree(7, () => Math.random() * 2 - 1);
const plot = renderPlot(tree);
div.append(plot);
