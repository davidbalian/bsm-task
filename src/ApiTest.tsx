import React, { useState } from "react";

interface ApiResponse {
  [key: string]: any;
}

const ApiTest: React.FC = () => {
  const [response, setResponse] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [requestBody, setRequestBody] = useState("{}");

  const testApi = async () => {
    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      const apiUrl =
        "https://prod-179.westeurope.logic.azure.com/workflows/7c84997dd6894507a60796acb06e5c43/triggers/manual/paths/invoke?api-version=2016-10-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=6hFoizfo2w62d0iQK_Zyt7a3Ycr9akAkXdCPAG0ecwQ";

      const parsedBody = JSON.parse(requestBody);

      const res = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(parsedBody),
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();
      setResponse(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h2>API Test Page</h2>
      <p>Testing the calendar API endpoint</p>

      <div style={{ marginBottom: "20px" }}>
        <label
          htmlFor="requestBody"
          style={{ display: "block", marginBottom: "5px" }}
        >
          Request Body (JSON):
        </label>
        <textarea
          id="requestBody"
          value={requestBody}
          onChange={(e) => setRequestBody(e.target.value)}
          rows={5}
          cols={50}
          style={{ fontFamily: "monospace", width: "100%" }}
        />
      </div>

      <button
        onClick={testApi}
        disabled={loading}
        style={{
          padding: "10px 20px",
          backgroundColor: loading ? "#ccc" : "#007bff",
          color: "white",
          border: "none",
          borderRadius: "4px",
          cursor: loading ? "not-allowed" : "pointer",
        }}
      >
        {loading ? "Testing..." : "Test API"}
      </button>

      {error && (
        <div
          style={{
            marginTop: "20px",
            color: "red",
            backgroundColor: "#ffe6e6",
            padding: "10px",
            borderRadius: "4px",
          }}
        >
          <strong>Error:</strong> {error}
        </div>
      )}

      {response && (
        <div style={{ marginTop: "20px" }}>
          <h3>Response:</h3>
          <pre
            style={{
              backgroundColor: "#f5f5f5",
              padding: "10px",
              borderRadius: "4px",
              overflow: "auto",
              maxHeight: "400px",
              fontSize: "12px",
            }}
          >
            {JSON.stringify(response, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default ApiTest;
