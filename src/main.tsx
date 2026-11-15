import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import Root from "./Root";
import { reverseSavedPriorities } from "./priority";
import { installButtonSounds } from "./sound";

// 優先度の向き (1 が低い、3 が高い) を変えたので、前に保存したデータを先に直しておく
reverseSavedPriorities();
// ボタンを押したときの「決定」の音
installButtonSounds();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Root />
  </StrictMode>,
);
