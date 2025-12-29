import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Header } from './components/Header';
import { MainContent } from './components/MainContent';
import { About } from './components/About';
import { Footer } from './components/Footer';
import { GlobalStyles } from './styles/GlobalStyles';

const App: React.FC = () => {
  return (
    <Router basename="/ImageCompressWebsite">
      <GlobalStyles />
      <Header />
      <Routes>
        <Route path="/" element={<MainContent />} />
        <Route path="/about" element={<About />} />
      </Routes>
      <Footer />
    </Router>
  );
};

export default App;
