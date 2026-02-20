import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { LanguageProvider } from "./context/LanguageContext";
import { RealTimeProvider } from "./context/RealTimeContext";
import { UserRealTimeProvider } from "./context/UserRealTimeContext";
import Layout from "./components/shared/Layout";
import ProtectedRoute, {
  AdminRoute,
  UserRoute,
} from "./components/shared/ProtectedRoute";
import LoginPage from "./pages/sub-system-3/LoginPage";
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
import FileComplaintPage from "./pages/sub-system-3/FileComplaintPage";
import IncidentReportPage from "./pages/sub-system-3/IncidentReportPage";
import IncidentMapPage from "./pages/sub-system-3/IncidentMapPage";
import CaseManagementPage from "./pages/sub-system-3/CaseManagementPage";
import AdminLanding from "./pages/sub-system-3/admin/AdminLanding";
import AdminIncidentReports from "./pages/sub-system-3/admin/AdminIncidentReports";
import "./App.css";
import "leaflet/dist/leaflet.css";

function App() {
  return (
    <LanguageProvider>
      <Router>
        <div className="App">
          <Routes>
            {/* Public route */}
            <Route path="/login" element={<LoginPage />} />

            {/* User-only routes — admins get redirected to /admin */}
            <Route element={<UserRoute />}>
              <Route element={<UserRealTimeProvider><Layout /></UserRealTimeProvider>}>
                <Route
                  path="/"
                  element={
                    <div className="h-full flex items-center justify-center">
                      <h1 className="text-2xl font-bold text-gray-400 font-spartan">
                        E-Barangay System Dashboard
                      </h1>
                    </div>
                  }
                />
                <Route path="/sub-system-2" element={<SubSystem2MainPage />} />
                <Route
                  path="/sub-system-2/req-bid"
                  element={<Req_BIDPage />}
                />
                <Route
                  path="/sub-system-2/req-coi"
                  element={<Req_COIPage />}
                />
                <Route
                  path="/sub-system-2/req-cor"
                  element={<Req_CORPage />}
                />
                <Route
                  path="/sub-system-2/req-sub-bid"
                  element={<Req_Sub_BID />}
                />
                <Route
                  path="/sub-system-2/req-sub-coi"
                  element={<Req_Sub_COI />}
                />
                <Route
                  path="/sub-system-2/req-sub-cor"
                  element={<Req_Sub_COR />}
                />
                <Route path="/sub-system-2/track-bid" element={<Track_BID />} />
                <Route path="/sub-system-2/track-coi" element={<Track_COI />} />
                <Route path="/sub-system-2/track-cor" element={<Track_COR />} />
                <Route path="/incident-complaint" element={<MainPage />} />
                <Route
                  path="/incident-complaint/file-complaint"
                  element={<FileComplaintPage />}
                />
                <Route
                  path="/incident-complaint/incident-report"
                  element={<IncidentReportPage />}
                />
                <Route
                  path="/incident-complaint/incident-map"
                  element={<IncidentMapPage />}
                />
                <Route
                  path="/incident-complaint/case-management"
                  element={<CaseManagementPage />}
                />
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
                {/* Placeholder admin pages — replace with real components later */}
                <Route
                  path="/admin/residents"
                  element={<AdminPlaceholder title="Residents" />}
                />
                <Route
                  path="/admin/requests"
                  element={<AdminPlaceholder title="Requests" />}
                />
                <Route
                  path="/admin/incidents"
                  element={<AdminIncidentReports />}
                />
                <Route
                  path="/admin/appointments"
                  element={<AdminPlaceholder title="Appointments" />}
                />
                <Route
                  path="/admin/payments"
                  element={<AdminPlaceholder title="Payments" />}
                />
                <Route
                  path="/admin/reports"
                  element={<AdminPlaceholder title="Reports" />}
                />
                <Route
                  path="/admin/user-management"
                  element={<AdminPlaceholder title="User Management" />}
                />
                <Route
                  path="/admin/settings"
                  element={<AdminPlaceholder title="Settings" />}
                />
              </Route>
            </Route>

            {/* Catch-all — send unknown paths to login */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </div>
      </Router>
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
