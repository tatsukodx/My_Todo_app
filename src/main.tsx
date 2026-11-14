import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { reverseSavedPriorities } from "./priority";

// 優先度の向き (1 が低い、3 が高い) を変えたので、前に保存したデータを先に直しておく
reverseSavedPriorities();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
