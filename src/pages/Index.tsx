
import Header from '@/components/Header';
import HeroSection from '@/components/HeroSection';
import MapSection from '@/components/MapSection';
import NotionEmbed from '@/components/NotionEmbed';
import CallToAction from '@/components/CallToAction';
import Footer from '@/components/Footer';
import { useEffect } from 'react';

const Index = () => {
  useEffect(() => {
    document.title = 'Saboris - Taste, Share, Explore';
  }, []);

  return (
    <main className="min-h-screen flex flex-col">
      <Header />
      <HeroSection />
      <div className="container mx-auto px-4">
        <h2 className="text-2xl md:text-3xl font-bold text-left mb-6 text-saboris-primary">
          Explore restaurants, cafes and bars near you
        </h2>
        <MapSection simplified={true} />
      </div>
      <NotionEmbed />
      <CallToAction />
      <Footer />
    </main>
  );
};

export default Index;
