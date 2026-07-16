import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, LogOut, LayoutDashboard, Calendar, Edit, PlusSquare } from 'lucide-react';

export default function FacultyDashboard() {
  const navigate = useNavigate();
  const [facultyInfo, setFacultyInfo] = useState(null);

  useEffect(() => {
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
    setFacultyInfo(user);
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/');
  };

  if (!facultyInfo) return null;

  const years = [
    { name: 'SY', types: ['IA', 'Lab-CA'] },
    { name: 'TY', types: ['IA', 'Lab-CA'] },
    { name: 'LY', types: ['IA', 'Lab-CA'] },
    { name: 'MTECH-IT', types: ['IA'] },
    { name: 'MTECH-AIDS', types: ['IA'] },
  ];

  return (
    <>
      {/* Navbar */}
      <nav className="app-nav">
        <h2>Faculty Portal</h2>
        <ul>
          <li style={{ display: 'flex', alignItems: 'center', gap: '8px', marginRight: '16px' }}>
            <User size={18} />
            <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>{facultyInfo.email}</span>
          </li>
          <li>
            <button onClick={handleLogout} className="card-btn" style={{ padding: '0.4rem 0.8rem', background: 'transparent', border: '1px solid white', margin: 0 }}>
              <LogOut size={14} /> Log Out
            </button>
          </li>
        </ul>
      </nav>

      {/* Main Content */}
      <div className="container">
        <div className="dashboard-title-section">
          <h3>Faculty Dashboard</h3>
          <p>Select a class and slot type to manage booking requests, view calendars, and edit details.</p>
        </div>

        <div className="card-grid">
          {years.map((year) => (
            <div key={year.name} className="premium-card">
              <h2>{year.name}</h2>
              <div className="card-action-group">
                {year.types.map((type) => (
                  <div key={type} style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem', marginBottom: '0.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--secondary)' }}>{type} Exam</span>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      <Link
                        to={`/booking/${year.name}/${type}`}
                        className="card-btn primary-action"
                        style={{ flex: 1, padding: '0.5rem', fontSize: '0.75rem' }}
                        title="Book Slot"
                      >
                        <PlusSquare size={14} /> Book
                      </Link>
                      <Link
                        to={`/calendar/${year.name}/${type}`}
                        className="card-btn"
                        style={{ flex: 1, padding: '0.5rem', fontSize: '0.75rem', backgroundColor: 'var(--secondary)' }}
                        title="View Calendar"
                      >
                        <Calendar size={14} /> View
                      </Link>
                      <Link
                        to={`/edit/${year.name}/${type}`}
                        className="card-btn"
                        style={{ flex: 1, padding: '0.5rem', fontSize: '0.75rem', backgroundColor: 'var(--secondary)' }}
                        title="Edit Slots"
                      >
                        <Edit size={14} /> Edit
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
