import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './components/LoginPage';
import RegistrationForm from './components/RegistrationForm';
import TestPage from './components/TestPage';
import ResultsPage from './components/ResultsPage';
import Dashboard from './components/Dashboard';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/register" element={<RegistrationForm />} />
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/test/:testId" 
            element={
              <ProtectedRoute>
                <TestPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/results/:testId" 
            element={
              <ProtectedRoute>
                <ResultsPage />
              </ProtectedRoute>
            } 
          />
          {/* Старые маршруты для обратной совместимости */}
          <Route 
            path="/test" 
            element={
              <ProtectedRoute>
                <TestPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/results" 
            element={
              <ProtectedRoute>
                <ResultsPage />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App; 