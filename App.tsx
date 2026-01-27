import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Editor } from './pages/Editor';
import { TVDisplay } from './pages/TVDisplay';

const App: React.FC = () => {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Editor />} />
        <Route path="/tv" element={<TVDisplay />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  );
};

export default App;