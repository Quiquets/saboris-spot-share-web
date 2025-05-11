
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useEffect } from 'react';

const PrivacyPolicyPage = () => {
  useEffect(() => {
    document.title = 'Privacy Policy - Saboris';
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 max-w-3xl mx-auto py-10 px-4 md:px-6">
        <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
        
        <p className="mb-6">
          At Saboris, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, 
          and safeguard your information when you use our website and services.
        </p>
        
        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Information We Collect</h2>
          <p>
            Name, email, login info, reviews you submit, usage data, etc.
          </p>
        </section>
        
        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-2">How We Use It</h2>
          <p>
            Provide services, respond to support, improve UX, send updates (optional)
          </p>
        </section>
        
        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Sharing</h2>
          <p>
            With service providers, legal parties (never with advertisers)
          </p>
        </section>
        
        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Security</h2>
          <p>
            We encrypt and protect your info, but no method is 100% secure
          </p>
        </section>
        
        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Your Rights</h2>
          <p>
            Request data, delete account, object to processing
          </p>
        </section>
        
        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Cookies</h2>
          <p>
            Basic cookies used for analytics and session management
          </p>
        </section>
        
        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Children</h2>
          <p>
            Not for users under 13; no data knowingly collected from minors
          </p>
        </section>
        
        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Changes</h2>
          <p>
            We'll notify you if this policy changes
          </p>
        </section>
        
        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Contact</h2>
          <p>
            <a href="mailto:saboris.app@gmail.com" className="text-saboris-primary hover:underline">
              saboris.app@gmail.com
            </a>
          </p>
        </section>
        
        <p className="text-sm text-gray-500 mt-10">
          Last updated: May 11, 2025
        </p>
      </main>
      <Footer />
    </div>
  );
};

export default PrivacyPolicyPage;
