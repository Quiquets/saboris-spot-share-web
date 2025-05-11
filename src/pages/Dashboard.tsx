
import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const Dashboard = () => {
  useEffect(() => {
    document.title = 'Saboris - Dashboard';
  }, []);

  return (
    <main className="min-h-screen flex flex-col">
      <Header />
      
      <div className="flex-grow container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Welcome to Saboris</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link 
            to="/map" 
            className="flex flex-col items-center p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
          >
            <div className="rounded-full bg-saboris-light p-4 mb-4">
              <div className="text-3xl">🗺️</div>
            </div>
            <h2 className="text-xl font-semibold mb-2">Explore Map</h2>
            <p className="text-center text-gray-600">Discover great places around you</p>
          </Link>
          
          <Link 
            to="/add" 
            className="flex flex-col items-center p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
          >
            <div className="rounded-full bg-saboris-peach p-4 mb-4">
              <div className="text-3xl">➕</div>
            </div>
            <h2 className="text-xl font-semibold mb-2">Add Place</h2>
            <p className="text-center text-gray-600">Share your favorite spots</p>
          </Link>
          
          <Link 
            to="/saved" 
            className="flex flex-col items-center p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
          >
            <div className="rounded-full bg-saboris-orange p-4 mb-4">
              <div className="text-3xl">❤️</div>
            </div>
            <h2 className="text-xl font-semibold mb-2">Saved Places</h2>
            <p className="text-center text-gray-600">Review your favorite locations</p>
          </Link>
        </div>
      </div>
      
      <Footer />
    </main>
  );
};

export default Dashboard;
