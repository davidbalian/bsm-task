import React from "react";
import { Event } from "../../types/event";
import {
  getEventTitle,
  formatDateBox,
  formatFullDateTime,
  getEventLocation,
  hasValidLocation,
  formatCreatedModifiedInfo,
  downloadICSFile,
  openInMaps,
} from "../../utils/eventUtils";

interface EventDetailsProps {
  event: Event;
}

const EventDetails: React.FC<EventDetailsProps> = ({ event }) => {
  const hasBanner = event.BannerUrl && event.BannerUrl.trim() !== "";

  return (
    <div className={`dialog-content ${!hasBanner ? "no-banner" : ""}`}>
      {/* Banner Image and Date/Title/Type */}
      {/* Column 1: Banner Image (65%) */}
      <div className="banner-column">
        {event.BannerUrl ? (
          <img
            className="event-banner-image"
            src={event.BannerUrl}
            alt={getEventTitle(event)}
          />
        ) : (
          <div className="banner-placeholder">No banner image available</div>
        )}
      </div>

      {/* Column 2: Date Box, Title, Type (35%) */}
      <div className="event-details-column">
        {/* Date Box */}
        <div className="event-date-box">
          {formatDateBox(event.EventStartDate)}
        </div>

        <h2 className="event-title">{getEventTitle(event)}</h2>

        {/* Type/Category */}
        <div className="event-category">{event.Category || "Event"}</div>
      </div>

      {/* Description and Date/Time & Location */}
      {/* Column 1: Description (65%) */}
      <div className="description-column">
        <h3 className="description-heading">Description</h3>
        <div className="description-content">
          {event.Description ? (
            <div
              className="description-text"
              dangerouslySetInnerHTML={{
                __html: event.Description,
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
              event.EventStartDate,
              event.EventEndDate,
              event.FullDayEvent
            )}
          </p>
          <a
            className="add-to-calendar-link"
            href="#"
            onClick={(e) => {
              e.preventDefault();
              downloadICSFile(event);
            }}
          >
            Add to Calendar
          </a>
        </div>

        {/* Location Section */}
        <div className="location-section">
          <h3 className="location-heading">Location</h3>
          <p className="location-info">{getEventLocation(event)}</p>
          {hasValidLocation(event) && (
            <a
              className="view-map-link"
              href="#"
              onClick={(e) => {
                e.preventDefault();
                openInMaps(event);
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
          event.Author,
          event.Created,
          event.Editor,
          event.Modified
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
  );
};

export default EventDetails;
