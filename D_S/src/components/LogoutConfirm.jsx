import React from 'react'
import './LogoutConfirm.css'

export default function LogoutConfirm({ open, onConfirm, onCancel, message }) {
  if (!open) return null

  return (
    <div className="logout-overlay" role="dialog" aria-modal="true">
      <div className="logout-modal" role="document">
        <p className="logout-message">{message || 'Are you sure you want to log out?'}</p>
        <div className="logout-actions">
          <button className="logout-btn cancel" onClick={onCancel}>Cancel</button>
          <button className="logout-btn confirm" onClick={onConfirm}>Log out</button>
        </div>
      </div>
    </div>
  )
}
