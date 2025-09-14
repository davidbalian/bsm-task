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

  const formatDateBox = (startDate: string) => {
    if (!startDate) return "N/A";

    try {
      const date = new Date(startDate);
      const monthNames = [
        "JAN",
        "FEB",
        "MAR",
        "APR",
        "MAY",
        "JUN",
        "JUL",
        "AUG",
        "SEP",
        "OCT",
        "NOV",
        "DEC",
      ];
      const month = monthNames[date.getMonth()];
      const day = date.getDate().toString().padStart(2, "0");
      return `${month} ${day}`;
    } catch {
      return "N/A";
    }
  };

  const formatFullDateTime = (
    startDate: string,
    endDate: string,
    isFullDay: string
  ) => {
    if (!startDate || !endDate) return "Date not available";

    try {
      const start = new Date(startDate);
      const end = new Date(endDate);

      if (isFullDay === "TRUE") {
        return start.toLocaleDateString("en-US", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        });
      }

      const startFormatted = start.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      });

      const endFormatted = end.toLocaleDateString("en-US", {
        hour: "numeric",
        minute: "2-digit",
      });

      if (start.toDateString() === end.toDateString()) {
        return `${startFormatted} - ${endFormatted}`;
      }

      return `${startFormatted} to ${end.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      })}`;
    } catch {
      return `${startDate} to ${endDate}`;
    }
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

  const formatCreatedModifiedInfo = (
    author: string,
    created: string,
    editor: string,
    modified: string
  ) => {
    const formatTimestamp = (timestamp: string) => {
      try {
        const date = new Date(timestamp);
        return date.toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
          hour: "numeric",
          minute: "2-digit",
        });
      } catch {
        return timestamp;
      }
    };

    return {
      created: `Created by ${author || "Unknown"} at ${formatTimestamp(
        created
      )}`,
      modified:
        author !== editor
          ? `Modified by ${editor || "Unknown"} at ${formatTimestamp(modified)}`
          : null,
    };
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
      <div
        style={{
          padding: "20px",
          textAlign: "center",
          maxWidth: "380px",
          width: "100%",
          backgroundColor: "var(--color-background)",
        }}
      >
        <h2
          style={{
            fontSize: "var(--font-size-heading-2)",
            fontWeight: "var(--font-weight-heading-2)",
            color: "var(--color-normal)",
          }}
        >
          Upcoming Events
        </h2>
        <p
          style={{
            fontSize: "var(--font-size-plain-text)",
            fontWeight: "var(--font-weight-plain-text)",
            color: "var(--color-normal)",
          }}
        >
          Loading events...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          padding: "20px",
          textAlign: "center",
          maxWidth: "380px",
          width: "100%",
          backgroundColor: "var(--color-background)",
        }}
      >
        <h2
          style={{
            fontSize: "var(--font-size-heading-2)",
            fontWeight: "var(--font-weight-heading-2)",
            color: "var(--color-normal)",
          }}
        >
          Upcoming Events
        </h2>
        <p
          style={{
            color: "rgb(213, 17, 31)",
            fontSize: "var(--font-size-plain-text)",
            fontWeight: "var(--font-weight-plain-text)",
          }}
        >
          Error: {error}
        </p>
        <button
          onClick={fetchEvents}
          style={{
            padding: "10px 20px",
            backgroundColor: "var(--color-link)",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "var(--color-link-hover)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "var(--color-link)";
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div
      style={{
        padding: "20px",
        maxWidth: "380px",
        width: "100%",
        backgroundColor: "var(--color-background)",
      }}
    >
      <h2
        style={{
          fontSize: "var(--font-size-heading-2)",
          fontWeight: "var(--font-weight-heading-2)",
          color: "var(--color-normal)",
        }}
      >
        Upcoming Events
      </h2>

      {events.length === 0 ? (
        <p>No upcoming events found.</p>
      ) : (
        <div style={{ marginTop: "20px" }}>
          {events.map((event, index) => (
            <div
              key={event.ID || index}
              onClick={() => handleEventClick(event)}
              style={{
                fontSize: "var(--font-size-plain-text)",
                fontWeight: "var(--font-weight-plain-text)",
                color: "var(--color-normal)",
                marginBottom: "10px",
                padding: "8px 0",
                borderBottom: "1px solid #eee",
                cursor: "pointer",
                transition: "background-color 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor =
                  "var(--color-background-hover)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor =
                  "var(--color-background)";
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
          title: "",
          subText: "",
        }}
        modalProps={{
          isBlocking: false,
          styles: {
            main: {
              width: "90vw",
              maxWidth: 1200,
              minHeight: 600,
            },
          },
          className: "custom-dialog",
        }}
      >
        {selectedEvent && (
          <div
            style={{
              fontSize: "var(--font-size-plain-text)",
              fontWeight: "var(--font-weight-plain-text)",
              color: "var(--color-normal)",
            }}
          >
            {/* Row 1: Banner Image and Date/Title/Type */}
            <div style={{ display: "flex", marginBottom: "20px", gap: "20px" }}>
              {/* Column 1: Banner Image (65%) */}
              <div style={{ flex: "0 0 65%" }}>
                {selectedEvent.BannerUrl ? (
                  <img
                    src={selectedEvent.BannerUrl}
                    alt={getEventTitle(selectedEvent)}
                    style={{
                      width: "100%",
                      height: "250px",
                      objectFit: "cover",
                      borderRadius: "8px",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: "100%",
                      height: "250px",
                      backgroundColor: "#f0f0f0",
                      borderRadius: "8px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#666",
                      fontSize: "16px",
                    }}
                  >
                    No banner image available
                  </div>
                )}
              </div>

              {/* Column 2: Date Box, Title, Type (35%) */}
              <div
                style={{
                  flex: "0 0 35%",
                  display: "flex",
                  flexDirection: "column",
                  gap: "15px",
                }}
              >
                {/* Date Box */}
                <div
                  style={{
                    backgroundColor: "#007bff",
                    color: "white",
                    padding: "15px",
                    borderRadius: "8px",
                    textAlign: "center",
                    fontSize: "18px",
                    fontWeight: "bold",
                  }}
                >
                  {formatDateBox(selectedEvent.EventStartDate)}
                </div>

                {/* Title */}
                <div>
                  <h2
                    style={{
                      margin: "0 0 8px 0",
                      color: "var(--color-normal)",
                      fontSize: "var(--font-size-heading-2)",
                      fontWeight: "var(--font-weight-heading-2)",
                      lineHeight: "1.3",
                    }}
                  >
                    {getEventTitle(selectedEvent)}
                  </h2>

                  {/* Type/Category */}
                  <div
                    style={{
                      display: "inline-block",
                      backgroundColor: "#e9ecef",
                      color: "#495057",
                      padding: "4px 12px",
                      borderRadius: "16px",
                      fontSize: "14px",
                      fontWeight: "500",
                    }}
                  >
                    {selectedEvent.Category || "Event"}
                  </div>
                </div>
              </div>
            </div>

            {/* Row 2: Description and Date/Time & Location */}
            <div style={{ display: "flex", gap: "20px", marginBottom: "20px" }}>
              {/* Column 1: Description (65%) */}
              <div style={{ flex: "0 0 65%" }}>
                <h3
                  style={{
                    margin: "0 0 10px 0",
                    color: "#333",
                    fontSize: "16px",
                    fontWeight: "600",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                  }}
                >
                  Description
                </h3>
                <div
                  style={{
                    maxHeight: "200px",
                    overflowY: "auto",
                    padding: "15px",
                    border: "1px solid #e1e1e1",
                    borderRadius: "6px",
                    backgroundColor: "#fafafa",
                    scrollbarWidth: "thin",
                    scrollbarColor: "#ccc #f0f0f0",
                  }}
                  className="custom-scrollbar"
                >
                  {selectedEvent.Description ? (
                    <div
                      dangerouslySetInnerHTML={{
                        __html: selectedEvent.Description,
                      }}
                      style={{ color: "#555", lineHeight: "1.5" }}
                    />
                  ) : (
                    <p
                      style={{ color: "#888", fontStyle: "italic", margin: 0 }}
                    >
                      No description available
                    </p>
                  )}
                </div>
              </div>

              {/* Column 2: Date & Time and Location (35%) */}
              <div style={{ flex: "0 0 35%" }}>
                {/* Date & Time Section */}
                <div style={{ marginBottom: "20px" }}>
                  <h3
                    style={{
                      margin: "0 0 10px 0",
                      color: "#333",
                      fontSize: "16px",
                      fontWeight: "600",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                    }}
                  >
                    Date & Time
                  </h3>
                  <p
                    style={{
                      margin: "0 0 10px 0",
                      color: "#555",
                      lineHeight: "1.4",
                    }}
                  >
                    {formatFullDateTime(
                      selectedEvent.EventStartDate,
                      selectedEvent.EventEndDate,
                      selectedEvent.FullDayEvent
                    )}
                  </p>
                  <a
                    href="#"
                    style={{
                      color: "var(--color-link)",
                      textDecoration: "none",
                      fontSize: "var(--font-size-plain-text)",
                      fontWeight: "var(--font-weight-plain-text)",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = "var(--color-link-hover)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = "var(--color-link)";
                    }}
                    onClick={(e) => {
                      e.preventDefault();
                      // Add to calendar functionality would go here
                      alert(
                        "Add to Calendar functionality would be implemented here"
                      );
                    }}
                  >
                    📅 Add to Calendar
                  </a>
                </div>

                {/* Location Section */}
                <div>
                  <h3
                    style={{
                      margin: "0 0 10px 0",
                      color: "#333",
                      fontSize: "16px",
                      fontWeight: "600",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                    }}
                  >
                    Location
                  </h3>
                  <p
                    style={{
                      margin: "0 0 10px 0",
                      color: "#555",
                      lineHeight: "1.4",
                    }}
                  >
                    {getEventLocation(selectedEvent)}
                  </p>
                  <a
                    href="#"
                    style={{
                      color: "var(--color-link)",
                      textDecoration: "none",
                      fontSize: "var(--font-size-plain-text)",
                      fontWeight: "var(--font-weight-plain-text)",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = "var(--color-link-hover)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = "var(--color-link)";
                    }}
                    onClick={(e) => {
                      e.preventDefault();
                      // View map functionality would go here
                      alert("View Map functionality would be implemented here");
                    }}
                  >
                    🗺️ View Map
                  </a>
                </div>
              </div>
            </div>

            {/* Row 3: Created/Modified Information */}
            <div style={{ borderTop: "1px solid #e1e1e1", paddingTop: "15px" }}>
              {(() => {
                const info = formatCreatedModifiedInfo(
                  selectedEvent.Author,
                  selectedEvent.Created,
                  selectedEvent.Editor,
                  selectedEvent.Modified
                );
                return (
                  <div style={{ color: "#777", fontSize: "13px" }}>
                    <div style={{ marginBottom: "4px" }}>{info.created}</div>
                    {info.modified && <div>{info.modified}</div>}
                  </div>
                );
              })()}
            </div>
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
