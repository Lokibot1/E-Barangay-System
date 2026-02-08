import React from "react";
import { Link } from "react-router-dom";
import themeTokens from "../../Themetokens";

const Footer = ({ currentTheme }) => {
  const t = themeTokens[currentTheme];
  const currentYear = new Date().getFullYear();

  return (
    <footer className={`${t.cardBg} border-t ${t.cardBorder} py-8 mt-auto`}>
      <div className="container mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-6">
          {/* About Section */}
          <div>
            <h3 className={`text-lg font-bold ${t.cardText} mb-3 font-spartan`}>
              About Us
            </h3>
            <p className={`text-sm ${t.subtleText} font-kumbh`}>
              The Incident & Complaint Management System helps our community
              report and track incidents efficiently and securely.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className={`text-lg font-bold ${t.cardText} mb-3 font-spartan`}>
              Quick Links
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/incident-complaint/file-complaint"
                  className={`text-sm ${t.subtleText} hover:${t.primaryText} transition-colors font-kumbh`}
                >
                  File a Complaint
                </Link>
              </li>
              <li>
                <Link
                  to="/incident-complaint/incident-report"
                  className={`text-sm ${t.subtleText} hover:${t.primaryText} transition-colors font-kumbh`}
                >
                  Report an Incident
                </Link>
              </li>
              <li>
                <Link
                  to="/incident-complaint/incident-map"
                  className={`text-sm ${t.subtleText} hover:${t.primaryText} transition-colors font-kumbh`}
                >
                  Incident Map
                </Link>
              </li>
              <li>
                <Link
                  to="/incident-complaint/case-management"
                  className={`text-sm ${t.subtleText} hover:${t.primaryText} transition-colors font-kumbh`}
                >
                  Track Your Reports
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className={`text-lg font-bold ${t.cardText} mb-3 font-spartan`}>
              Contact Us
            </h3>
            <ul className="space-y-2">
              <li
                className={`text-sm ${t.subtleText} font-kumbh flex items-center gap-2`}
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
                barangay@example.com
              </li>
              <li
                className={`text-sm ${t.subtleText} font-kumbh flex items-center gap-2`}
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                  />
                </svg>
                (02) 1234-5678
              </li>
              <li
                className={`text-sm ${t.subtleText} font-kumbh flex items-start gap-2`}
              >
                <svg
                  className="w-4 h-4 mt-0.5 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                Barangay Hall, Quezon City
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className={`pt-6 border-t ${t.dividerBorder} text-center`}>
          <p className={`text-sm ${t.subtleText} font-kumbh`}>
            © {currentYear} Barangay Incident & Complaint Management System. All
            rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
