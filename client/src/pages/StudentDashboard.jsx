import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Calendar, User, LogOut } from 'lucide-react';

export default function StudentDashboard() {
  const navigate = useNavigate();
  const [studentInfo, setStudentInfo] = useState(null);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      navigate('/');
      return;
    }
    const user = JSON.parse(userStr);
    if (user.role !== 'student') {
      navigate('/faculty');
      return;
    }
    setStudentInfo(user);
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/');
  };

  if (!studentInfo) return null;

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
        <h2>Student Portal</h2>
        <ul>
          <li style={{ display: 'flex', alignItems: 'center', gap: '8px', marginRight: '16px' }}>
            <User size={18} />
            <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>{studentInfo.email} ({studentInfo.year})</span>
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
          <h3>Student Dashboard</h3>
          <p>Select your class and type of exam to view scheduled slots.</p>
        </div>

        <div className="card-grid">
          {years.map((year) => {
            const isStudentYear = studentInfo.year === year.name;
            return (
              <div 
                key={year.name} 
                className="premium-card" 
                style={isStudentYear ? { 
                  borderColor: 'var(--primary)', 
                  background: 'linear-gradient(to bottom, hsl(351, 71%, 99%), #ffffff)' 
                } : {}}
              >
                {isStudentYear && (
                  <span style={{ 
                    position: 'absolute', 
                    top: '12px', 
                    right: '12px', 
                    fontSize: '0.75rem', 
                    background: 'var(--primary)', 
                    color: 'white', 
                    padding: '2px 8px', 
                    borderRadius: '12px', 
                    fontWeight: 700 
                  }}>
                    Your Class
                  </span>
                )}
                <h2>{year.name}</h2>
                <div className="card-action-group">
                  {year.types.map((type) => (
                    <Link 
                      key={type} 
                      to={`/calendar/${year.name}/${type}`}
                      className="card-btn primary-action"
                    >
                      <Calendar size={16} /> View {type} Calendar
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
