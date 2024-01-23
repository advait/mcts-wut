import "./style.css";

import * as Plot from "@observablehq/plot";

type Node = {
  d: number;
  i: number;
  value: number;
};

type Arrow = {
  d1: number;
  i1: number;
  d2: number;
  i2: number;
};

type Positioned =
  | {
      x: number;
      y: number;
    }
  | {
      x1: number;
      y1: number;
      x2: number;
      y2: number;
    };

/**
 * Given a set of nodes, return the set of arrows that connects the nodes up to a maximum.
 */
function nodesToArrows(nodes: Node[]): Arrow[] {
  const maxDepth = Math.max(...nodes.map((n) => n.d));
  const arrows: Arrow[] = [];

  nodes.forEach((n) => {
    if (n.d > maxDepth - 1) {
      return;
    }
    arrows.push({
      // Left child
      d1: n.d,
      i1: n.i,
      d2: n.d + 1,
      i2: n.i * 2,
    });
    arrows.push({
      // Left child
      d1: n.d,
      i1: n.i,
      d2: n.d + 1,
      i2: n.i * 2 + 1,
    });
  });

  return arrows;
}

// Project something's depth and index into an xy coord system
function projectDI(d: number, i: number) {
  const xs = 2 ** d + 1; // Number of xs horizontally in this row
  const x = (i + 1) / xs;
  const y = depth - d;
  return { x, y };
}

function projectObj(obj: Node | Arrow): Positioned {
  obj = { ...obj };
  if ((obj as Node).d !== undefined) {
    obj = obj as Node;
    const p1 = projectDI(obj.d, obj.i);
    return { ...obj, ...p1 };
  } else if ((obj as Arrow).d1 !== undefined) {
    obj = obj as Arrow;
    const p1 = projectDI(obj.d1, obj.i1);
    const p2 = projectDI(obj.d2, obj.i2);
    return { ...obj, x1: p1.x, y1: p1.y, x2: p2.x, y2: p2.y };
  } else {
    throw new Error("Invalid object");
  }
}

function generateTreeData(depth: number): Node[] {
  let data = [];

  for (let d = 0; d < depth; d++) {
    const xs = 2 ** d; // Number of xs horizontally
    for (let i = 0; i < xs; i++) {
      data.push({ d, i, value: d * i });
    }
  }
  return data;
}

function renderPlot(tree: Node[]): (SVGElement | HTMLElement) & Plot.Plot {
  const arrows = nodesToArrows(tree).map(projectObj);
  const points = tree.map(projectObj);
  return Plot.plot({
    marks: [
      Plot.arrow(arrows, {
        x1: "x1",
        x2: "x2",
        y1: "y1",
        y2: "y2",
        stroke: "lightgray",
      }),
      Plot.dot(points, { x: "x", y: "y", fill: "value" }),
    ],
  });
}

const depth = 6;
const tree = generateTreeData(depth);
const plot = renderPlot(tree);

const div = document.querySelector<HTMLDivElement>("#app")!;
div.append(plot);
