/*
This file starts the React app, loads the self-hosted fonts, and registers the offline service worker.
Edit this file when app-wide startup behavior changes.
Do not copy this file. Change it when the whole frontend app bootstrap changes.
*/

import React from "react";
import ReactDOM from "react-dom/client";
import "@fontsource-variable/fraunces/soft.css";
import "@fontsource-variable/manrope";
import "@fontsource-variable/jetbrains-mono";
import { App } from "./app/App";
import "./index.css";

if ("serviceWorker" in navigator) {
  void import("virtual:pwa-register").then(({ registerSW }) => registerSW({ immediate: true }));
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
