import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import WelcomePage from './WelcomePage';
import MainApp from './MainApp';
import './App.css';
import { LanguageProvider } from './context/LanguageContext'; // LanguageProvider import et

const App = () => {
  return (
    <LanguageProvider>
      <Router>
        <Routes>
          <Route path="/" element={<WelcomePage />} />
          <Route path="/app" element={<MainApp />} />
        </Routes>
      </Router>
    </LanguageProvider>
  );
};

export default App;