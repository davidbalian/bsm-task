import React, { useRef, useEffect, useState } from "react";
import { Event } from "../../types/event";
import EventItem from "./EventItem";

interface EventListProps {
  events: Event[];
  onEventClick: (event: Event) => void;
}

const EventList: React.FC<EventListProps> = ({ events, onEventClick }) => {
  const [showScrollbar, setShowScrollbar] = useState(false);
  const eventsContainerRef = useRef<HTMLDivElement>(null);

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

  if (events.length === 0) {
    return <p>No upcoming events found.</p>;
  }

  return (
    <div
      ref={eventsContainerRef}
      className={`calendar-events ${showScrollbar ? "custom-scrollbar" : ""}`}
    >
      {events.map((event, index) => (
        <EventItem
          key={event.ID || index}
          event={event}
          onClick={onEventClick}
        />
      ))}
    </div>
  );
};

export default EventList;
