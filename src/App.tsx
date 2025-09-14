import React, { useState } from "react";
import "./App.css";
import ApiTest from "./ApiTest";
import CalendarModule from "./CalendarModule";

function App() {
  const [activeTab, setActiveTab] = useState<"test" | "calendar">("calendar");

  return (
    <div className="App">
      <div
        style={{
          padding: "20px",
          borderBottom: "1px solid #ddd",
          marginBottom: "20px",
        }}
      >
        <button
          onClick={() => setActiveTab("test")}
          style={{
            padding: "10px 20px",
            marginRight: "10px",
            backgroundColor: activeTab === "test" ? "#007bff" : "#f8f9fa",
            color: activeTab === "test" ? "white" : "#333",
            border: "1px solid #ddd",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          API Test
        </button>
        <button
          onClick={() => setActiveTab("calendar")}
          style={{
            padding: "10px 20px",
            backgroundColor: activeTab === "calendar" ? "#007bff" : "#f8f9fa",
            color: activeTab === "calendar" ? "white" : "#333",
            border: "1px solid #ddd",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Calendar Module
        </button>
      </div>

      {activeTab === "test" && <ApiTest />}
      {activeTab === "calendar" && <CalendarModule />}
    </div>
  );
}

export default App;
