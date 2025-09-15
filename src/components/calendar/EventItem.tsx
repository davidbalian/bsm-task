import React from "react";
import { Event } from "../../types/event";
import {
  getEventTitle,
  formatEventDate,
  isEventInPast,
} from "../../utils/eventUtils";

interface EventItemProps {
  event: Event;
  onClick: (event: Event) => void;
}

const EventItem: React.FC<EventItemProps> = ({ event, onClick }) => {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    onClick(event);
  };

  return (
    <div className="calendar-event-item">
      <a
        className={`calendar-event-link ${
          isEventInPast(event) ? "past-event" : ""
        }`}
        href="#"
        onClick={handleClick}
      >
        {getEventTitle(event)} -{" "}
        {formatEventDate(event.EventStartDate, event.FullDayEvent)}
      </a>
    </div>
  );
};

export default EventItem;
