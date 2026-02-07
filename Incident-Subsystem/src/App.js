import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
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
          <Route path="/" element={<MainPage />} />
          <Route path="/file-complaint" element={<FileComplaintPage />} />
          <Route path="/incident-report" element={<IncidentReportPage />} />
          <Route path="/incident-map" element={<IncidentMapPage />} />
          <Route path="/case-management" element={<CaseManagementPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
