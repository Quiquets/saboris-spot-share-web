
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import MapPage from "./pages/MapPage";
import AddPlacePage from "./pages/AddPlacePage";
import SavedPlacesPage from "./pages/SavedPlacesPage";
import ProfilePage from "./pages/ProfilePage";
import NotFound from "./pages/NotFound";
import TermsPage from "./pages/TermsPage";
import PrivacyPolicyPage from "./pages/PrivacyPolicyPage";
import SearchUsersPage from "./pages/SearchUsersPage";
import FeedPage from "./pages/FeedPage";
import AuthCallback from "./pages/AuthCallback";
import { AuthProvider } from "./contexts/AuthContext";
import PageLoadingAnimation from "./components/PageLoadingAnimation";
import ProtectedRoute from "./components/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <PageLoadingAnimation />
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/map" element={<MapPage />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route path="/feed" element={
              <ProtectedRoute featureName="User Feed">
                <FeedPage />
              </ProtectedRoute>
            } />
            <Route path="/add" element={
              <ProtectedRoute featureName="Add Place">
                <AddPlacePage />
              </ProtectedRoute>
            } />
            <Route path="/search" element={
              <ProtectedRoute featureName="Search Users">
                <SearchUsersPage />
              </ProtectedRoute>
            } />
            <Route path="/saved" element={
              <ProtectedRoute featureName="Saved Places">
                <SavedPlacesPage />
              </ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute featureName="User Profile">
                <ProfilePage />
              </ProtectedRoute>
            } />
            <Route path="/profile/:userId" element={
              <ProtectedRoute featureName="User Profile">
                <ProfilePage />
              </ProtectedRoute>
            } />
            <Route path="/terms" element={<TermsPage />} />
            <Route path="/privacy" element={<PrivacyPolicyPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
