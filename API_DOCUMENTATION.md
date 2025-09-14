# Calendar Events API Documentation

## Overview

The Calendar Events API provides access to upcoming events data. This API returns a structured response containing event information including titles, dates, locations, categories, and descriptions.

## API Endpoint

```
POST https://prod-179.westeurope.logic.azure.com/workflows/7c84997dd6894507a60796acb06e5c43/triggers/manual/paths/invoke?api-version=2016-10-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=6hFoizfo2w62d0iQK_Zyt7a3Ycr9akAkXdCPAG0ecwQ
```

## Request

### Method

`POST`

### Headers

```
Content-Type: application/json
```

### Body

The API accepts an optional JSON body. For basic requests, an empty object `{}` can be sent.

## Response Structure

### Root Response Object

```json
{
  "value": [
    // Array of event objects
  ]
}
```

### Event Object Structure

Each event in the `value` array has the following structure:

```json
{
  "ID": 3,
  "Title": "Aenean vehicula tortor id magna laoreet - at auctor turpis lacinia",
  "Category": "Meeting",
  "BannerUrl": "https://picsum.photos/600/400",
  "Description": "<h2>Donec convallis porttitor condimentum.</h2>\n<p>Phasellus mauris neque, dictum non bibendum eget, eleifend vitae nulla. Aenean sit amet turpis in nunc pellentesque lacinia accumsan id tortor. Nam ipsum ex, varius ac libero at, congue pretium augue.</p>\n<p><a title=\"external link\" href=\"https://google.com\" target=\"_blank\">Vivamus ut suscipit ante</a></p>",
  "AddressLine1": "2453 Ernser Terrace",
  "AddressLine2": "",
  "PostCode": "70192-2894",
  "City": "Stantonstad",
  "Country": "United States",
  "EventStartDate": "2025-10-08T00:00:00Z",
  "EventEndDate": "2025-10-08T23:59:59Z",
  "FullDayEvent": "TRUE",
  "Author": "Mrs. Roslyn Morissette",
  "Editor": "Cassandra Stamm",
  "Created": "2025-05-30T07:25:32Z",
  "Modified": "2025-05-30T09:54:23Z"
}
```

## Field Descriptions

### Required Fields

| Field            | Type     | Description                                                       | Example                                                               |
| ---------------- | -------- | ----------------------------------------------------------------- | --------------------------------------------------------------------- |
| `ID`             | `number` | Unique identifier for the event                                   | `3`                                                                   |
| `Title`          | `string` | Event title/name                                                  | `"Aenean vehicula tortor id magna laoreet"`                           |
| `Category`       | `string` | Event category/type                                               | `"Meeting"`, `"Conference"`, `"Holiday"`, `"Presentation"`, `"Party"` |
| `EventStartDate` | `string` | Event start date and time in ISO 8601 format                      | `"2025-10-08T00:00:00Z"`                                              |
| `EventEndDate`   | `string` | Event end date and time in ISO 8601 format                        | `"2025-10-08T23:59:59Z"`                                              |
| `FullDayEvent`   | `string` | Indicates if the event spans the full day (`"TRUE"` or `"FALSE"`) | `"TRUE"`                                                              |
| `Author`         | `string` | Person who created the event                                      | `"Mrs. Roslyn Morissette"`                                            |
| `Created`        | `string` | Creation timestamp in ISO 8601 format                             | `"2025-05-30T07:25:32Z"`                                              |
| `Modified`       | `string` | Last modification timestamp in ISO 8601 format                    | `"2025-05-30T09:54:23Z"`                                              |

### Optional Fields

| Field          | Type               | Description                       | Example                           |
| -------------- | ------------------ | --------------------------------- | --------------------------------- |
| `BannerUrl`    | `string`           | URL to event banner image         | `"https://picsum.photos/600/400"` |
| `Description`  | `string`           | HTML-formatted event description  | `"<h2>Donec convallis...</h2>"`   |
| `AddressLine1` | `string`           | Primary address line              | `"2453 Ernser Terrace"`           |
| `AddressLine2` | `string`           | Secondary address line (optional) | `""` or `"Suite 100"`             |
| `PostCode`     | `string \| number` | Postal/ZIP code                   | `"70192-2894"` or `35594`         |
| `City`         | `string`           | City name                         | `"Stantonstad"`                   |
| `Country`      | `string`           | Country name                      | `"United States"`                 |
| `Editor`       | `string`           | Person who last edited the event  | `"Cassandra Stamm"`               |

## Date and Time Format

### ISO 8601 Format

All date/time fields use ISO 8601 format:

```
YYYY-MM-DDTHH:mm:ssZ
```

Where:

- `YYYY`: 4-digit year
- `MM`: 2-digit month (01-12)
- `DD`: 2-digit day (01-31)
- `HH`: 2-digit hour (00-23)
- `mm`: 2-digit minute (00-59)
- `ss`: 2-digit second (00-59)
- `Z`: UTC timezone indicator

### Full Day Events

- When `FullDayEvent` is `"TRUE"`, the event spans from start of day to end of day
- Time portions should be ignored for display purposes
- Display format: `October 8, 2025`

### Time-specific Events

- When `FullDayEvent` is `"FALSE"`, both date and time are relevant
- Display format: `October 8, 2025, 2:00 PM - 6:00 PM`

## Categories

The API supports the following event categories:

- `Meeting`
- `Conference`
- `Holiday`
- `Presentation`
- `Party`

## Location Information

Location is composed from multiple fields:

- `AddressLine1` (required)
- `AddressLine2` (optional)
- `City` (optional)
- `PostCode` (optional)
- `Country` (optional)

Example full address:

```
2453 Ernser Terrace, Stantonstad, 70192-2894, United States
```

## HTML Content

The `Description` field contains HTML markup that should be rendered as HTML in the UI. Common HTML elements include:

- `<h1>`, `<h2>`, `<h3>` - Headings
- `<p>` - Paragraphs
- `<a>` - Links with `href` and `title` attributes
- `<ul>`, `<ol>`, `<li>` - Lists
- `<strong>`, `<em>` - Text formatting
- `<table>`, `<thead>`, `<tbody>`, `<tr>`, `<th>`, `<td>` - Tables

## Error Handling

### HTTP Status Codes

- `200`: Success
- `400`: Bad Request
- `401`: Unauthorized
- `500`: Internal Server Error

### Error Response Format

```json
{
  "error": {
    "code": "ErrorCode",
    "message": "Error description"
  }
}
```

## Usage Examples

### Basic Request

```javascript
fetch(
  "https://prod-179.westeurope.logic.azure.com/workflows/7c84997dd6894507a60796acb06e5c43/triggers/manual/paths/invoke?api-version=2016-10-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=6hFoizfo2w62d0iQK_Zyt7a3Ycr9akAkXdCPAG0ecwQ",
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({}),
  }
)
  .then((response) => response.json())
  .then((data) => {
    const events = data.value;
    console.log("Events:", events);
  });
```

### Processing Events

```javascript
const events = response.value;

events.forEach((event) => {
  console.log("Event:", event.Title);
  console.log("Date:", new Date(event.EventStartDate));
  console.log("Category:", event.Category);
  console.log(
    "Location:",
    [event.AddressLine1, event.City, event.Country].filter(Boolean).join(", ")
  );
});
```

## Notes

1. **Timestamps**: All timestamps are in UTC (indicated by the `Z` suffix)
2. **HTML Content**: The `Description` field contains HTML that should be sanitized before rendering
3. **Empty Fields**: Optional fields may be empty strings (`""`) or omitted entirely
4. **Image URLs**: Banner images are hosted on external services (like picsum.photos in examples)
5. **Location Fields**: Not all events may have complete address information
6. **Date Ranges**: Events can span multiple days or be single-day events

## Implementation Notes

When implementing a client for this API:

1. **Date Handling**: Always parse dates using `new Date()` constructor for proper timezone handling
2. **HTML Sanitization**: Sanitize HTML content before rendering to prevent XSS attacks
3. **Image Loading**: Handle cases where banner images may fail to load
4. **Responsive Design**: Consider how event cards will display on different screen sizes
5. **Error Boundaries**: Implement proper error handling for network failures and malformed data

---

_Last updated: September 14, 2025_
