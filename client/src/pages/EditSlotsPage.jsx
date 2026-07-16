import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import SubNavbar from '../components/SubNavbar';
import axios from 'axios';
import { Trash2, Save, AlertCircle } from 'lucide-react';
import { BOOKING_OPTIONS } from '../constants/options';

export default function EditSlotsPage() {
  const { year, type } = useParams();
  const navigate = useNavigate();

  const [slots, setSlots] = useState([]);
  const [dirtySlotIds, setDirtySlotIds] = useState(new Set());
  const [editedSlots, setEditedSlots] = useState({}); // Stores local input values
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  // Validate configuration
  const yearConfig = BOOKING_OPTIONS[year];
  const config = yearConfig ? yearConfig[type] : null;

  useEffect(() => {
    // Authenticate user
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      navigate('/');
      return;
    }
    const user = JSON.parse(userStr);
    if (user.role !== 'faculty') {
      navigate('/student');
      return;
    }

    // Helper: get auth headers with JWT token
    const getAuthHeaders = () => {
      const u = JSON.parse(localStorage.getItem('user') || '{}');
      return u.token ? { Authorization: `Bearer ${u.token}` } : {};
    };

    const fetchSlots = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await axios.get(`/api/bookings/${year}/${type}/edit/slots`, {
          headers: getAuthHeaders()
        });
        setSlots(response.data);

        // Initialize editedSlots dictionary
        const initialEdits = {};
        response.data.forEach(slot => {
          initialEdits[slot._id] = {
            date: slot.date || '',
            startTime: slot.startTime || '',
            endTime: slot.endTime || '',
            venue: slot.venue || '',
            desc: slot.desc || ''
          };
        });
        setEditedSlots(initialEdits);
        setDirtySlotIds(new Set());
      } catch (err) {
        console.error(err);
        if (err.response?.status === 401) { navigate('/'); return; }
        setError('Failed to fetch slots.');
      } finally {
        setLoading(false);
      }
    };

    if (config) {
      fetchSlots();
    }
  }, [year, type, config, navigate]);

  if (!config) {
    return (
      <div className="container" style={{ textAlign: 'center', marginTop: '50px' }}>
        <h3>Error: Invalid year or type configuration.</h3>
        <button className="card-btn" onClick={() => navigate('/faculty')}>Back to Dashboard</button>
      </div>
    );
  }

  // Handle cell input change
  const handleInputChange = (slotId, field, value) => {
    setEditedSlots(prev => ({
      ...prev,
      [slotId]: {
        ...prev[slotId],
        [field]: value
      }
    }));

    // Mark row as dirty
    setDirtySlotIds(prev => {
      const copy = new Set(prev);
      copy.add(slotId);
      return copy;
    });
  };

  // Trigger Save (PUT request)
  const handleSave = async (slotId) => {
    setError('');
    setMessage('');
    const updatedValues = editedSlots[slotId];

    try {
      const response = await axios.put(`/api/bookings/${year}/${type}/edit/slot/${slotId}`, updatedValues, {
        headers: { Authorization: `Bearer ${JSON.parse(localStorage.getItem('user') || '{}').token}` }
      });
      setMessage(response.data.message || 'Slot updated successfully');

      // Remove slot from dirty set
      setDirtySlotIds(prev => {
        const copy = new Set(prev);
        copy.delete(slotId);
        return copy;
      });

      // Update local slots state to reflect saved changes
      setSlots(prev => prev.map(s => s._id === slotId ? { ...s, ...updatedValues } : s));
    } catch (err) {
      console.error(err);
      setError('Error updating slot.');
    }
  };

  // Trigger Delete (DELETE request)
  const handleDelete = async (slotId) => {
    if (!window.confirm('Are you sure you want to delete this slot?')) {
      return;
    }

    setError('');
    setMessage('');
    try {
      const response = await axios.delete(`/api/bookings/${year}/${type}/edit/slot/${slotId}`, {
        headers: { Authorization: `Bearer ${JSON.parse(localStorage.getItem('user') || '{}').token}` }
      });
      setMessage(response.data.message || 'Slot deleted successfully');

      // Remove from states
      setSlots(prev => prev.filter(s => s._id !== slotId));

      // Clean up edited state
      const copyEdits = { ...editedSlots };
      delete copyEdits[slotId];
      setEditedSlots(copyEdits);

      setDirtySlotIds(prev => {
        const copy = new Set(prev);
        copy.delete(slotId);
        return copy;
      });
    } catch (err) {
      console.error(err);
      setError('Error deleting slot.');
    }
  };

  const hasDivisions = config.divisions.length > 0;
  const hasBatches = config.batches.length > 0;

  return (
    <>
      <SubNavbar year={year} type={type} />

      <div className="container">
        <div className="dashboard-title-section" style={{ marginBottom: '1.5rem' }}>
          <h3>Manage Booking Slots</h3>
          <p>Update reservations or delete cancellations for {year} {type}.</p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}
        {message && <div className="alert alert-success">{message}</div>}

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', fontSize: '1.2rem', color: 'var(--text-muted)' }}>
            Loading Slot Database...
          </div>
        ) : slots.length === 0 ? (
          <div className="form-card" style={{ textAlign: 'center', padding: '3rem' }}>
            <AlertCircle size={40} style={{ color: 'var(--primary)', marginBottom: '1rem' }} />
            <h4 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>No Bookings Found</h4>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>There are no slots booked for {year} {type} at the moment.</p>
            <button className="card-btn primary-action" onClick={() => navigate(`/booking/${year}/${type}`)} style={{ display: 'inline-flex' }}>
              Create First Booking
            </button>
          </div>
        ) : (
          <div className="table-card" style={{ marginBottom: '3rem' }}>
            <table className="premium-table">
              <thead>
                <tr>
                  <th>Faculty</th>
                  <th>Course</th>
                  {hasDivisions && <th>Div</th>}
                  {hasBatches && <th>Batch</th>}
                  <th>Date</th>
                  <th>Start Time</th>
                  <th>End Time</th>
                  <th>Venue</th>
                  <th>Description</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {slots.map((slot) => {
                  const edits = editedSlots[slot._id] || {};
                  const isDirty = dirtySlotIds.has(slot._id);
                  return (
                    <tr key={slot._id}>
                      <td style={{ fontWeight: 600 }}>{slot.facultyName}</td>
                      <td>{slot.courseName}</td>
                      {hasDivisions && <td>{slot.division || '-'}</td>}
                      {hasBatches && <td>{slot.batch || '-'}</td>}
                      <td>
                        <input
                          type="date"
                          className="table-input"
                          value={edits.date || ''}
                          onChange={(e) => handleInputChange(slot._id, 'date', e.target.value)}
                        />
                      </td>
                      <td>
                        <input
                          type="time"
                          className="table-input"
                          value={edits.startTime || ''}
                          onChange={(e) => handleInputChange(slot._id, 'startTime', e.target.value)}
                        />
                      </td>
                      <td>
                        <input
                          type="time"
                          className="table-input"
                          value={edits.endTime || ''}
                          onChange={(e) => handleInputChange(slot._id, 'endTime', e.target.value)}
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          className="table-input"
                          value={edits.venue || ''}
                          onChange={(e) => handleInputChange(slot._id, 'venue', e.target.value)}
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          className="table-input"
                          value={edits.desc || ''}
                          onChange={(e) => handleInputChange(slot._id, 'desc', e.target.value)}
                        />
                      </td>
                      <td style={{ minWidth: '130px', whiteSpace: 'nowrap' }}>
                        <button
                          className="btn-action-delete"
                          onClick={() => handleDelete(slot._id)}
                          title="Delete Slot"
                        >
                          <Trash2 size={14} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} />
                          Delete
                        </button>
                        {isDirty && (
                          <button
                            className="btn-action-save"
                            onClick={() => handleSave(slot._id)}
                            title="Save Changes"
                          >
                            <Save size={14} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} />
                            Save
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
