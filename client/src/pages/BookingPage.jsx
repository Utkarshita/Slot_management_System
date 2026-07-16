import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { BOOKING_OPTIONS } from '../constants/options';
import SubNavbar from '../components/SubNavbar';
import axios from 'axios';
import { Send } from 'lucide-react';

import toast from "react-hot-toast";
import LoadingSpinner from "../components/LoadingSpinner";
import PageWrapper from "../components/PageWrapper";

export default function BookingPage() {
  const { year, type } = useParams();
  const navigate = useNavigate();

  // States
  const [facultyName, setFacultyName] = useState('');
  const [courseName, setCourseName] = useState('');
  const [division, setDivision] = useState('');
  const [batch, setBatch] = useState('');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [venue, setVenue] = useState('');
  const [desc, setDesc] = useState('');
  const [emailAdd, setEmailAdd] = useState('');

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Authenticate user and get token
  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      navigate('/');
      return;
    }
    const user = JSON.parse(userStr);
    if (user.role !== 'faculty') {
      navigate('/student');
    }
  }, [navigate]);

  // Helper: get auth headers with JWT token
  const getAuthHeaders = () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return user.token ? { Authorization: `Bearer ${user.token}` } : {};
  };

  // Options configuration based on Year & Type
  const yearConfig = BOOKING_OPTIONS[year];
  const config = yearConfig ? yearConfig[type] : null;

  if (!config) {
    return (
      <div className="container" style={{ textAlign: 'center', marginTop: '50px' }}>
        <h3>Error: Invalid year or type configuration.</h3>
        <button className="card-btn" onClick={() => navigate('/faculty')}>Back to Dashboard</button>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (facultyName === '' || facultyName === 'select faculty') {
      setError('Please select a faculty name');
      return;
    }
    if (courseName === '' || courseName === 'select course') {
      setError('Please select a course');
      return;
    }
    if (config.divisions.length > 0 && (division === '' || division === 'select division')) {
      setError('Please select a division');
      return;
    }
    if (config.batches.length > 0 && (batch === '' || batch === 'select batch')) {
      setError('Please select a batch');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        facultyName,
        courseName,
        division: config.divisions.length > 0 ? division : undefined,
        batch: config.batches.length > 0 ? batch : undefined,
        date,
        startTime,
        endTime,
        venue,
        desc,
        emailAdd
      };

      const response = await axios.post(`/api/bookings/${year}/${type}/book`, payload, {
        headers: getAuthHeaders()
      });
      setMessage(response.data.message || 'Slot booked successfully!');

      // Clear form on success
      setFacultyName('');
      setCourseName('');
      setDivision('');
      setBatch('');
      setDate('');
      setStartTime('');
      setEndTime('');
      setVenue('');
      setDesc('');
      setEmailAdd('');
    } catch (err) {
      console.error(err);
      if (err.response?.status === 401) {
        localStorage.removeItem('user');
        navigate('/');
        return;
      }
      setError(err.response?.data?.message || 'An error occurred while booking. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <SubNavbar year={year} type={type} />

      <div className="container">
        <div className="form-card">
          <h1 className="form-title">Book {year} {type} Slot</h1>

          {error && <div className="alert alert-error">{error}</div>}
          {message && <div className="alert alert-success">{message}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="facultyName">Faculty Name:</label>
              <select
                id="facultyName"
                className="form-control"
                value={facultyName}
                onChange={(e) => setFacultyName(e.target.value)}
                required
              >
                <option value="">select faculty</option>
                {config.faculty.map((f) => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="courseName">Course Name:</label>
              <select
                id="courseName"
                className="form-control"
                value={courseName}
                onChange={(e) => setCourseName(e.target.value)}
                required
              >
                <option value="">select course</option>
                {config.courses.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {config.divisions.length > 0 && (
              <div className="form-group">
                <label htmlFor="division">Division:</label>
                <select
                  id="division"
                  className="form-control"
                  value={division}
                  onChange={(e) => setDivision(e.target.value)}
                  required
                >
                  <option value="">select division</option>
                  {config.divisions.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
            )}

            {config.batches.length > 0 && (
              <div className="form-group">
                <label htmlFor="batch">Batch:</label>
                <select
                  id="batch"
                  className="form-control"
                  value={batch}
                  onChange={(e) => setBatch(e.target.value)}
                  required
                >
                  <option value="">select batch</option>
                  {config.batches.map((b) => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>
            )}

            <div className="form-group">
              <label htmlFor="date">Date:</label>
              <input
                type="date"
                id="date"
                className="form-control"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="startTime">Start Time:</label>
              <input
                type="time"
                id="startTime"
                className="form-control"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="endTime">End Time:</label>
              <input
                type="time"
                id="endTime"
                className="form-control"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="venue">Venue:</label>
              <input
                type="text"
                id="venue"
                className="form-control"
                placeholder="Enter booking venue (e.g. Lab 302, Seminar Hall)"
                value={venue}
                onChange={(e) => setVenue(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="desc">Description (optional):</label>
              <input
                type="text"
                id="desc"
                className="form-control"
                placeholder="Enter any additional description details"
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label htmlFor="emailAdd">Email (optional):</label>
              <input
                type="email"
                id="emailAdd"
                className="form-control"
                placeholder="Enter email to send booking confirmation"
                value={emailAdd}
                onChange={(e) => setEmailAdd(e.target.value)}
              />
            </div>

            <button type="submit" className="submit-btn" disabled={loading}>
              <Send size={18} /> {loading ? 'Booking Slot...' : 'Submit Booking'}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
