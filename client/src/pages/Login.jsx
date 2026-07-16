import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

// Faculty email list and passkey are now validated server-side via JWT

export default function Login() {
  const [loginType, setLoginType] = useState('student'); // 'student' or 'faculty'
  const [email, setEmail] = useState('');
  const [year, setYear] = useState('');
  const [passkey, setPasskey] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleStudentLogin = (e) => {
    e.preventDefault();
    setError('');

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setError('Email is required');
      return;
    }

    if (!trimmedEmail.endsWith('@somaiya.edu')) {
      setError('Only users with a Somaiya email are allowed to log in.');
      return;
    }

    if (!year || year === 'select') {
      setError('Please select your year.');
      return;
    }

    // Save student details in local storage for session management
    const userData = { email: trimmedEmail, role: 'student', year };
    localStorage.setItem('user', JSON.stringify(userData));

    // Navigate to student dashboard (we can pass the year in state or grab from localstorage)
    navigate('/student');
  };

  const handleFacultyLogin = async (e) => {
    e.preventDefault();
    setError('');

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setError('Email is required');
      return;
    }
    if (!passkey) {
      setError('Passkey is required');
      return;
    }

    try {
      // Server validates email + passkey and returns a JWT token
      const response = await axios.post('/api/login', {
        email: trimmedEmail,
        passkey
      });

      console.log("LOGIN RESPONSE:", response.data);

      if (response.data.success) {
        const userData = {
          email: response.data.email,
          role: 'faculty',
          token: response.data.token  // Store JWT token
        };
        localStorage.setItem('user', JSON.stringify(userData));
        navigate('/faculty');
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Invalid faculty email or passkey.';
      setError(msg);
    }
  };


  return (
    <div className="login-bg">
      <div className="login-card">
        {/* Logos */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
          <img src="/Group 5.png" alt="Somaiya Logo Left" style={{ height: '40px', objectFit: 'contain' }} />
          <img src="/Group 7307.png" alt="Somaiya Logo Right" style={{ height: '40px', objectFit: 'contain' }} />
        </div>

        <h3 style={{ color: '#A51C30', marginBottom: '20px', fontWeight: 'bold', fontSize: '1.2rem', textTransform: 'uppercase' }}>
          KJ Somaiya College of Engineering
        </h3>

        <h1 style={{ fontSize: '1.8rem', marginBottom: '1.5rem' }}>Slot Booking Login</h1>

        {error && <div className="alert alert-error">{error}</div>}

        <div className="user-selector-container">
          <label className="selector-label">Login As:</label>
          <div className="selector-buttons">
            <button
              type="button"
              className={`selector-btn ${loginType === 'student' ? 'active' : ''}`}
              onClick={() => { setLoginType('student'); setError(''); }}
            >
              Student
            </button>
            <button
              type="button"
              className={`selector-btn ${loginType === 'faculty' ? 'active' : ''}`}
              onClick={() => { setLoginType('faculty'); setError(''); }}
            >
              Faculty / Admin
            </button>
          </div>
        </div>

        {loginType === 'student' ? (
          <form onSubmit={handleStudentLogin}>
            <div className="form-group" style={{ textAlign: 'left' }}>
              <label htmlFor="student-email">Email:</label>
              <input
                type="email"
                id="student-email"
                className="form-control"
                placeholder="Enter your Somaiya email (@somaiya.edu)"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group" style={{ textAlign: 'left' }}>
              <label htmlFor="student-year">Select Year:</label>
              <select
                id="student-year"
                className="form-control"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                required
              >
                <option value="">-- select year --</option>
                <option value="SY">SY</option>
                <option value="TY">TY</option>
                <option value="LY">LY</option>
                <option value="MTECH-IT">MTECH-IT</option>
                <option value="MTECH-AIDS">MTECH-AIDS</option>
              </select>
            </div>

            <button type="submit" className="submit-btn">Login as Student</button>
          </form>
        ) : (
          <form onSubmit={handleFacultyLogin}>
            <div className="form-group" style={{ textAlign: 'left' }}>
              <label htmlFor="faculty-email">Faculty Email:</label>
              <input
                type="email"
                id="faculty-email"
                className="form-control"
                placeholder="Enter faculty email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group" style={{ textAlign: 'left' }}>
              <label htmlFor="faculty-passkey">Passkey:</label>
              <input
                type="password"
                id="faculty-passkey"
                className="form-control"
                placeholder="Enter passkey"
                value={passkey}
                onChange={(e) => setPasskey(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="submit-btn">Login as Faculty</button>
          </form>
        )}
      </div>
    </div>
  );
}
