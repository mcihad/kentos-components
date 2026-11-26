import "./index.css";

import { configureAppearance } from "@kentos/components/lib/theme";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./app";

// The same key as data-storage-key on theme-init.js in index.html.
configureAppearance({ storageKey: "kentos-showcase-appearance" });

const root = document.getElementById("root");
if (root) {
  createRoot(root).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}
