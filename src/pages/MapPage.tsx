
import { useEffect } from 'react';
import Header from '@/components/Header';
import MapSection from '@/components/MapSection';
import Footer from '@/components/Footer';
import AuthModal from '@/components/AuthModal';
import { useAuth } from '@/contexts/AuthContext';
import { MapPin } from 'lucide-react';

const MapPage = () => {
  const { showAuthModal, setShowAuthModal } = useAuth();
  
  useEffect(() => {
    document.title = 'Saboris - Explore';
  }, []);

  return (
    <main className="min-h-screen flex flex-col">
      <Header />
      <div className="container mx-auto px-2 md:px-4 py-3 md:py-8">
        <h1 className="text-lg sm:text-xl md:text-3xl font-bold text-center mb-3 md:mb-6 text-saboris-primary flex items-center justify-center">
          <MapPin className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 mr-1 md:mr-2" />
          <span className="leading-tight">Explore restaurants near you</span>
        </h1>
        <div className="flex-grow w-full">
          <MapSection simplified={false} />
        </div>
      </div>
      <Footer />
      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
      />
    </main>
  );
};

export default MapPage;
