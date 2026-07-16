import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import SubNavbar from '../components/SubNavbar';
import { BOOKING_OPTIONS } from '../constants/options';
import axios from 'axios';
import { Filter } from 'lucide-react';

export default function CalendarPage() {
  const { year, type } = useParams();
  const navigate = useNavigate();

  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [selectedDivision, setSelectedDivision] = useState('');
  const [selectedBatch, setSelectedBatch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Options configuration based on Year & Type
  const yearConfig = BOOKING_OPTIONS[year];
  const config = yearConfig ? yearConfig[type] : null;

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await axios.get(
          `/api/bookings/${year}/${type}/calendar/events`
        );
        // Format events for FullCalendar
        setEvents(response.data);
        setFilteredEvents(response.data);
      } catch (err) {
        console.error(err);
        setError('Failed to fetch calendar events.');
      } finally {
        setLoading(false);
      }
    };

    if (config) {
      fetchEvents();
    }
  }, [year, type, config]);

  // Apply filters client-side
  useEffect(() => {
    let filtered = [...events];
    if (selectedDivision) {
      filtered = filtered.filter(
        (event) => event.extendedProps?.division === selectedDivision
      );
    }
    if (selectedBatch) {
      filtered = filtered.filter(
        (event) => event.extendedProps?.batch === selectedBatch
      );
    }
    setFilteredEvents(filtered);
  }, [selectedDivision, selectedBatch, events]);

  // if (!config) {
  //   return (
  //     <div className="container" style={{ textAlign: 'center', marginTop: '50px' }}>
  //       <h3>Error: Invalid year or type configuration.</h3>
  //       <button className="card-btn" onClick={() => navigate('/')}>Back to Home</button>
  //     </div>
  //   );
  // }

  // Format date helper for event content
  const formatTime = (dateObj) => {
    if (!dateObj) return 'Invalid time';
    const date = new Date(dateObj);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  return (
    <>
      <SubNavbar year={year} type={type} />

      <div className="container">
        <div className="dashboard-title-section" style={{ marginBottom: '1.5rem' }}>
          <h3>Calendar Schedule</h3>
          <p>Explore slot reservations for {year} {type}.</p>
        </div>

        {/* Filters */}
        <div className="calendar-filters">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary)' }}>
            <Filter size={18} />
            <span style={{ fontWeight: 700, fontSize: '0.9rem', fontFamily: 'var(--font-heading)' }}>Filters:</span>
          </div>

          {config.divisions.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <label htmlFor="div-filter">Division:</label>
              <select
                id="div-filter"
                className="form-control"
                style={{ margin: 0, padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}
                value={selectedDivision}
                onChange={(e) => setSelectedDivision(e.target.value)}
              >
                <option value="">All Divisions</option>
                {config.divisions.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
          )}

          {config.batches.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <label htmlFor="batch-filter">Batch:</label>
              <select
                id="batch-filter"
                className="form-control"
                style={{ margin: 0, padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}
                value={selectedBatch}
                onChange={(e) => setSelectedBatch(e.target.value)}
              >
                <option value="">All Batches</option>
                {config.batches.map(b => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', fontSize: '1.2rem', color: 'var(--text-muted)' }}>
            Loading Calendar Events...
          </div>
        ) : (
          <div style={{ marginBottom: '3rem' }}>
            <FullCalendar
              plugins={[dayGridPlugin, interactionPlugin]}
              initialView="dayGridMonth"
              events={filteredEvents}
              eventContent={(info) => {
                const { event } = info;
                return (
                  <div className="custom-event-content">
                    <strong>{event.title}</strong>
                    <div className="custom-event-time">
                      {formatTime(event.start)} - {formatTime(event.end)}
                    </div>
                    <div className="custom-event-detail">
                      Course: {event.extendedProps.courseName}
                    </div>
                    {event.extendedProps.division && (
                      <div className="custom-event-detail">
                        Div: {event.extendedProps.division}
                      </div>
                    )}
                    {event.extendedProps.batch && (
                      <div className="custom-event-detail">
                        Batch: {event.extendedProps.batch}
                      </div>
                    )}
                    <div className="custom-event-detail">
                      Venue: {event.extendedProps.venue}
                    </div>
                    {event.extendedProps.desc && (
                      <div className="custom-event-detail" style={{ fontStyle: 'italic', marginTop: '2px' }}>
                        {event.extendedProps.desc}
                      </div>
                    )}
                  </div>
                );
              }}
              headerToolbar={{
                left: 'prev,next today',
                center: 'title',
                right: 'dayGridMonth'
              }}
              height="auto"
            />
          </div>
        )}
      </div>
    </>
  );
}
