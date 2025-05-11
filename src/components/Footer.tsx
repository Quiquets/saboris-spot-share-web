
import { Instagram } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-white py-8 px-4 md:px-8 border-t">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <img 
              src="/lovable-uploads/b7b8b076-5e15-4c2b-92c0-ada36bc99a6f.png" 
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
    </footer>
  );
};

export default Footer;
