import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import './App.css';
import Login from './Components/Login.jsx';
import Homepage from './Components/Homepage.jsx';
import DirectorGeneral from './Components/DirectorGeneral.jsx';
import HeadofDepartmentplanningStatistic from './Components/HeadOfDepartmentPlanningStatistic.jsx';
import ReseacherDashboard from './Components/ResearcherDashboard.jsx';
import HeadOfDepartmentLab from './Components/HeadOfDepartmentLab.jsx';
import HeadOfDepartmentResearcher from './Components/HeadOfDepartmentResearcher.jsx';
import HeadOfDivisionlab from './Components/HeadOfDivisionlab.jsx';
import HeadOfDivisionResearcher from './Components/HeadOfDivisionResearcher.jsx';
import HeadOfDivisionplan from './Components/HeadOfDivisionplan.jsx';
import LabTechnician from "./Components/LabTechnician.jsx";
import LabRegister from './Components/LabRegister.jsx';
import AssistantResearcher from "./Components/AssistantResearcher.jsx";

function PlaceholderDashboard({ title }) {
  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: "2rem",
      fontWeight: "bold"
    }}>
      {title}
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/login" element={<Login />} />
        
        {/* Research - These stay in System A */}
        <Route path="/research/researcher-dashboard" element={<ReseacherDashboard/>} />
        <Route path="/research/assistant-dashboard" element={<AssistantResearcher />} />
        <Route path="/research/division-dashboard" element={<HeadOfDivisionResearcher />} />
        <Route path="/research/department-dashboard" element={<HeadOfDepartmentResearcher />} />
        
        {/* Laboratory - These stay in System A */}
        <Route path="/laboratory/registry-dashboard" element={<LabRegister />} />
        <Route path="/laboratory/technician-dashboard" element={<LabTechnician />} />
        <Route path="/laboratory/division-dashboard" element={<HeadOfDivisionlab />} />
        <Route path="/laboratory/department-dashboard" element={<HeadOfDepartmentLab />} />
        
        {/* Administration - This stays in System A */}
        <Route path="/administration/division-dashboard" element={<PlaceholderDashboard title="Administration Division Dashboard" />} />
        
        {/* Directorate - This stays in System A */}
        <Route path="/directorate/general-dashboard" element={<DirectorGeneral />} />
        
        {/* Admin / fallback */}
        <Route path="/admin-dashboard" element={<PlaceholderDashboard title="Admin Dashboard" />} />
        <Route path="/manager-dashboard" element={<PlaceholderDashboard title="Manager Dashboard" />} />
        <Route path="/staff-dashboard" element={<PlaceholderDashboard title="Staff Dashboard" />} />
        <Route path="/guest-dashboard" element={<PlaceholderDashboard title="Guest Dashboard" />} />
        
        {/* Planning routes redirect to PSMS via SSO - NO local routes needed */}
        
        {/* catch-all */}
        <Route path="*" element={<PlaceholderDashboard title="Not Found / Dashboard" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;