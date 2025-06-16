
import React from 'react';
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const ProfileNotFound = () => {
  return (
    <main className="min-h-screen flex flex-col">
      <Header />
      <div className="flex-grow container mx-auto px-4 py-8 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Profile Not Found</h1>
          <p className="text-gray-600">The requested profile could not be loaded.</p>
        </div>
      </div>
      <Footer />
    </main>
  );
};

export default ProfileNotFound;
