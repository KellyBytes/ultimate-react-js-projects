import { useState, useEffect } from 'react';

const CalendarApp = () => {
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const monthsOfYear = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  const currentDate = new Date();

  const [currentMonth, setCurrentMonth] = useState(currentDate.getMonth());
  const [currentYear, setCurrentYear] = useState(currentDate.getFullYear());
  const [selectedDate, setSelectedDate] = useState(currentDate);
  const [showEventPopup, setShowEventPopup] = useState(false);
  const [events, setEvents] = useState([]);
  const [eventTime, setEventTime] = useState({ hours: '09', minutes: '00' });
  const [eventText, setEventText] = useState('');
  const [editingEvent, setEditingEvent] = useState(null);

  // getting the total number of days in the current month: the zero moves the date to the last day of the previous month, which is the current month in this case
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();

  const prevMonth = () => {
    setCurrentMonth((prev) => (prev === 0 ? 11 : prev - 1));
    setCurrentYear((prev) => (currentMonth === 0 ? prev - 1 : prev));
  };
  const nextMonth = () => {
    setCurrentMonth((prev) => (prev === 11 ? 0 : prev + 1));
    setCurrentYear((prev) => (currentMonth === 11 ? prev + 1 : prev));
  };

  const handleDateClick = (day) => {
    const clickedDate = new Date(currentYear, currentMonth, day);
    const today = new Date();

    // Set time at 00:00:00 to compare only dates
    clickedDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    if (clickedDate >= today) {
      setSelectedDate(clickedDate);
      setShowEventPopup(true);
      setEventTime({ hours: '09', minutes: '00' });
      setEventText('');
      setEditingEvent(null);
    }
  };

  const handleEventSubmit = () => {
    const newEvent = {
      id: editingEvent ? editingEvent.id : Date.now(),
      date: selectedDate,
      time: `${eventTime.hours.padStart(2, '0')}:${eventTime.minutes.padStart(2, '0')}`,
      text: eventText,
    };

    let updatedEvents = [...events];

    if (editingEvent) {
      updatedEvents = updatedEvents.map((event) =>
        event.id === editingEvent.id ? newEvent : event
      );
    } else {
      updatedEvents.push(newEvent);
    }

    updatedEvents.sort((a, b) => a.date - b.date);

    // setEvents((prev) => [...prev, newEvent]);
    setEvents(updatedEvents);
    setEventTime({ hours: '09', minutes: '00' });
    setEventText('');
    setShowEventPopup(false);
    setEditingEvent(null);

    localStorage.setItem('events', JSON.stringify(updatedEvents));
  };

  const handleEditEvent = (event) => {
    setSelectedDate(event.date);
    setEventTime({
      hours: event.time.split(':')[0],
      minutes: event.time.split(':')[1],
    });
    setEventText(event.text);
    setEditingEvent(event);
    setShowEventPopup(true);
  };

  const handleDeleteEvent = (eventId) => {
    let updatedEvents = events.filter((event) => event.id !== eventId);
    setEvents(updatedEvents);

    localStorage.setItem('events', JSON.stringify(updatedEvents));
  };

  const handleTimeChange = (e) => {
    const { name, value } = e.target;

    setEventTime((prev) => ({ ...prev, [name]: value.padStart(2, '0') }));
  };

  useEffect(() => {
    if (!localStorage) return;

    if (localStorage.getItem('events')) {
      const storedEvents = JSON.parse(localStorage.getItem('events')).map((event) => ({
        ...event,
        date: new Date(event.date),
      }));
      setEvents(storedEvents);
    }
  }, []);

  return (
    <div className="calendar-app">
      <div className="calendar">
        <h1 className="heading">Calendar</h1>
        <div className="navigate-date">
          <h2 className="month">{monthsOfYear[currentMonth]}</h2>
          <h2 className="year">{currentYear}</h2>
          <div className="buttons">
            <i className="bix bx-chevron-left" onClick={prevMonth}></i>
            <i className="bix bx-chevron-right" onClick={nextMonth}></i>
          </div>
        </div>
        <div className="weekdays">
          {daysOfWeek.map((day) => (
            <span key={day}>{day}</span>
          ))}
        </div>
        <div className="days">
          {[...Array(firstDayOfMonth).keys()].map((_, index) => (
            <span key={`empty-${index}`} /> // Empty spans for days before the first day of the month: if the first day of the month is a Wednesday(3), then there will be 3 empty spans for Sunday, Monday, and Tuesday (0-2)
          ))}
          {[...Array(daysInMonth).keys()].map((day) => (
            <span
              key={day + 1}
              className={
                day + 1 === currentDate.getDate() &&
                currentMonth === currentDate.getMonth() &&
                currentYear === currentDate.getFullYear()
                  ? 'current-day'
                  : ''
              }
              onClick={() => handleDateClick(day + 1)}
            >
              {day + 1}
            </span> // if daysInMonth is 31, this will create spans from 1 to 31
          ))}
        </div>
      </div>
      <div className="events">
        {showEventPopup && (
          <div className="event-popup">
            <div className="selectedDate">
              {`${monthsOfYear[currentMonth]} ${selectedDate?.getDate()}`}
            </div>
            <div className="time-input">
              <div className="event-popup-time">Time</div>
              <input
                type="number"
                name="hours"
                min={0}
                max={24}
                className="hours"
                value={eventTime.hours}
                // onChange={(e) => setEventTime({ ...eventTime, hours: e.target.value })}
                onChange={handleTimeChange}
              />
              <input
                type="number"
                name="minutes"
                min={0}
                max={60}
                step={5}
                className="minutes"
                value={eventTime.minutes}
                // onChange={(e) => setEventTime({ ...eventTime, minutes: e.target.value })}
                onChange={handleTimeChange}
              />
            </div>
            <textarea
              placeholder="Enter Event Text (Maximum 60 Characters)"
              value={eventText}
              onChange={(e) => {
                if (e.target.value.length <= 60) {
                  setEventText(e.target.value);
                }
              }}
            ></textarea>
            <button className="event-popup-btn" onClick={handleEventSubmit}>
              {editingEvent ? 'Update Event' : 'Add Event'}
            </button>
            <button className="close-event-popup" onClick={() => setShowEventPopup(false)}>
              <i className="bx bx-x"></i>
            </button>
          </div>
        )}
        {events.map((event, index) => (
          <div className="event" key={index}>
            <div className="event-date-wrapper">
              <div className="event-date">
                {event.date.toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </div>
              <div className="event-time">{event.time}</div>
            </div>
            <div className="event-text">{event.text}</div>
            <div className="event-buttons">
              <i className="bx bxs-edit-alt" onClick={() => handleEditEvent(event)}></i>
              <i className="bx bxs-message-x" onClick={() => handleDeleteEvent(event.id)}></i>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CalendarApp;
