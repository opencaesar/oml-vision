import App from "./App";
import { createRoot } from "react-dom/client";
import { LayoutProvider } from "./contexts/LayoutProvider";
import "./index.css";
import "@nasa-jpl/react-stellar/dist/esm/stellar.css";
import React from "react";
 
const container = document.getElementById("root");
const root = createRoot(container!);
root.render(<LayoutProvider><App /></LayoutProvider>);