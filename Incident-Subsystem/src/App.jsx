/**
 * App.js
 * Root component containing all routing logic and providers.
 * Location: src/App.js
 */

import React, { useEffect, useLayoutEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { LanguageProvider } from "./context/LanguageContext";
import { RealTimeProvider } from "./context/RealTimeContext";
import { UserRealTimeProvider } from "./context/UserRealTimeContext";
import { UserProvider } from "./context/UserContext";
import { BrandingProvider } from "./context/BrandingContext";
import Layout from "./components/shared/Layout";

// ── Route guards ─────────────────────────────────────────────────────────────
import ProtectedRoute, {
  AdminRoute,
  UserRoute,
} from "./homepage/ProtectedRoute";

// ── Sub-System 2 pages ───────────────────────────────────────────────────────
import SubSystem2MainPage from "./pages/sub-system-2/MainPage";
import Req_BIDPage from "./pages/sub-system-2/Req_BIDPage";
import Req_COIPage from "./pages/sub-system-2/Req_COIPage";
import Req_CORPage from "./pages/sub-system-2/Req_CORPage";
import Req_Sub_BID from "./pages/sub-system-2/Req_Sub_BID";
import Req_Sub_COI from "./pages/sub-system-2/Req_Sub_COI";
import Req_Sub_COR from "./pages/sub-system-2/Req_Sub_COR";
import Track_BID from "./pages/sub-system-2/Track_BID";
import Track_COI from "./pages/sub-system-2/Track_COI";
import Track_COR from "./pages/sub-system-2/Track_COR";
import DocumentsInquiryPage from "./pages/sub-system-2/DocumentsInquiryPage";
import AccountsSection from "./components/sub-system-2/accounts/AccountsSection";

// ── Sub-System 3 pages ───────────────────────────────────────────────────────
import MainPage from "./pages/sub-system-3/MainPage";
import FileComplaintPage from "./pages/sub-system-3/FileComplaintPage";
import IncidentReportPage from "./pages/sub-system-3/IncidentReportPage";
import IncidentMapPage from "./pages/sub-system-3/IncidentMapPage";
import CaseManagementPage from "./pages/sub-system-3/CaseManagementPage";
import AdminLanding from "./pages/sub-system-3/admin/AdminLanding";
import AdminIncidentReports from "./pages/sub-system-3/admin/AdminIncidentReports";
import AdminAppointments from "./pages/sub-system-3/admin/AdminAppointments";
import ResetPasswordPage from "./pages/sub-system-3/ResetPasswordPage";
import CreateAccounts from "./pages/sub-system-3/admin/CreateAccounts";

// ── Sub-System 1 (RS) pages ──────────────────────────────────────────────────
import Dashboard from "./pages/sub-system-1/dashboard";
import Residents from "./pages/sub-system-1/residents";
import AddResident from "./components/sub-system-1/residents/add/AddResident"; 
import Verification from "./pages/sub-system-1/verification";
import Households from "./pages/sub-system-1/household";
import Certificates from "./pages/sub-system-1/certificates";
import Support from "./pages/sub-system-1/support";
import Settings from "./pages/sub-system-1/settings";
import ProfilePage from "./pages/shared/ProfilePage";
import Logout from "./homepage/logout";
import VerificationNotificationListener from "./components/sub-system-1/common/VerificationNotificationListener";

// ── Homepage / public pages ───────────────────────────────────────────────────
import HomePage from "./homepage/HomePage";
import LoginPage from "./homepage/login/LoginPage";
import SignupPage from "./homepage/signup/SignUpPage";

import { DebugAutofill } from "./homepage/utils/DevAutoFill";

import "./App.css";
import "leaflet/dist/leaflet.css";

// ── Scroll-to-top on every route change ──────────────────────────────────────
function ScrollToTop() {
  const { pathname, key } = useLocation();

  useEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
  }, []);

  useLayoutEffect(() => {
    const scrollRoot = document.scrollingElement || document.documentElement;
    scrollRoot.scrollTop = 0;
    document.body.scrollTop = 0;
    window.scrollTo(0, 0);

    const rafId = window.requestAnimationFrame(() => {
      window.scrollTo(0, 0);
      scrollRoot.scrollTop = 0;
    });

    return () => window.cancelAnimationFrame(rafId);
  }, [pathname, key]);

  return null;
}

function DebugAutofillGate({ setFormData }) {
  const { pathname } = useLocation();
  const allowedPaths = ["/signup", "/admin/residents/add", "/residents/add"];
  const shouldShow = allowedPaths.some((path) => pathname.startsWith(path));

  if (!shouldShow) return null;
  return <DebugAutofill setFormData={setFormData} />;
}

// ── App ───────────────────────────────────────────────────────────────────────
function App() {

  const [activeSetFormData, setActiveSetFormData] = useState(null);

  useEffect(() => {
    const handleRegisterSetter = (e) => {
 
      if (typeof e.detail === 'function') {
        setActiveSetFormData(() => e.detail);
      }
    };
    
    window.addEventListener('REGISTER_SETTER', handleRegisterSetter);
 
    window.dispatchEvent(new CustomEvent('REQUEST_SETTER_REFRESH'));

    return () => window.removeEventListener('REGISTER_SETTER', handleRegisterSetter);
  }, []);

  return (
    <LanguageProvider>
      <UserProvider>
        <BrandingProvider>
          <Router>
            <ScrollToTop />
            <div className="App">
              <Routes>

              {/* ── PUBLIC ROUTES ───────────────────────────────────── */}
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
              <Route path="/auth" element={<Navigate to="/login" replace />} />

              {/* ── USER-ONLY ROUTES ─────────────────────────────────── */}
              <Route element={<UserRoute />}>
                <Route
                  element={
                    <UserRealTimeProvider>
                      <Layout />
                    </UserRealTimeProvider>
                  }
                >
                  <Route path="/sub-system-2" element={<SubSystem2MainPage />} />
                  <Route path="/sub-system-2/req-bid" element={<Req_BIDPage />} />
                  <Route path="/sub-system-2/req-coi" element={<Req_COIPage />} />
                  <Route path="/sub-system-2/req-cor" element={<Req_CORPage />} />
                  <Route path="/sub-system-2/req-sub-bid" element={<Req_Sub_BID />} />
                  <Route path="/sub-system-2/req-sub-coi" element={<Req_Sub_COI />} />
                  <Route path="/sub-system-2/req-sub-cor" element={<Req_Sub_COR />} />
                  <Route path="/sub-system-2/track-bid" element={<Track_BID />} />
                  <Route path="/sub-system-2/track-coi" element={<Track_COI />} />
                  <Route path="/sub-system-2/track-cor" element={<Track_COR />} />

                  <Route path="/incident-complaint" element={<MainPage />} />
                  <Route path="/incident-complaint/file-complaint" element={<FileComplaintPage />} />
                  <Route path="/incident-complaint/incident-report" element={<IncidentReportPage />} />
                  <Route path="/incident-complaint/incident-map" element={<IncidentMapPage />} />
                  <Route path="/incident-complaint/case-management" element={<CaseManagementPage />} />

                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/residents" element={<Residents />} />
                  <Route path="/verification" element={<Verification />} />
                  <Route path="/households" element={<Households />} />
                  <Route path="/certificates" element={<Certificates />} />
                  <Route path="/support" element={<Support />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/profile" element={<ProfilePage />} />
                  <Route path="/logout" element={<Logout />} />
                  <Route path="/documents-inquiry" element={<DocumentsInquiryPage />} />
                </Route>
              </Route>

              {/* ── ADMIN-ONLY ROUTES ────────────────────────────────── */}
              <Route element={<AdminRoute />}>
                <Route
                  element={
                    <RealTimeProvider>
                      <VerificationNotificationListener />
                      <Layout />
                    </RealTimeProvider>
                  }
                >
                  <Route path="/admin" element={<AdminLanding />} />
                  <Route path="/admin/residents" element={<Residents />} />
                  <Route path="/admin/residents/add" element={<AddResident />} />
                  <Route path="/admin/households" element={<Households />} />
                  <Route path="/admin/user-management" element={<Verification />} />
                  <Route path="/admin/requests" element={<AdminPlaceholder title="Requests" />} />
                  <Route path="/admin/incidents" element={<AdminIncidentReports />} />
                  <Route path="/admin/appointments" element={<AdminAppointments />} />
                  <Route path="/admin/payments" element={<AccountsSection />} />
                  <Route path="/admin/reports" element={<Dashboard />} />
                  <Route path="/admin/documents-inquiry" element={<DocumentsInquiryPage />} />
                  <Route path="/admin/certificates" element={<Certificates />} />
                  <Route path="/admin/settings" element={<Settings />} />
                  <Route path="/admin/profile" element={<ProfilePage />} />
                  <Route path="/admin/support" element={<Support />} />
                  <Route path="/admin/accounts" element={<CreateAccounts />} />
                </Route>
              </Route>

              <Route path="*" element={<Navigate to="/" replace />} />

              </Routes>
              
              <DebugAutofillGate setFormData={activeSetFormData} />
              
            </div>
          </Router>
        </BrandingProvider>
      </UserProvider>
    </LanguageProvider>
  );
}

const AdminPlaceholder = ({ title }) => (
  <div className="h-full flex items-center justify-center">
    <h1 className="text-2xl font-bold text-gray-400 font-spartan">{title}</h1>
  </div>
);

export default App;
