import { Event } from "../types/event";

export const formatEventDate = (startDate: string, isFullDay: string) => {
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

export const getEventTitle = (event: Event) => {
  return event.Title || "Untitled Event";
};

export const formatDateBox = (startDate: string) => {
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

export const formatFullDateTime = (
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

export const getEventLocation = (event: Event) => {
  const parts = [
    event.AddressLine1,
    event.AddressLine2,
    event.City,
    event.PostCode,
    event.Country,
  ].filter(Boolean);

  return parts.length > 0 ? parts.join(", ") : "Location not specified";
};

export const hasValidLocation = (event: Event) => {
  const parts = [
    event.AddressLine1,
    event.AddressLine2,
    event.City,
    event.PostCode,
    event.Country,
  ].filter(Boolean);

  return parts.length > 0;
};

export const isEventInPast = (event: Event) => {
  try {
    const eventDate = new Date(event.EventStartDate);
    const now = new Date();
    return eventDate < now;
  } catch {
    return false;
  }
};

export const formatCreatedModifiedInfo = (
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

export const generateICSFile = (event: Event) => {
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

export const downloadICSFile = (event: Event) => {
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

export const openInMaps = (event: Event) => {
  const location = getEventLocation(event);
  const encodedLocation = encodeURIComponent(location);
  const mapsUrl = `https://maps.google.com/maps?q=${encodedLocation}`;
  window.open(mapsUrl, "_blank");
};
