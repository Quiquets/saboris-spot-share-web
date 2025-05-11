
import { useEffect } from 'react';
import Header from '@/components/Header';
import MapSection from '@/components/MapSection';
import Footer from '@/components/Footer';

const MapPage = () => {
  useEffect(() => {
    document.title = 'Saboris - Explore Map';
  }, []);

  return (
    <main className="min-h-screen flex flex-col">
      <Header />
      <div className="flex-grow">
        <MapSection />
      </div>
      <Footer />
    </main>
  );
};

export default MapPage;
