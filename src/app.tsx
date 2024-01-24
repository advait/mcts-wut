import React from "react";
import { useState } from "react";
import {
  generateTree,
  performRandomTraversal,
  setTerminalValues,
  TreePlot,
  MNode,
} from "./tree";
import { Button, ButtonGroup, VStack } from "@chakra-ui/react";

function initTree(): MNode {
  const tree = generateTree(7);
  setTerminalValues(tree, (hRatio) => Math.sin(4 * hRatio * Math.PI));
  return tree;
}

export function App() {
  const [tree, setTree] = useState(initTree);

  const traverse = async (n: number = 1) => {
    for (let i = 0; i < n; i++) {
      setTree((tree) => {
        return performRandomTraversal(tree);
      });
      await sleep(24);
    }
  };

  return (
    <VStack mt={8}>
      <ButtonGroup>
        <Button variant="outline" onClick={() => setTree(initTree())}>
          Reset
        </Button>
        <Button onClick={() => traverse(1)}>Traverse</Button>
        <Button onClick={() => traverse(100)}>Traverse 100x</Button>
      </ButtonGroup>
      <TreePlot tree={tree} />;
    </VStack>
  );
}

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
