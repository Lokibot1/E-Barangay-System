import React from "react";
import { Link } from 'react-router-dom';
import "./User_Hero.css";

export default function User_Hero() {
  return (
    <section className="ds-hero">
      <div className="ds-hero-overlay" />
      <div className="ds-hero-inner">
        <h2 className="ds-hero-pre">Welcome to</h2>
        <h1 className="ds-hero-title">Barangay San Bartolome
          <br />Office Services Portal
        </h1>
        <p className="ds-hero-sub">Your gateway to fast, easy, and secure community service</p>

        <div className="ds-hero-ctas">
          <Link className="btn-primary" to="/login">Login / Register</Link>
          <button className="btn-outline">Browse Services</button>
        </div>
      </div>
    </section>
  );
}
