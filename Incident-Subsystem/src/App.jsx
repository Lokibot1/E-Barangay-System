import React, { useEffect, useLayoutEffect } from "react";
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
import Layout from "./components/shared/Layout";
import ProtectedRoute, {
  AdminRoute,
  UserRoute,
} from "./components/shared/ProtectedRoute";
import MainPage from "./pages/sub-system-3/MainPage";
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
import FileComplaintPage from "./pages/sub-system-3/FileComplaintPage";
import IncidentReportPage from "./pages/sub-system-3/IncidentReportPage";
import IncidentMapPage from "./pages/sub-system-3/IncidentMapPage";
import CaseManagementPage from "./pages/sub-system-3/CaseManagementPage";
import AdminLanding from "./pages/sub-system-3/admin/AdminLanding";
import AdminIncidentReports from "./pages/sub-system-3/admin/AdminIncidentReports";
import AdminAppointments from "./pages/sub-system-3/admin/AdminAppointments";
// RS Routes Imports
import HomePage from "./homepage/HomePage";
import AuthPage from "./homepage/AuthPage";
import LoginPage from "./pages/sub-system-3/LoginPage";
import Dashboard from "./pages/sub-system-1/dashboard";
import Residents from "./pages/sub-system-1/residents";
import Scanner from "./pages/sub-system-1/qr";
import Verification from "./pages/sub-system-1/verification";
import Households from "./pages/sub-system-1/household";
import Certificates from "./pages/sub-system-1/certificates";
import Support from "./pages/sub-system-1/support";
import Settings from "./pages/sub-system-1/settings";
import Logout from "./pages/sub-system-1/logout";
import "./App.css";
import "leaflet/dist/leaflet.css";


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

function App() {
  return (
    <LanguageProvider>
      <UserProvider>
        <Router>
          <ScrollToTop />
          <div className="App">
            <Routes>
            {/* PUBLIC ROUTES - HomePage as starting point */}
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/auth" element={<Navigate to="/login" replace />} />

            {/* User-only routes — admins get redirected to /admin */}
            <Route element={<UserRoute />}>
              <Route element={<UserRealTimeProvider><Layout /></UserRealTimeProvider>}>
                {/* Sub-System 2 Routes */}
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
                
                {/* Sub-System 3 Routes */}
                <Route path="/incident-complaint" element={<MainPage />} />
                <Route path="/incident-complaint/file-complaint" element={<FileComplaintPage />} />
                <Route path="/incident-complaint/incident-report" element={<IncidentReportPage />} />
                <Route path="/incident-complaint/incident-map" element={<IncidentMapPage />} />
                <Route path="/incident-complaint/case-management" element={<CaseManagementPage />} />
                
                {/* RS Dashboard Routes */}
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/residents" element={<Residents />} />
                <Route path="/scanner" element={<Scanner />} />
                <Route path="/verification" element={<Verification />} />
                <Route path="/households" element={<Households />} />
                <Route path="/certificates" element={<Certificates />} />
                <Route path="/support" element={<Support />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/logout" element={<Logout />} />
                <Route path="/documents-inquiry" element={<DocumentsInquiryPage />} />
              </Route>
            </Route>

            {/* Admin-only routes — regular users get redirected to / */}
            <Route element={<AdminRoute />}>
              <Route
                element={
                  <RealTimeProvider>
                    <Layout />
                  </RealTimeProvider>
                }
              >
                <Route path="/admin" element={<AdminLanding />} />
                <Route path="/admin/residents" element={<AdminPlaceholder title="Residents" />} />
                <Route path="/admin/requests" element={<AdminPlaceholder title="Requests" />} />
                <Route path="/admin/incidents" element={<AdminIncidentReports />} />
                <Route path="/admin/appointments" element={<AdminAppointments />} />
                <Route path="/admin/payments" element={<AccountsSection />} />
                <Route path="/admin/reports" element={<AdminPlaceholder title="Reports" />} />
                <Route path="/admin/documents-inquiry" element={<DocumentsInquiryPage />} />
                <Route path="/admin/user-management" element={<AdminPlaceholder title="User Management" />} />
                <Route path="/admin/settings" element={<AdminPlaceholder title="Settings" />} />
              </Route>
            </Route>

            {/* Catch-all — send unknown paths to home */}
            <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </Router>
      </UserProvider>
    </LanguageProvider>
  );
}

/** Temporary placeholder for admin pages not yet built */
const AdminPlaceholder = ({ title }) => (
  <div className="h-full flex items-center justify-center">
    <h1 className="text-2xl font-bold text-gray-400 font-spartan">{title}</h1>
  </div>
);

export default App;
