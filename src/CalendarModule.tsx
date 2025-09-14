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

  const formatDateRange = (
    startDate: string,
    endDate: string,
    isFullDay: string
  ) => {
    if (!startDate || !endDate) return "No date";

    try {
      const start = new Date(startDate);
      const end = new Date(endDate);

      if (isFullDay === "TRUE") {
        return start.toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        });
      }

      const startFormatted = start.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });

      const endFormatted = end.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });

      // If same day, show time range
      if (start.toDateString() === end.toDateString()) {
        return `${startFormatted} - ${end.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
        })}`;
      }

      return `${startFormatted} to ${endFormatted}`;
    } catch {
      return `${startDate} to ${endDate}`;
    }
  };

  const stripHtml = (html: string) => {
    const tmp = document.createElement("DIV");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
  };

  const getEventTitle = (event: Event) => {
    return event.Title || "Untitled Event";
  };

  const getEventLocation = (event: Event) => {
    const parts = [
      event.AddressLine1,
      event.AddressLine2,
      event.City,
      event.PostCode,
      event.Country,
    ].filter(Boolean);

    return parts.length > 0 ? parts.join(", ") : "Location not specified";
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
              key={event.ID || index}
              style={{
                border: "1px solid #ddd",
                borderRadius: "8px",
                padding: "15px",
                marginBottom: "15px",
                backgroundColor: "#f9f9f9",
                boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
              }}
            >
              {event.BannerUrl && (
                <img
                  src={event.BannerUrl}
                  alt={event.Title}
                  style={{
                    width: "100%",
                    maxHeight: "200px",
                    objectFit: "cover",
                    borderRadius: "4px",
                    marginBottom: "10px",
                  }}
                />
              )}

              <h3 style={{ margin: "0 0 10px 0", color: "#333" }}>
                {getEventTitle(event)}
              </h3>

              <div style={{ marginBottom: "10px" }}>
                <span
                  style={{
                    backgroundColor: "#007bff",
                    color: "white",
                    padding: "2px 8px",
                    borderRadius: "12px",
                    fontSize: "12px",
                    fontWeight: "bold",
                  }}
                >
                  {event.Category}
                </span>
              </div>

              <p style={{ margin: "5px 0", color: "#666" }}>
                <strong>📅 Date:</strong>{" "}
                {formatDateRange(
                  event.EventStartDate,
                  event.EventEndDate,
                  event.FullDayEvent
                )}
              </p>

              <p style={{ margin: "5px 0", color: "#666" }}>
                <strong>📍 Location:</strong> {getEventLocation(event)}
              </p>

              {event.Description && (
                <div style={{ margin: "10px 0" }}>
                  <strong>Description:</strong>
                  <div
                    style={{
                      marginTop: "5px",
                      color: "#555",
                      lineHeight: "1.4",
                    }}
                    dangerouslySetInnerHTML={{ __html: event.Description }}
                  />
                </div>
              )}

              <div
                style={{
                  marginTop: "10px",
                  paddingTop: "10px",
                  borderTop: "1px solid #eee",
                  fontSize: "12px",
                  color: "#888",
                }}
              >
                <span>By {event.Author}</span>
                {event.Author !== event.Editor && (
                  <span> • Edited by {event.Editor}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CalendarModule;
