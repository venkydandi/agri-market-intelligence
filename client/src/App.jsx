import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Compare from './pages/Compare';
import MarketsExplorer from './pages/MarketsExplorer';
import Login from './pages/Login';
import Register from './pages/Register';
import ProtectedRoute from './components/ProtectedRoute';
import { LanguageProvider } from './context/LanguageContext';

import Footer from './components/Footer';

function App() {
  return (
    <LanguageProvider>
      <div className="min-h-screen flex flex-col bg-white text-gray-900 font-sans antialiased selection:bg-sky-500 selection:text-white">
        <Navbar />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/compare" element={<Compare />} />
            <Route path="/markets" element={<MarketsExplorer />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <div className="p-12 text-center text-gray-500 max-w-lg mx-auto">
                    <div className="text-4xl mb-2">🚜</div>
                    <h2 className="text-xl font-bold text-gray-800">Farmer Command Dashboard</h2>
                    <p className="text-sm text-gray-400 mt-1">Saved calculations, crop logs, and mandi alerts will appear here.</p>
                  </div>
                </ProtectedRoute>
              }
            />
            <Route
              path="*"
              element={
                <div className="flex flex-col items-center justify-center py-28 text-center px-4">
                  <span className="text-6xl animate-bounce">🌾</span>
                  <h2 className="mt-4 text-2xl font-black text-gray-800">404 — Page Not Found</h2>
                  <p className="text-sm text-gray-500 mt-1">The route you requested could not be located.</p>
                  <a
                    href="/"
                    className="mt-6 btn-pill-dark bg-gray-950 text-white font-bold py-2.5 px-6 rounded-full"
                  >
                    Return to AgriRoute Home →
                  </a>
                </div>
              }
            />
          </Routes>
        </main>
        <Footer />
      </div>
    </LanguageProvider>
  );
}

export default App;
