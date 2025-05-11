
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import TermsPage from './pages/TermsPage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import About from './pages/About';
import MapPage from './pages/MapPage';
import ProfilePage from './pages/ProfilePage';
import SavedPlacesPage from './pages/SavedPlacesPage';
import AddPlacePage from './pages/AddPlacePage';
import Dashboard from './pages/Dashboard';
import NotFound from './pages/NotFound';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from "./components/theme-provider";
import { Toaster } from 'sonner'
import ProtectedRoute from './components/ProtectedRoute';
import FindFriendsPage from './pages/FindFriendsPage';
import SearchUsersPage from './pages/SearchUsersPage';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ThemeProvider>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/terms" element={<TermsPage />} />
            <Route path="/privacy" element={<PrivacyPolicyPage />} />
            <Route path="/about" element={<About />} />
            <Route path="/map" element={<MapPage />} />
            <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
            <Route path="/profile/:id" element={<ProfilePage />} />
            <Route path="/saved" element={<ProtectedRoute><SavedPlacesPage /></ProtectedRoute>} />
            <Route path="/add" element={<ProtectedRoute><AddPlacePage /></ProtectedRoute>} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/find-friends" element={<FindFriendsPage />} />
            <Route path="/search-users" element={<SearchUsersPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          <Toaster position="bottom-right" />
        </ThemeProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
