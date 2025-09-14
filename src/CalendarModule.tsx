import React, { useState, useEffect, useRef } from "react";
import { Dialog, DialogType } from "@fluentui/react/lib/Dialog";
import { DefaultButton } from "@fluentui/react/lib/Button";
import { Calendar, X } from "lucide-react";
import "./DialogStyles.css";

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
  const [showScrollbar, setShowScrollbar] = useState(false);
  const eventsContainerRef = useRef<HTMLDivElement>(null);

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

  // Check if content overflows and force scrollbar visibility
  useEffect(() => {
    const checkOverflow = () => {
      if (eventsContainerRef.current) {
        const container = eventsContainerRef.current;
        const hasOverflow = container.scrollHeight > container.clientHeight;
        setShowScrollbar(hasOverflow);
      }
    };

    // Check immediately after events are loaded
    if (events.length > 0) {
      // Use setTimeout to ensure DOM is updated
      setTimeout(checkOverflow, 0);
    }
  }, [events]);

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
          maxWidth: "380px",
          width: "100%",
          backgroundColor: "white",
          textAlign: "left",
        }}
      >
        <h2
          style={{
            fontSize: "var(--font-size-heading-2)",
            fontWeight: "var(--font-weight-heading-2)",
            color: "var(--color-normal)",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <Calendar size={20} />
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
          maxWidth: "380px",
          width: "100%",
          backgroundColor: "white",
          textAlign: "left",
        }}
      >
        <h2
          style={{
            fontSize: "var(--font-size-heading-2)",
            fontWeight: "var(--font-weight-heading-2)",
            color: "var(--color-normal)",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <Calendar size={20} />
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
        backgroundColor: "white",
        textAlign: "left",
      }}
    >
      <h2
        style={{
          fontSize: "var(--font-size-heading-2)",
          fontWeight: "var(--font-weight-heading-2)",
          color: "var(--color-normal)",
          display: "flex",
          alignItems: "center",
          gap: "8px",
          marginBottom: "20px",
        }}
      >
        <Calendar size={20} />
        Upcoming Events
      </h2>

      {events.length === 0 ? (
        <p>No upcoming events found.</p>
      ) : (
        <div
          ref={eventsContainerRef}
          className="calendar-events"
          style={{
            maxHeight: "60vh",
            overflowY: showScrollbar ? "scroll" : "auto",
          }}
        >
          {events.map((event, index) => (
            <div
              key={event.ID || index}
              style={{
                fontSize: "var(--font-size-plain-text)",
                fontWeight: "var(--font-weight-plain-text)",
                margin: 0,
                padding: "8px 0",
                border: "none",
                cursor: "pointer",
                transition: "background-color 0s, color 0s",
                backgroundColor:
                  index % 2 === 0 ? "var(--color-background)" : "transparent",
                textAlign: "left",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor =
                  "var(--color-background-hover)";
                e.currentTarget.style.transition =
                  "background-color 150ms ease, color 150ms ease";
                // Find and style the anchor tag
                const anchor = e.currentTarget.querySelector(
                  "a"
                ) as HTMLElement;
                if (anchor) {
                  anchor.style.color = "var(--color-link-hover)";
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor =
                  index % 2 === 0 ? "var(--color-background)" : "transparent";
                e.currentTarget.style.transition =
                  "background-color 0s, color 0s";
                // Reset the anchor tag color
                const anchor = e.currentTarget.querySelector(
                  "a"
                ) as HTMLElement;
                if (anchor) {
                  anchor.style.color = "var(--color-link)";
                }
              }}
            >
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  handleEventClick(event);
                }}
                style={{
                  color: "var(--color-link)",
                  transition: "color 0s",
                  textAlign: "left",
                  padding: "0.25rem 0.5rem",
                  textDecoration: "none",
                  display: "block",
                }}
              >
                {getEventTitle(event)} -{" "}
                {formatEventDate(event.EventStartDate, event.FullDayEvent)}
              </a>
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
              width: "70vw",
              maxWidth: 1000,
              minHeight: 600,
              borderRadius: "0.5rem",
              padding: 0,
            },
            root: {
              selectors: {
                ".ms-Dialog-header": {
                  display: "none",
                },
                ".ms-Dialog-inner": {
                  padding: 0,
                },
              },
            },
          },
          className: "custom-dialog",
        }}
      >
        {selectedEvent && (
          <div className="dialog-content">
            {/* Row 1: Banner Image and Date/Title/Type */}
            <div className="event-header-row">
              {/* Column 1: Banner Image (65%) */}
              <div className="banner-column">
                {selectedEvent.BannerUrl ? (
                  <img
                    className="event-banner-image"
                    src={selectedEvent.BannerUrl}
                    alt={getEventTitle(selectedEvent)}
                  />
                ) : (
                  <div className="banner-placeholder">
                    No banner image available
                  </div>
                )}
              </div>

              {/* Column 2: Date Box, Title, Type (35%) */}
              <div className="event-details-column">
                {/* Date Box */}
                <div className="event-date-box">
                  {formatDateBox(selectedEvent.EventStartDate)}
                </div>

                <h2 className="event-title">{getEventTitle(selectedEvent)}</h2>

                {/* Type/Category */}
                <div className="event-category">
                  {selectedEvent.Category || "Event"}
                </div>
              </div>
            </div>

            {/* Row 2: Description and Date/Time & Location */}
            <div className="event-details-row">
              {/* Column 1: Description (65%) */}
              <div className="description-column">
                <h3 className="description-heading">Description</h3>
                <div className="description-content">
                  {selectedEvent.Description ? (
                    <div
                      className="description-text"
                      dangerouslySetInnerHTML={{
                        __html: selectedEvent.Description,
                      }}
                    />
                  ) : (
                    <p className="no-description">No description available</p>
                  )}
                </div>
              </div>

              {/* Column 2: Date & Time and Location (35%) */}
              <div className="datetime-location-column">
                {/* Date & Time Section */}
                <div className="datetime-section">
                  <h3 className="datetime-heading">Date & Time</h3>
                  <p className="datetime-info">
                    {formatFullDateTime(
                      selectedEvent.EventStartDate,
                      selectedEvent.EventEndDate,
                      selectedEvent.FullDayEvent
                    )}
                  </p>
                  <a
                    className="add-to-calendar-link"
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      // Add to calendar functionality would go here
                      alert(
                        "Add to Calendar functionality would be implemented here"
                      );
                    }}
                  >
                    Add to Calendar
                  </a>
                </div>

                {/* Location Section */}
                <div className="location-section">
                  <h3 className="location-heading">Location</h3>
                  <p className="location-info">
                    {getEventLocation(selectedEvent)}
                  </p>
                  <a
                    className="view-map-link"
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      // View map functionality would go here
                      alert("View Map functionality would be implemented here");
                    }}
                  >
                    View Map
                  </a>
                </div>
              </div>
            </div>

            {/* Row 3: Created/Modified Information */}
            <div className="metadata-section">
              {(() => {
                const info = formatCreatedModifiedInfo(
                  selectedEvent.Author,
                  selectedEvent.Created,
                  selectedEvent.Editor,
                  selectedEvent.Modified
                );
                return (
                  <div className="metadata-content">
                    <div className="created-info">{info.created}</div>
                    {info.modified && (
                      <div className="modified-info">{info.modified}</div>
                    )}
                  </div>
                );
              })()}
            </div>
          </div>
        )}

        <button
          className="dialog-close-button"
          onClick={handleDialogDismiss}
          style={{
            position: "absolute",
            top: "10px",
            right: "10px",
            background: "transparent",
            border: "none",
            cursor: "pointer",
            padding: "8px",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "rgba(0, 0, 0, 0.1)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "transparent";
          }}
        >
          <X size={20} />
        </button>
      </Dialog>
    </div>
  );
};

export default CalendarModule;
