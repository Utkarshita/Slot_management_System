// import React from 'react'
// import ReactDOM from 'react-dom/client'
// import App from './App.jsx'
// import './index.css'

// ReactDOM.createRoot(document.getElementById('root')).render(
//   <React.StrictMode>
//     <App />
//   </React.StrictMode>,
// )

import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { Toaster } from "react-hot-toast";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />

    <Toaster
      position="top-right"
      reverseOrder={false}
      gutter={12}
      toastOptions={{
        duration: 3000,
        style: {
          background: "#ffffff",
          color: "#333",
          borderRadius: "12px",
          padding: "14px 18px",
          fontWeight: "600",
          boxShadow: "0 10px 30px rgba(0,0,0,.12)",
        },

        success: {
          style: {
            borderLeft: "5px solid #16a34a",
          },
        },

        error: {
          style: {
            borderLeft: "5px solid #dc2626",
          },
        },
      }}
    />
  </React.StrictMode>
);