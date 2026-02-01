import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import IncidentReportPage from "./pages/IncidentReportPage";
import CaseManagementPage from "./pages/CaseManagementPage";
import "./App.css";

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<IncidentReportPage />} />
          <Route path="/reports" element={<IncidentReportPage />} />
          <Route
            path="/reports/case-management"
            element={<CaseManagementPage />}
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
