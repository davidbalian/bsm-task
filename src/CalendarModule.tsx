import React, { useState, useEffect } from "react";
import { Dialog, DialogType, DialogFooter } from "@fluentui/react/lib/Dialog";
import { PrimaryButton, DefaultButton } from "@fluentui/react/lib/Button";

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
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

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

  const formatEventDate = (startDate: string, isFullDay: string) => {
    if (!startDate) return "No date";

    try {
      const start = new Date(startDate);
      const now = new Date();
      const diffInMs = start.getTime() - now.getTime();
      const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
      const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));

      // If event is less than a week away, show friendly format
      if (diffInMs > 0 && diffInDays < 7) {
        if (diffInHours < 24) {
          if (diffInHours === 1) return "in 1 hour";
          return `in ${diffInHours} hours`;
        } else if (diffInDays === 1) {
          return "in 1 day";
        } else {
          return `in ${diffInDays} days`;
        }
      }

      // Otherwise, show full date in MM/DD/YYYY format
      const month = (start.getMonth() + 1).toString().padStart(2, "0");
      const day = start.getDate().toString().padStart(2, "0");
      const year = start.getFullYear();
      return `${month}/${day}/${year}`;
    } catch {
      return startDate;
    }
  };

  const getEventTitle = (event: Event) => {
    return event.Title || "Untitled Event";
  };

  const handleEventClick = (event: Event) => {
    setSelectedEvent(event);
    setIsDialogOpen(true);
  };

  const handleDialogDismiss = () => {
    setIsDialogOpen(false);
    setSelectedEvent(null);
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
        <div style={{ marginTop: "20px" }}>
          {events.map((event, index) => (
            <div
              key={event.ID || index}
              onClick={() => handleEventClick(event)}
              style={{
                fontSize: "18px",
                marginBottom: "10px",
                padding: "8px 0",
                borderBottom: "1px solid #eee",
                cursor: "pointer",
                transition: "background-color 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#f5f5f5";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
              }}
            >
              {getEventTitle(event)} -{" "}
              {formatEventDate(event.EventStartDate, event.FullDayEvent)}
            </div>
          ))}
        </div>
      )}

      {/* Event Details Dialog */}
      <Dialog
        hidden={!isDialogOpen}
        onDismiss={handleDialogDismiss}
        dialogContentProps={{
          type: DialogType.normal,
          title: selectedEvent ? getEventTitle(selectedEvent) : "Event Details",
          subText: "Complete event information from the API",
        }}
        modalProps={{
          isBlocking: false,
          styles: { main: { maxWidth: 600 } },
        }}
      >
        {selectedEvent && (
          <div style={{ maxHeight: "400px", overflowY: "auto" }}>
            {Object.entries(selectedEvent).map(([key, value]) => (
              <div
                key={key}
                style={{
                  marginBottom: "12px",
                  padding: "8px",
                  border: "1px solid #e1e1e1",
                  borderRadius: "4px",
                  backgroundColor: "#f8f9fa",
                }}
              >
                <div
                  style={{
                    fontWeight: "bold",
                    color: "#333",
                    marginBottom: "4px",
                  }}
                >
                  {key}:
                </div>
                <div
                  style={{
                    color: "#666",
                    fontFamily: "monospace",
                    wordWrap: "break-word",
                  }}
                >
                  {value !== null && value !== undefined
                    ? String(value)
                    : "N/A"}
                </div>
              </div>
            ))}
          </div>
        )}

        <DialogFooter>
          <PrimaryButton onClick={handleDialogDismiss} text="Close" />
        </DialogFooter>
      </Dialog>
    </div>
  );
};

export default CalendarModule;
