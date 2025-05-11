
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useEffect } from 'react';

const TermsPage = () => {
  useEffect(() => {
    document.title = 'Terms & Conditions - Saboris';
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 max-w-3xl mx-auto py-10 px-4 md:px-6">
        <h1 className="text-3xl font-bold mb-6">Terms & Conditions</h1>
        
        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-3">1. Acceptance of Terms</h2>
          <p className="mb-4">
            Welcome to Saboris. By accessing or using our website, mobile application, or any Saboris services, 
            you agree to be bound by these Terms & Conditions. If you do not agree to these terms, please do not 
            use our services.
          </p>
        </section>
        
        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-3">2. User Accounts</h2>
          <p className="mb-4">
            When you create an account with us, you must provide accurate and complete information. You are 
            responsible for safeguarding your account and for all activities that occur under your account.
          </p>
        </section>
        
        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-3">3. User Content</h2>
          <p className="mb-4">
            You retain ownership of any content you submit, post, or display on or through our services. 
            By posting content, you grant us a worldwide, non-exclusive, royalty-free license to use, reproduce, 
            modify, and display such content within our services.
          </p>
        </section>
        
        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-3">4. Prohibited Activities</h2>
          <p className="mb-4">
            You agree not to engage in any of the following prohibited activities:
          </p>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li>Violating any applicable laws or regulations</li>
            <li>Posting false or misleading content</li>
            <li>Using the service for any illegal purpose</li>
            <li>Attempting to interfere with or compromise the system integrity or security</li>
          </ul>
        </section>
        
        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-3">5. Termination</h2>
          <p className="mb-4">
            We reserve the right to terminate or suspend your access to our services immediately, without prior 
            notice or liability, for any reason, including breach of these Terms.
          </p>
        </section>
        
        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-3">6. Disclaimer of Warranties</h2>
          <p className="mb-4">
            Our services are provided on an "as is" and "as available" basis. We make no warranties, express or 
            implied, regarding the operation or availability of our services.
          </p>
        </section>
        
        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-3">7. Contact</h2>
          <p className="mb-4">
            For questions about these Terms, please contact us at:
            <br />
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

export default TermsPage;
