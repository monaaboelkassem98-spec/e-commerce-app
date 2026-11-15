import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom"; // <-- ضيفي السطر ده
import App from "./App.jsx";
import "bootstrap/dist/css/bootstrap.min.css";
import "./styles/global.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter> {/* <-- غلفي App بـ BrowserRouter */}
      <App />
    </BrowserRouter>
  </React.StrictMode>
);