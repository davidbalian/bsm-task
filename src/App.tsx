import React from "react";
import "./App.css";
import CalendarModule from "./CalendarModule";

function App() {
  return (
    <div
      className="App"
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "20px",
      }}
    >
      <CalendarModule />
    </div>
  );
}

export default App;
