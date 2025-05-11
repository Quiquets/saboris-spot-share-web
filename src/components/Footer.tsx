
import { Instagram } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="relative bg-white py-8 px-4 md:px-8 border-t">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <img 
              src="/lovable-uploads/8fa264ad-59c9-42a1-89b0-eefa3d3d2bbf.png" 
              alt="Saboris Logo" 
              className="h-8 w-auto"
            />
          </div>
          
          <div className="flex items-center gap-4">
            <Link to="/terms" className="text-gray-500 hover:text-saboris-primary transition-colors">
              Terms & Conditions
            </Link>
            <a 
              href="https://www.instagram.com/saboris.places/" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-gray-500 hover:text-saboris-primary transition-colors"
              aria-label="Instagram"
            >
              <Instagram size={20} />
            </a>
          </div>
        </div>
        
        <div className="mt-6 text-center text-sm text-gray-500">
          <p>&copy; {new Date().getFullYear()} Saboris. All rights reserved.</p>
        </div>
      </div>
      
      {/* Tongue element (shaped like a speech bubble tail) */}
      <div className="absolute -top-5 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-[20px] border-l-transparent border-b-[20px] border-b-saboris-primary border-r-[20px] border-r-transparent"></div>
    </footer>
  );
};

export default Footer;
