
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
      <div className="container mx-auto px-2 md:px-4 py-4 md:py-8">
        <h1 className="text-xl md:text-3xl font-bold text-center mb-4 md:mb-6 text-saboris-primary flex items-center justify-center">
          <MapPin className="h-5 w-5 md:h-6 md:w-6 mr-2" />
          Explore restaurants, cafes and bars near you
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
