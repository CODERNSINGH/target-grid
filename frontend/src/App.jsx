import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import MainLayout from './layouts/MainLayout.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Leads from './pages/Leads.jsx';
import LeadDetail from './pages/LeadDetail.jsx';
import Leaderboard from './pages/Leaderboard.jsx';
import Events from './pages/Events.jsx';
import ScoringRules from './pages/ScoringRules.jsx';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="leads" element={<Leads />} />
          <Route path="leads/:id" element={<LeadDetail />} />
          <Route path="leaderboard" element={<Leaderboard />} />
          <Route path="events" element={<Events />} />
          <Route path="scoring-rules" element={<ScoringRules />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
