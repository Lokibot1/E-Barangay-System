import React, { useState } from "react";
import "./User_Services.css";
import FormSelectorModal from "./FormSelectorModal";

export default function User_Services() {
  const [modalOpen, setModalOpen] = useState(false);

  const documents = [
    { title: "Barangay ID", desc: "Official identification" },
    { title: "Certificate of Indigency", desc: "Proof of indigent status" },
    { title: "Certificate of Residency", desc: "Proof of residency" }
  ];

  return (
    <section id="services" className="ds-services">
      <h3 className="ds-services-title">Available e-Services</h3>

      <div className="ds-services-grid">
        <div className="ds-card" role="button" tabIndex={0} onClick={() => setModalOpen(true)} onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && setModalOpen(true)}>
          
          {/* Left Side - Icon/Button */}
          <div className="ds-card-left">
            <div className="ds-card-icon" aria-hidden>
              <svg viewBox="0 0 64 64" width="72" height="72" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M32 36c6.627 0 12-5.373 12-12S38.627 12 32 12 20 17.373 20 24s5.373 12 12 12z" stroke="#22c55e" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M8 52c0-8.837 10.745-16 24-16s24 7.163 24 16" stroke="#22c55e" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div className="ds-card-label">Document<br/>Services</div>
          </div>

          {/* Right Side - Document Info */}
          <div className="ds-card-right">
            <div className="ds-docs-list">
              {documents.map((doc, index) => (
                <div key={index} className="ds-doc-item">
                  <div className="ds-doc-icon">→</div>
                  <div className="ds-doc-content">
                    <div className="ds-doc-title">{doc.title}</div>
                    <div className="ds-doc-desc">{doc.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
      {modalOpen && <FormSelectorModal onClose={() => setModalOpen(false)} />}

    </section>
  );
}
