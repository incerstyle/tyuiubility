import React from "react"
import ReactDOM from "react-dom/client"
import App from "./popup/app"
import "./popup.css"

const el = document.getElementById("root")

if (!el) {
  throw new Error("Root element not found")
}

const root = ReactDOM.createRoot(el)

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)