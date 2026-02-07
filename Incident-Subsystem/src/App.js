import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./components/shared/Layout";
import MainPage from "./pages/sub-system-3/MainPage";
import FileComplaintPage from "./pages/sub-system-3/FileComplaintPage";
import IncidentReportPage from "./pages/sub-system-3/IncidentReportPage";
import IncidentMapPage from "./pages/sub-system-3/IncidentMapPage";
import CaseManagementPage from "./pages/sub-system-3/CaseManagementPage";
import "./App.css";

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route element={<Layout />}>
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
        </Routes>
      </div>
    </Router>
  );
}

export default App;
