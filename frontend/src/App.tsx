import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import LandingPage from './components/LandingPage';
import Dashboard from './components/Dashboard';
import CaseResearch from './components/pages/CaseResearch';
import ContractAnalysis from './components/pages/ContractAnalysis';
import LegalNews from './components/pages/LegalNews';
import ChatWidget from './components/ChatWidget';
import FamilyCourtForm from './components/pages/FamilyCourtForm';
import BailForm from './components/pages/BailFormFiller';
import AffidavitOfServiceForm from './components/pages/AffidavitOfServiceForm';
import SurrenderPetitionForm from './components/pages/SurrenderPetitionForm';
import FindLawyer from './components/pages/FindLawyer';
 
import Auth from './components/pages/Auth';
import { AuthProvider } from './contexts/AuthContext';

function App() {
  return (
    <AuthProvider>
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/auth" element={<Auth />} />
        <Route
          path="/*"
          element={
            <div className="flex flex-col md:flex-row min-h-screen bg-gray-50">
              <Sidebar />
              <main className="flex-1 overflow-auto">
                <Routes>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/cases" element={<CaseResearch />} />
                  <Route path="/contracts" element={<ContractAnalysis />} />
                  <Route path="/news" element={<LegalNews />} />
                  
                  <Route path="/forms/family-court" element={<FamilyCourtForm />} />
                  <Route path="/forms/bail" element={<BailForm />} />
                  <Route path="/forms/affidavit" element={<AffidavitOfServiceForm />} />
                  <Route path="/forms/surrender" element={<SurrenderPetitionForm />} />
                  <Route path="/find-lawyer" element={<FindLawyer />} />
                  
                </Routes>
              </main>
              <ChatWidget />
            </div>
          }
        />
      </Routes>
    </Router>
  </AuthProvider>
  );
}

export default App