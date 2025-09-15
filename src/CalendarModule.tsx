import React, { useState, useEffect, useRef } from "react";
import { Calendar } from "lucide-react";
import Modal from "./Modal";
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

      // Sort events from oldest to newest based on EventStartDate
      const sortedEvents = extractedEvents.sort((a, b) => {
        const dateA = new Date(a.EventStartDate);
        const dateB = new Date(b.EventStartDate);
        return dateA.getTime() - dateB.getTime(); // Oldest first
      });

      setEvents(sortedEvents);
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

      // Otherwise, show full date in DD/MM/YYYY format
      const day = start.getDate().toString().padStart(2, "0");
      const month = (start.getMonth() + 1).toString().padStart(2, "0");
      const year = start.getFullYear();
      return `${day}/${month}/${year}`;
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

  const hasValidLocation = (event: Event) => {
    const parts = [
      event.AddressLine1,
      event.AddressLine2,
      event.City,
      event.PostCode,
      event.Country,
    ].filter(Boolean);

    return parts.length > 0;
  };

  const isEventInPast = (event: Event) => {
    try {
      const eventDate = new Date(event.EventStartDate);
      const now = new Date();
      return eventDate < now;
    } catch {
      return false;
    }
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
      modified: `Last modified by ${editor || "Unknown"} at ${formatTimestamp(
        modified
      )}`,
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

  const generateICSFile = (event: Event) => {
    const formatICalDate = (dateString: string, isAllDay: boolean) => {
      try {
        const date = new Date(dateString);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        const hours = String(date.getHours()).padStart(2, "0");
        const minutes = String(date.getMinutes()).padStart(2, "0");
        const seconds = String(date.getSeconds()).padStart(2, "0");

        if (isAllDay) {
          return `${year}${month}${day}`;
        } else {
          return `${year}${month}${day}T${hours}${minutes}${seconds}`;
        }
      } catch {
        return "";
      }
    };

    const isAllDay = event.FullDayEvent === "TRUE";
    const location = getEventLocation(event);
    const description = event.Description
      ? event.Description.replace(/<[^>]*>/g, "")
      : "No description available";

    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//BSM Task//Calendar Event//EN
BEGIN:VEVENT
UID:event-${event.ID}@bsm-task
SUMMARY:${event.Title || "Untitled Event"}
DESCRIPTION:${description}
LOCATION:${location}
DTSTART${isAllDay ? ";VALUE=DATE" : ""}:${formatICalDate(
      event.EventStartDate,
      isAllDay
    )}
DTEND${isAllDay ? ";VALUE=DATE" : ""}:${formatICalDate(
      event.EventEndDate,
      isAllDay
    )}
END:VEVENT
END:VCALENDAR`.trim();

    return icsContent;
  };

  const downloadICSFile = (event: Event) => {
    const icsContent = generateICSFile(event);
    const blob = new Blob([icsContent], {
      type: "text/calendar;charset=utf-8",
    });
    const url = window.URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `${event.Title || "event"}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    window.URL.revokeObjectURL(url);
  };

  const openInMaps = (event: Event) => {
    const location = getEventLocation(event);
    const encodedLocation = encodeURIComponent(location);
    const mapsUrl = `https://maps.google.com/maps?q=${encodedLocation}`;
    window.open(mapsUrl, "_blank");
  };

  if (loading) {
    return (
      <div className="calendar-container">
        <h2 className="calendar-heading">
          <Calendar size={20} />
          Upcoming Events
        </h2>
        <p className="calendar-text">Loading events...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="calendar-container">
        <h2 className="calendar-heading">
          <Calendar size={20} />
          Upcoming Events
        </h2>
        <p className="calendar-error-text">Error: {error}</p>
        <button className="calendar-retry-button" onClick={fetchEvents}>
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="calendar-container">
      <h2 className="calendar-heading">
        <Calendar size={20} />
        Upcoming Events
      </h2>

      {events.length === 0 ? (
        <p>No upcoming events found.</p>
      ) : (
        <div
          ref={eventsContainerRef}
          className={`calendar-events ${
            showScrollbar ? "custom-scrollbar" : ""
          }`}
        >
          {events.map((event, index) => (
            <div key={event.ID || index} className="calendar-event-item">
              <a
                className={`calendar-event-link ${
                  isEventInPast(event) ? "past-event" : ""
                }`}
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  handleEventClick(event);
                }}
              >
                {getEventTitle(event)} -{" "}
                {formatEventDate(event.EventStartDate, event.FullDayEvent)}
              </a>
            </div>
          ))}
        </div>
      )}

      {/* Event Details Modal */}
      <Modal
        isOpen={isDialogOpen}
        onClose={handleDialogDismiss}
        className="custom-dialog"
      >
        {selectedEvent && (
          <div className="dialog-content">
            {/* Banner Image and Date/Title/Type */}
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

            {/* Description and Date/Time & Location */}
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
                    downloadICSFile(selectedEvent);
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
                {hasValidLocation(selectedEvent) && (
                  <a
                    className="view-map-link"
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      openInMaps(selectedEvent);
                    }}
                  >
                    View Map
                  </a>
                )}
              </div>
            </div>

            {/* Row 3: Created/Modified Information */}
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
        )}
      </Modal>
    </div>
  );
};

export default CalendarModule;
