import React from "react";
import { Toaster } from "react-hot-toast";
import "./App.css";
import AppRoutes from "./routes/AppRoutes";

function App() {
  return (
    <>
      <Toaster position="top-right" toastOptions={{ duration: 2000 }} />
      <AppRoutes />
    </>
  );
}

export default App;
