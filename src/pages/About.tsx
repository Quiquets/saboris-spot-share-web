
import { useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Coffee, Pizza, Sandwich, Instagram } from 'lucide-react';

const About = () => {
  useEffect(() => {
    document.title = 'Who We Are - Saboris';
  }, []);

  return (
    <main className="min-h-screen flex flex-col">
      <Header />
      
      <section className="pt-32 pb-16 px-4 md:px-8 bg-white">
        <div className="max-w-3xl mx-auto relative">
          {/* Decorative food icons */}
          <Coffee className="absolute -left-16 top-12 text-saboris-peach w-12 h-12 hidden lg:block" />
          <Pizza className="absolute -right-16 top-40 text-saboris-orange w-12 h-12 hidden lg:block" />
          <Sandwich className="absolute -left-16 bottom-12 text-saboris-light w-12 h-12 hidden lg:block" />
          
          <h1 className="text-4xl md:text-5xl font-bold text-saboris-primary mb-8 text-center">
            Who We Are
          </h1>
          
          <div className="bg-white rounded-xl shadow-md p-6 md:p-8">
            <p className="text-lg leading-relaxed">
              Saboris started from a simple need: we wanted food tips we could actually trust. 
              We were tired of fake reviews, ads disguised as recommendations, and star ratings that meant nothing.
            </p>
            
            <p className="text-lg leading-relaxed mt-6">
              So we built a space where people share <strong>real places with real friends</strong> — no fluff, no ads, just good food and honest vibes.  
              Whether it's a street taco in Mexico City or coffee in Lisbon, Saboris helps you explore the world through personal food tips.
            </p>
            
            <div className="mt-8 flex justify-center">
              <a 
                href="https://www.instagram.com/saboris.places/" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="inline-flex items-center gap-2 px-5 py-2 bg-saboris-primary text-white rounded-full hover:bg-saboris-primary/90 transition-all duration-300"
              >
                <Instagram size={18} />
                <span>Follow our journey</span>
              </a>
            </div>
          </div>
        </div>
      </section>
      
      <Footer />
    </main>
  );
};

export default About;
