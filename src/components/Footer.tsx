
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Instagram, Mail } from 'lucide-react';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useForm } from "react-hook-form";

type ContactFormValues = {
  name: string;
  email: string;
  message: string;
};

const Footer = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<ContactFormValues>();
  
  const onSubmit = async (data: ContactFormValues) => {
    setIsSubmitting(true);
    
    try {
      // In a real app, you would send this data to your backend
      console.log("Contact form data:", data);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success("Thanks for reaching out! We'll get back to you soon.");
      reset();
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Contact form submission error:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <footer className="relative bg-white py-8 px-4 md:px-8 border-t w-full">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start">
          <div className="mb-6 md:mb-0">
            <div className="flex items-center">
              <img 
                src="/lovable-uploads/18c42043-5ae2-456f-9437-ccfbe067f1da.png" 
                alt="Saboris Logo" 
                className="h-12 w-auto"
              />
            </div>
            <p className="text-gray-600 mt-2 max-w-md">
              Connecting people through trusted food recommendations.
            </p>
          </div>
          
          <div className="flex flex-col space-y-0 md:flex-row md:space-y-0 md:space-x-8">
            <div className="flex flex-col space-y-2">
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button 
                    variant="ghost" 
                    className="justify-start p-0 text-gray-500 hover:text-saboris-primary transition-colors text-sm"
                  >
                    <Mail className="h-4 w-4 mr-2 text-saboris-primary" />
                    Contact Us
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Contact Us</DialogTitle>
                    <DialogDescription>
                      Send us a message and we'll get back to you as soon as possible.
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
                    <div className="space-y-1">
                      <label htmlFor="name" className="text-sm font-medium">
                        Name
                      </label>
                      <Input
                        id="name"
                        placeholder="Your name"
                        {...register("name", { required: "Name is required" })}
                        className={errors.name ? "border-red-500" : ""}
                      />
                      {errors.name && (
                        <p className="text-xs text-red-500">{errors.name.message}</p>
                      )}
                    </div>
                    
                    <div className="space-y-1">
                      <label htmlFor="email" className="text-sm font-medium">
                        Email
                      </label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="your.email@example.com"
                        {...register("email", { 
                          required: "Email is required",
                          pattern: {
                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                            message: "Invalid email address"
                          }
                        })}
                        className={errors.email ? "border-red-500" : ""}
                      />
                      {errors.email && (
                        <p className="text-xs text-red-500">{errors.email.message}</p>
                      )}
                    </div>
                    
                    <div className="space-y-1">
                      <label htmlFor="message" className="text-sm font-medium">
                        Message
                      </label>
                      <Textarea
                        id="message"
                        placeholder="How can we help you?"
                        rows={5}
                        {...register("message", { required: "Message is required" })}
                        className={errors.message ? "border-red-500" : ""}
                      />
                      {errors.message && (
                        <p className="text-xs text-red-500">{errors.message.message}</p>
                      )}
                    </div>
                    
                    <Button 
                      type="submit" 
                      className="w-full bg-saboris-primary hover:bg-saboris-primary/90"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Sending..." : "Send Message"}
                    </Button>
                    
                    <p className="text-xs text-gray-500 text-center">
                      Or email us directly at{" "}
                      <a 
                        href="mailto:saboris.app@gmail.com" 
                        className="text-saboris-primary hover:underline"
                      >
                        saboris.app@gmail.com
                      </a>
                    </p>
                  </form>
                </DialogContent>
              </Dialog>
              
              <a 
                href="https://www.instagram.com/saboris.places/" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="flex items-center text-gray-500 hover:text-saboris-primary transition-colors text-sm"
                aria-label="Instagram"
              >
                <Instagram size={16} className="mr-2 text-saboris-primary" />
                <span>Follow us</span>
              </a>
            </div>
            
            <div className="flex flex-col space-y-2">
              <Link 
                to="/terms" 
                className="text-gray-500 hover:text-saboris-primary transition-colors text-sm"
              >
                Terms & Conditions
              </Link>
              
              <Link 
                to="/privacy" 
                className="text-gray-500 hover:text-saboris-primary transition-colors text-sm"
              >
                Privacy Policy
              </Link>
            </div>
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
