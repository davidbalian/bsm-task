import React, { useState, useEffect } from "react";

interface Event {
  ID: number;
  Title: string;
  Category: string;
  BannerUrl: string;
  Description: string;
  AddressLine1: string;
  AddressLine2: string;
  PostCode: string | number;
  City: string;
  Country: string;
  EventStartDate: string;
  EventEndDate: string;
  FullDayEvent: string;
  Author: string;
  Editor: string;
  Created: string;
  Modified: string;
}

interface ApiResponse {
  value?: Event[];
}

const CalendarModule: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEvents = async () => {
    try {
      const apiUrl =
        "https://prod-179.westeurope.logic.azure.com/workflows/7c84997dd6894507a60796acb06e5c43/triggers/manual/paths/invoke?api-version=2016-10-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=6hFoizfo2w62d0iQK_Zyt7a3Ycr9akAkXdCPAG0ecwQ";

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}), // Empty body for now
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: ApiResponse = await response.json();

      // Extract events from the 'value' array
      const extractedEvents: Event[] = data.value || [];

      setEvents(extractedEvents);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch events");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "No date";

    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateString;
    }
  };

  const getEventTitle = (event: Event) => {
    return event.title || event.name || event.subject || "Untitled Event";
  };

  const getEventDate = (event: Event) => {
    return event.date || event.start || event.startDate || event.eventDate;
  };

  if (loading) {
    return (
      <div style={{ padding: "20px", textAlign: "center" }}>
        <h2>Upcoming Events</h2>
        <p>Loading events...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: "20px", textAlign: "center" }}>
        <h2>Upcoming Events</h2>
        <p style={{ color: "red" }}>Error: {error}</p>
        <button
          onClick={fetchEvents}
          style={{
            padding: "10px 20px",
            backgroundColor: "#007bff",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h2>Upcoming Events</h2>

      {events.length === 0 ? (
        <p>No upcoming events found.</p>
      ) : (
        <div>
          {events.map((event, index) => (
            <div
              key={event.id || index}
              style={{
                border: "1px solid #ddd",
                borderRadius: "8px",
                padding: "15px",
                marginBottom: "10px",
                backgroundColor: "#f9f9f9",
              }}
            >
              <h3 style={{ margin: "0 0 10px 0", color: "#333" }}>
                {getEventTitle(event)}
              </h3>
              <p style={{ margin: "5px 0", color: "#666" }}>
                <strong>Date:</strong> {formatDate(getEventDate(event))}
              </p>
              {event.description && (
                <p style={{ margin: "5px 0", color: "#666" }}>
                  <strong>Description:</strong> {event.description}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CalendarModule;
