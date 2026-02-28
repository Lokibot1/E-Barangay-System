import { useEffect, useLayoutEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext";
import { UserProvider } from "./context/UserContext";

// Layout
import DashboardLayout from "./layout/DashboardLayout";

// Public Pages
import HomePage from "./homepage/HomePage";
import AuthPage from "./homepage/AuthPage";
// import PublicVerify from "./pages/publicverify"; 

// Dashboard Pages
import Dashboard from "./pages/dashboard";
import Residents from "./pages/residents";
// import Analytics from "./pages/analytics";
import Scanner from "./pages/qr";
import Verification from "./pages/verification";
import Households from "./pages/household";
import Certificates from "./pages/certificates";
import Support from "./pages/support";
import Settings from "./pages/settings";
import Logout from "./pages/logout";

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
    <ThemeProvider>
      <UserProvider>
        <Router>
          <ScrollToTop />
          <Routes>
            {/* PUBLIC ROUTES */}
            <Route path="/" element={<HomePage />} />
            <Route path="/auth" element={<AuthPage />} />
            
            {/*QR Scanner link*/}
            {/* <Route path="/verify/:id" element={<PublicVerify />} /> */}

            {/* PRIVATE ROUTES (Sidebar/DashboardLayout) */}
            <Route element={<DashboardLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/residents" element={<Residents />} />
              {/* <Route path="/analytics" element={<Analytics />} /> */}
              <Route path="/scanner" element={<Scanner />} />
              <Route path="/verification" element={<Verification />} />
              <Route path="/households" element={<Households />} />
              <Route path="/certificates" element={<Certificates />} />
              <Route path="/support" element={<Support />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/logout" element={<Logout />} />
            </Route>

            {/* FALLBACK */}
            <Route path="*" element={<HomePage />} />
          </Routes>
        </Router>
      </UserProvider>
    </ThemeProvider>
  );
}

export default App;
