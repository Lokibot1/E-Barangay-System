import React from 'react';
import { Navigate } from 'react-router-dom';

export default function AdminRoute({ children }) {
  try {
    const role = localStorage.getItem('role');
    if (role === 'admin') return children;
  } catch (e) {
    // ignore
  }
  return <Navigate to="/login" replace />;
}
