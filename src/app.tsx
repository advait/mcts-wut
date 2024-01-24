import React from "react";
import { useState } from "react";
import {
  generateTree,
  performRandomTraversal,
  setTerminalValues,
  TreePlot,
  MNode,
} from "./tree";
import {
  Button,
  Card,
  FormControl,
  FormLabel,
  HStack,
  Heading,
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  SimpleGrid,
  Stat,
  StatGroup,
  StatHelpText,
  StatLabel,
  StatNumber,
  Switch,
  VStack,
} from "@chakra-ui/react";

function initTree(depth: number): MNode {
  const tree = generateTree(depth);
  setTerminalValues(tree, (hRatio) => Math.sin(4 * hRatio * Math.PI));
  return tree;
}

export function App() {
  const [depth, setDepth] = useState(7);
  const [tree, setTree] = useState(initTree(depth));
  const [showVisitCount, setShowVisitCount] = useState(false);

  const traverse = async (n: number = 1) => {
    for (let i = 0; i < n; i++) {
      setTree((tree) => {
        return performRandomTraversal(tree);
      });
      await sleep(24);
    }
  };

  return (
    <VStack mt={8} spacing={8} alignItems="flex-start">
      <Heading>Monte Carlo Tree Search (MCTS)</Heading>
      <TreePlot tree={tree} showVisitCount={showVisitCount} />;
      <HStack alignItems="flex-start" spacing={4} mt={4} width="100%">
        <Card p={4}>
          <FormControl as={SimpleGrid} columns={2} spacing={4} width="300px">
            <FormLabel htmlFor="showVisitCount">Show Visit Count</FormLabel>
            <Switch
              id="showVisitCount"
              isChecked={showVisitCount}
              onChange={() => setShowVisitCount(!showVisitCount)}
            />
            <FormLabel htmlFor="depth">Tree depth</FormLabel>
            <NumberInput
              id="depth"
              value={depth}
              onChange={(v) => {
                setDepth(parseInt(v));
                setTree(initTree(parseInt(v)));
              }}
            >
              <NumberInputField />
              <NumberInputStepper>
                <NumberIncrementStepper />
                <NumberDecrementStepper />
              </NumberInputStepper>
            </NumberInput>
          </FormControl>
        </Card>
        <Card p={4}>
          <HStack>
            <Button onClick={() => traverse(1)}>Traverse</Button>
            <Button onClick={() => traverse(100)}>Traverse 100x</Button>
            <Button variant="outline" onClick={() => setTree(initTree(depth))}>
              Reset
            </Button>
          </HStack>
        </Card>
        <Card p={4} width="300px">
          <StatGroup>
            <Stat>
              <StatLabel>Root Value</StatLabel>
              <StatNumber>{tree.avgValue().toFixed(2)}</StatNumber>
            </Stat>
            <Stat>
              <StatLabel>Policy</StatLabel>
              <HStack spacing={4}>
                {tree.children.map((child, i) => {
                  if (tree.visitCount == 0) {
                    return (
                      <StatNumber key={i}>
                        {(1 / tree.children.length).toFixed(2)}
                      </StatNumber>
                    );
                  }
                  return (
                    <StatNumber key={i}>
                      {(child.visitCount / tree.visitCount).toFixed(2)}
                    </StatNumber>
                  );
                })}
              </HStack>
            </Stat>
          </StatGroup>
        </Card>
      </HStack>
    </VStack>
  );
}

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
