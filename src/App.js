import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Fleet from './components/Fleet';
import Deliveries from './components/Deliveries';
import Drivers from './components/Drivers';
import Reports from './components/Reports';
import Settings from './components/Settings';
import './App.css';

const App = () => {
  return (
    <Router>
      <div className="app">
        <Sidebar />

        <div className="content">
          <Routes>
            <Route path="/" exact element={<Dashboard/>} />
            <Route path="/frota" element={<Fleet/>} />
            <Route path="/entregas" element={<Deliveries/>} />
            <Route path="/motoristas" element={<Drivers/>} />
            <Route path="/configuracoes" element={<Settings/>} />
          </Routes>
        </div>
      </div>
    </Router>
  );
};

export default App;
