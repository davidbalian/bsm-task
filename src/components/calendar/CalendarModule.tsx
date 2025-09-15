import React, { useState } from "react";
import { Calendar } from "lucide-react";
import { useEvents } from "../../hooks/useEvents";
import { Event } from "../../types/event";
import EventList from "./EventList";
import EventDetails from "./EventDetails";
import Modal from "../ui/Modal";
import "../../styles/components/Calendar.css";
import "../../styles/components/Modal.css";

const CalendarModule: React.FC = () => {
  const { events, loading, error, refetchEvents } = useEvents();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

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
        <button className="calendar-retry-button" onClick={refetchEvents}>
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

      <EventList events={events} onEventClick={handleEventClick} />

      {/* Event Details Modal */}
      <Modal
        isOpen={isDialogOpen}
        onClose={handleDialogDismiss}
        className="custom-dialog"
      >
        {selectedEvent && <EventDetails event={selectedEvent} />}
      </Modal>
    </div>
  );
};

export default CalendarModule;
