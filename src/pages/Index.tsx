
import Header from '@/components/Header';
import HeroSection from '@/components/HeroSection';
import MapSection from '@/components/MapSection';
import NotionEmbed from '@/components/NotionEmbed';
import CallToAction from '@/components/CallToAction';
import Footer from '@/components/Footer';
import { useEffect } from 'react';

const Index = () => {
  useEffect(() => {
    document.title = 'Saboris - Real Food, Real Friends, Zero BS';
  }, []);

  return (
    <main className="min-h-screen flex flex-col">
      <Header />
      <HeroSection />
      <MapSection />
      <NotionEmbed />
      <CallToAction />
      <Footer />
    </main>
  );
};

export default Index;
