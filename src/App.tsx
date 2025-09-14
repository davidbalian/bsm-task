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
      }}
    >
      <CalendarModule />
    </div>
  );
}

export default App;
