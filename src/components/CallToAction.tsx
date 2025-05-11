
import { Button } from '@/components/ui/button';
import { Utensils } from 'lucide-react';

const CallToAction = () => {
  return (
    <section className="py-16 px-4 md:px-8 bg-saboris-primary">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-3xl font-bold text-white mb-6">
          Want to recommend your favorite spot?
        </h2>
        
        <div className="mt-8">
          <a 
            href="https://tally.so/r/3lgzDp" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 bg-white text-saboris-primary font-bold rounded-lg hover:bg-gray-100 transition-all duration-300 shadow-lg"
          >
            <Utensils size={20} />
            Add your recommendation 🍜
          </a>
        </div>
        
        <p className="mt-6 text-white/80 max-w-lg mx-auto">
          Join our community of food lovers who share their honest opinions about the best places to eat.
        </p>
      </div>
    </section>
  );
};

export default CallToAction;
