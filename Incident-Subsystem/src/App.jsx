/**
 * App.js
 * Root component containing all routing logic and providers.
 * Location: src/App.js
 */

import React, { Suspense, lazy, useEffect, useLayoutEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { LanguageProvider } from "./context/LanguageContext";
import { RealTimeProvider } from "./context/RealTimeContext";
import { UserRealTimeProvider } from "./context/UserRealTimeContext";
import { UserProvider } from "./context/UserContext";
import { BrandingProvider } from "./context/BrandingContext";
import Layout from "./components/shared/Layout";
import RouteErrorBoundary from "./components/shared/RouteErrorBoundary";
import RouteLoadingFallback from "./components/shared/RouteLoadingFallback";

// ── Route guards ─────────────────────────────────────────────────────────────
import ProtectedRoute, {
  AdminRoute,
  StaffRoute,
  UserRoute,
  PermissionRoute,
} from "./homepage/ProtectedRoute";

// ── Sub-System 2 pages ───────────────────────────────────────────────────────

// ── Sub-System 3 pages ───────────────────────────────────────────────────────

// ── Sub-System 1 (RS) pages ──────────────────────────────────────────────────
import VerificationNotificationListener from "./components/sub-system-1/common/VerificationNotificationListener";
import { installGlobalClientErrorLogging } from "./utils/systemDiagnostics";

// ── Homepage / public pages ───────────────────────────────────────────────────

import { DebugAutofill } from "./homepage/utils/DevAutoFill";

import "./App.css";
import "leaflet/dist/leaflet.css";
import {
  AUTH_UNAUTHORIZED_EVENT,
  canAccessVerificationQueue,
  canEditRecords,
  canManageAccounts,
  canManageSystemSettings,
  canViewAnalytics,
  canViewAppointments,
  canViewDocuments,
  canViewIncidentCases,
  canViewResidents,
  DEFAULT_SESSION_EXPIRED_MESSAGE,
} from "./homepage/services/loginService";

const DEBUG_AUTOFILL_VISIBILITY_EVENT = "DEBUG_AUTOFILL_VISIBILITY";

const HomePage = lazy(() => import("./homepage/HomePage"));
const LoginPage = lazy(() => import("./homepage/login/LoginPage"));
const SignupPage = lazy(() => import("./homepage/signup/SignUpPage"));
const ResetPasswordPage = lazy(() => import("./pages/sub-system-3/ResetPasswordPage"));
const Logout = lazy(() => import("./homepage/logout"));
const PublicVerify = lazy(() => import("./pages/sub-system-1/id"));

const SubSystem2MainPage = lazy(() => import("./pages/sub-system-2/MainPage"));
const Req_BIDPage = lazy(() => import("./pages/sub-system-2/Req_BIDPage"));
const Req_COIPage = lazy(() => import("./pages/sub-system-2/Req_COIPage"));
const Req_CORPage = lazy(() => import("./pages/sub-system-2/Req_CORPage"));
const Req_Sub_BID = lazy(() => import("./pages/sub-system-2/Req_Sub_BID_Success"));
const Req_Sub_COI = lazy(() => import("./pages/sub-system-2/Req_Sub_COI_Success"));
const Req_Sub_COR = lazy(() => import("./pages/sub-system-2/Req_Sub_COR_Success"));
const Track_BID = lazy(() => import("./pages/sub-system-2/Track_BID"));
const Track_COI = lazy(() => import("./pages/sub-system-2/Track_COI"));
const Track_COR = lazy(() => import("./pages/sub-system-2/Track_COR"));
const DocumentsInquiryPage = lazy(() => import("./pages/sub-system-2/DocumentsInquiryPage"));
const AccountsSection = lazy(() => import("./components/sub-system-2/accounts/AccountsSection"));

const MainPage = lazy(() => import("./pages/sub-system-3/MainPage"));
const FileComplaintPage = lazy(() => import("./pages/sub-system-3/FileComplaintPage"));
const IncidentReportPage = lazy(() => import("./pages/sub-system-3/IncidentReportPage"));
const IncidentMapPage = lazy(() => import("./pages/sub-system-3/IncidentMapPage"));
const CaseManagementPage = lazy(() => import("./pages/sub-system-3/CaseManagementPage"));
const AdminLanding = lazy(() => import("./pages/sub-system-3/admin/AdminLanding"));
const AdminIncidentReports = lazy(() => import("./pages/sub-system-3/admin/AdminIncidentReports"));
const AdminAppointments = lazy(() => import("./pages/sub-system-3/admin/AdminAppointments"));
const CreateAccounts = lazy(() => import("./pages/sub-system-3/admin/CreateAccounts"));
const StaffLanding = lazy(() => import("./pages/staff/StaffLanding"));

const Dashboard = lazy(() => import("./pages/sub-system-1/dashboard"));
const Residents = lazy(() => import("./pages/sub-system-1/residents"));
const AddResident = lazy(() => import("./components/sub-system-1/residents/add/AddResident"));
const Verification = lazy(() => import("./pages/sub-system-1/verification"));
const Households = lazy(() => import("./pages/sub-system-1/household"));
const Certificates = lazy(() => import("./pages/sub-system-1/certificates"));
const Support = lazy(() => import("./pages/sub-system-1/support"));
const Settings = lazy(() => import("./pages/sub-system-1/settings"));
const ProfilePage = lazy(() => import("./pages/shared/ProfilePage"));
const MyRequestsPage = lazy(() => import("./pages/shared/MyRequestsPage"));
const SecondFactorPage = lazy(() => import("./pages/shared/SecondFactorPage"));
const NotFoundPage = lazy(() => import("./pages/shared/NotFoundPage"));
const VerifyDocumentPage = lazy(() => import("./pages/sub-system-2/VerifyDocumentPage"));

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

function AuthSessionWatcher() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleUnauthorized = (event) => {
      const message =
        event?.detail?.message || DEFAULT_SESSION_EXPIRED_MESSAGE;

      if (location.pathname === "/login") {
        return;
      }

      navigate("/login", {
        replace: true,
        state: {
          sessionExpired: true,
          message,
          from: location.pathname,
        },
      });
    };

    window.addEventListener(AUTH_UNAUTHORIZED_EVENT, handleUnauthorized);

    return () => {
      window.removeEventListener(AUTH_UNAUTHORIZED_EVENT, handleUnauthorized);
    };
  }, [location.pathname, navigate]);

  return null;
}

function DebugAutofillGate({ setFormData }) {
  const { pathname } = useLocation();
  const [isHidden, setIsHidden] = useState(false);
  const allowedPaths = ["/signup", "/admin/residents/add", "/residents/add"];
  const shouldShow = allowedPaths.some((path) => pathname.startsWith(path));

  useEffect(() => {
    const handleVisibilityChange = (event) => {
      setIsHidden(Boolean(event.detail));
    };

    window.addEventListener(
      DEBUG_AUTOFILL_VISIBILITY_EVENT,
      handleVisibilityChange,
    );

    return () => {
      window.removeEventListener(
        DEBUG_AUTOFILL_VISIBILITY_EVENT,
        handleVisibilityChange,
      );
    };
  }, []);

  if (!shouldShow || isHidden) return null;
  return <DebugAutofill setFormData={setFormData} />;
}

// ── App ───────────────────────────────────────────────────────────────────────
function App() {

  const [activeSetFormData, setActiveSetFormData] = useState(null);

  useEffect(() => {
    installGlobalClientErrorLogging();
  }, []);

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
            <AuthSessionWatcher />
            <div className="App">
              <RouteErrorBoundary>
                <Suspense fallback={<RouteLoadingFallback />}>
                  <Routes>

              {/* ── PUBLIC ROUTES ───────────────────────────────────── */}
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
              <Route path="/verify/:id" element={<PublicVerify />} />
              <Route path="/sub-system-2/verify-document" element={<VerifyDocumentPage />} />
              <Route path="/auth" element={<Navigate to="/login" replace />} />

              <Route element={<ProtectedRoute />}>
                <Route path="/second-factor" element={<SecondFactorPage />} />
              </Route>

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

                  <Route path="/report-issue" element={<Support />} />
                  <Route path="/support" element={<Support />} />
                  <Route path="/profile" element={<ProfilePage />} />
                  <Route path="/logout" element={<Logout />} />
                  <Route path="/documents-inquiry" element={<Navigate to="/sub-system-2" replace />} />
                  <Route path="/my-requests" element={<MyRequestsPage />} />
                </Route>
              </Route>

              {/* ── ADMIN-ONLY ROUTES ────────────────────────────────── */}
              <Route element={<StaffRoute />}>
                <Route
                  element={
                    <RealTimeProvider>
                      <VerificationNotificationListener />
                      <Layout />
                    </RealTimeProvider>
                  }
                >
                  <Route path="/staff" element={<StaffLanding />} />

                  <Route
                    element={
                      <PermissionRoute
                        allowed={canViewResidents}
                        redirectTo="/staff"
                      />
                    }
                  >
                    <Route path="/staff/residents" element={<Residents />} />
                    <Route path="/staff/households" element={<Households />} />
                  </Route>

                  <Route
                    element={
                      <PermissionRoute
                        allowed={canEditRecords}
                        redirectTo="/staff"
                      />
                    }
                  >
                    <Route path="/staff/residents/add" element={<AddResident />} />
                  </Route>

                  <Route
                    element={
                      <PermissionRoute
                        allowed={canAccessVerificationQueue}
                        redirectTo="/staff"
                      />
                    }
                  >
                    <Route path="/staff/user-management" element={<Verification />} />
                  </Route>

                  <Route
                    element={
                      <PermissionRoute
                        allowed={canViewIncidentCases}
                        redirectTo="/staff"
                      />
                    }
                  >
                    <Route path="/staff/incidents" element={<AdminIncidentReports />} />
                  </Route>

                  <Route
                    element={
                      <PermissionRoute
                        allowed={canViewAppointments}
                        redirectTo="/staff"
                      />
                    }
                  >
                    <Route path="/staff/appointments" element={<AdminAppointments />} />
                  </Route>

                  <Route
                    element={
                      <PermissionRoute
                        allowed={canViewDocuments}
                        redirectTo="/staff"
                      />
                    }
                  >
                    <Route path="/staff/documents-inquiry" element={<DocumentsInquiryPage />} />
                    <Route path="/staff/certificates" element={<Certificates />} />
                  </Route>

                  <Route path="/staff/profile" element={<ProfilePage />} />
                  <Route path="/staff/support" element={<Support />} />
                </Route>
              </Route>

              <Route element={<AdminRoute />}>
                <Route
                  element={
                    <RealTimeProvider>
                      <VerificationNotificationListener />
                      <Layout />
                    </RealTimeProvider>
                  }
                >
                  <Route element={<PermissionRoute allowed={canViewAnalytics} />}>
                    <Route path="/admin" element={<AdminLanding />} />
                    <Route path="/admin/reports" element={<Dashboard />} />
                    <Route path="/dashboard" element={<Navigate to="/admin/reports" replace />} />
                  </Route>

                  <Route element={<PermissionRoute allowed={canViewResidents} />}>
                    <Route path="/admin/residents" element={<Residents />} />
                    <Route path="/admin/households" element={<Households />} />
                    <Route path="/residents" element={<Navigate to="/admin/residents" replace />} />
                    <Route path="/households" element={<Navigate to="/admin/households" replace />} />
                  </Route>

                  <Route element={<PermissionRoute allowed={canEditRecords} />}>
                    <Route path="/admin/residents/add" element={<AddResident />} />
                  </Route>

                  <Route element={<PermissionRoute allowed={canAccessVerificationQueue} />}>
                    <Route path="/admin/user-management" element={<Verification />} />
                    <Route path="/admin/requests" element={<AdminPlaceholder title="Requests" />} />
                    <Route path="/verification" element={<Navigate to="/admin/user-management" replace />} />
                  </Route>

                  <Route element={<PermissionRoute allowed={canViewIncidentCases} />}>
                    <Route path="/admin/incidents" element={<AdminIncidentReports />} />
                  </Route>

                  <Route element={<PermissionRoute allowed={canViewAppointments} />}>
                    <Route path="/admin/appointments" element={<AdminAppointments />} />
                  </Route>

                  <Route element={<PermissionRoute allowed={canViewDocuments} />}>
                    <Route path="/admin/documents-inquiry" element={<DocumentsInquiryPage />} />
                    <Route path="/admin/certificates" element={<Certificates />} />
                    <Route path="/certificates" element={<Navigate to="/admin/certificates" replace />} />
                  </Route>

                  <Route element={<PermissionRoute allowed={canManageAccounts} />}>
                    <Route path="/admin/payments" element={<AccountsSection />} />
                    <Route path="/admin/accounts" element={<CreateAccounts />} />
                  </Route>

                  <Route element={<PermissionRoute allowed={canManageSystemSettings} />}>
                    <Route path="/admin/settings" element={<Settings />} />
                    <Route path="/settings" element={<Navigate to="/admin/settings" replace />} />
                  </Route>

                  <Route path="/admin/profile" element={<ProfilePage />} />
                  <Route path="/admin/support" element={<Support />} />
                </Route>
              </Route>

              <Route path="*" element={<NotFoundPage />} />

                  </Routes>
                </Suspense>
              </RouteErrorBoundary>
              
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
