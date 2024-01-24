import {
  ChakraProvider,
  Container,
  extendTheme,
  type ThemeConfig,
} from "@chakra-ui/react";
import * as React from "react";
import * as ReactDOM from "react-dom/client";

import { App } from "./app";

const config: ThemeConfig = {
  initialColorMode: "dark",
  useSystemColorMode: false,
};

const theme = extendTheme({
  config,
});

const rootElement = document.getElementById("root");
ReactDOM.createRoot(rootElement!).render(
  <React.StrictMode>
    <ChakraProvider theme={theme}>
      <Container width="1400px" maxWidth="1400px">
        <App />
      </Container>
    </ChakraProvider>
  </React.StrictMode>,
);
