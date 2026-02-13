import React from "react";
import "./User_Announcements.css";

const items = [
  { date: "Feb 1", text: "Student Aid: Applications for Edu-Assistance now OPEN." },
  { date: "Feb 2", text: "Social Pension: Q1 Cash release for Senior Citizens starts this Monday." },
  { date: "Feb 3", text: "Updated Guidelines for business renewals." },
];

export default function User_Announcements() {
  return (
    <section className="ds-announcements">
      <div className="ds-ann-inner">
        <h3 className="ds-ann-title">Latest Announcements</h3>

        <ul className="ds-ann-list">
          {items.map((it, i) => (
            <li key={i} className="ds-ann-item">
              <span className="ds-ann-date">{it.date}</span>
              <span className="ds-ann-text">{it.text}</span>
            </li>
          ))}
        </ul>

        <div className="ds-ann-footer">
          <a href="#" className="ds-ann-view-all">View All Announcements →</a>
        </div>
      </div>
    </section>
  );
}
