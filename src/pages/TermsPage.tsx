
import { useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const TermsPage = () => {
  useEffect(() => {
    document.title = 'Saboris - Terms & Conditions';
  }, []);

  return (
    <main className="min-h-screen flex flex-col">
      <Header />
      
      <div className="flex-grow container mx-auto px-4 py-12 max-w-3xl">
        <h1 className="text-3xl font-bold mb-6">Terms and Conditions – Saboris</h1>
        
        <div className="space-y-6">
          <section>
            <h2 className="text-xl font-semibold mb-2">1. Introduction</h2>
            <p>Welcome to Saboris ("we", "our", "us"). By using our website and services, you agree to be bound by these Terms.</p>
          </section>
          
          <section>
            <h2 className="text-xl font-semibold mb-2">2. Definitions</h2>
            <p>"Platform" refers to our site and related services.</p>
            <p>"You" refers to our users.</p>
            <p>"Content" means all materials shared on the platform.</p>
          </section>
          
          <section>
            <h2 className="text-xl font-semibold mb-2">3. Account Registration</h2>
            <p>You agree to provide accurate data and keep your credentials safe.</p>
          </section>
          
          <section>
            <h2 className="text-xl font-semibold mb-2">4. Usage</h2>
            <p>You may not use the platform unlawfully, impersonate anyone, or restrict others' use.</p>
          </section>
          
          <section>
            <h2 className="text-xl font-semibold mb-2">5. IP Rights</h2>
            <p>All platform content is property of Saboris or its licensors.</p>
          </section>
          
          <section>
            <h2 className="text-xl font-semibold mb-2">6. User Content</h2>
            <p>You retain rights to your submissions but allow us to display them.</p>
          </section>
          
          <section>
            <h2 className="text-xl font-semibold mb-2">7. Privacy</h2>
            <p>See our Privacy Policy (link it once ready).</p>
          </section>
          
          <section>
            <h2 className="text-xl font-semibold mb-2">8. Limitation of Liability</h2>
            <p>Saboris is not liable for indirect or consequential damages.</p>
          </section>
          
          <section>
            <h2 className="text-xl font-semibold mb-2">9. Termination</h2>
            <p>We may suspend access for violations at our discretion.</p>
          </section>
          
          <section>
            <h2 className="text-xl font-semibold mb-2">10. Changes to Terms</h2>
            <p>We may revise these at any time.</p>
          </section>
          
          <section>
            <h2 className="text-xl font-semibold mb-2">11. Law</h2>
            <p>These terms follow the laws of our operating country.</p>
          </section>
          
          <section>
            <h2 className="text-xl font-semibold mb-2">12. Contact</h2>
            <p>Email us at <a href="mailto:hello@saboris.app" className="text-saboris-primary hover:underline">hello@saboris.app</a>.</p>
          </section>
          
          <p className="text-sm text-gray-500">Last updated: May 11, 2025</p>
        </div>
      </div>
      
      <Footer />
    </main>
  );
};

export default TermsPage;
