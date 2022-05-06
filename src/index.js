import React from "react";
// import ReactDOM from "react-dom";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { Provider, createClient } from "wagmi";
import { InjectedConnector } from "wagmi/connectors/injected";

const desiredChain = "gnosis";
const desiredChainId = 100;

// Set up wagmi connectors
const client = createClient({
  autoConnect: true,
  connectors({ chainId }) {
    return [
      new InjectedConnector({
        options: {
          chainId: desiredChainId,
        },
      }),
    ];
  },
});

const container = document.getElementById("root");
const root = createRoot(container);
root.render(
  <Provider client={client}>
    <App />
  </Provider>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
