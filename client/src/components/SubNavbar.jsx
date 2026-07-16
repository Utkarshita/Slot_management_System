import React, { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';

export default function SubNavbar({ year, type }) {
  const navigate = useNavigate();
  const [role, setRole] = useState('student');

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      setRole(user.role);
    }
  }, []);

  return (
    <nav className="app-nav">
      <h2>{year} {type} Slots</h2>
      <ul>
        {role === 'faculty' && (
          <>
            <li>
              <NavLink to={`/booking/${year}/${type}`} className={({ isActive }) => isActive ? 'active' : ''}>
                Book Slot
              </NavLink>
            </li>
            <li>
              <NavLink to={`/edit/${year}/${type}`} className={({ isActive }) => isActive ? 'active' : ''}>
                Edit Slots
              </NavLink>
            </li>
          </>
        )}
        <li>
          <NavLink to={`/calendar/${year}/${type}`} className={({ isActive }) => isActive ? 'active' : ''}>
            View Calendar
          </NavLink>
        </li>
        <li>
          {role === 'faculty' ? (
            <NavLink to="/faculty">Dashboard</NavLink>
          ) : (
            <NavLink to="/student">Dashboard</NavLink>
          )}
        </li>
      </ul>
    </nav>
  );
}
