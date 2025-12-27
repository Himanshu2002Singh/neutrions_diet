import { Facebook, Twitter, Instagram, Youtube, Mail, Phone, MapPin } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-[#F8D94E] rounded-2xl px-4 lg:px-8 py-8 lg:py-12 mt-12">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
        {/* Company Info */}
        <div className="space-y-4">
          <img
  src="/images/logo.png"
  alt="NUTREAZY Logo"
  className="h-8 lg:h-10 w-auto"
/>
          <p className="text-sm lg:text-base text-gray-700 leading-relaxed">
            Your personal AI-powered nutrition partner. Get personalized diet plans, track progress, and chat with AI coach Ria for better health.
          </p>
          <div className="flex gap-4">
            <a href="#" className="p-2 bg-white rounded-full hover:opacity-70 transition-opacity">
              <Facebook className="w-5 h-5" />
            </a>
            <a href="#" className="p-2 bg-white rounded-full hover:opacity-70 transition-opacity">
              <Twitter className="w-5 h-5" />
            </a>
            <a href="#" className="p-2 bg-white rounded-full hover:opacity-70 transition-opacity">
              <Instagram className="w-5 h-5" />
            </a>
            <a href="#" className="p-2 bg-white rounded-full hover:opacity-70 transition-opacity">
              <Youtube className="w-5 h-5" />
            </a>
          </div>
        </div>

        {/* Quick Links */}
        <div className="space-y-4">
          <h4 className="text-lg font-semibold">Quick Links</h4>
          <nav className="flex flex-col space-y-2">
            <a href="#ingredients" className="text-sm lg:text-base hover:opacity-70 transition-opacity">
              Ingredients
            </a>
            <a href="#nutritions" className="text-sm lg:text-base hover:opacity-70 transition-opacity">
              Nutritions
            </a>
            <a href="#dishes" className="text-sm lg:text-base hover:opacity-70 transition-opacity">
              Our Dishes
            </a>
            <a href="#recipes" className="text-sm lg:text-base hover:opacity-70 transition-opacity">
              Recipes
            </a>
            <a href="#meal-plans" className="text-sm lg:text-base hover:opacity-70 transition-opacity">
              Meal Plans
            </a>
          </nav>
        </div>

        {/* Support */}
        <div className="space-y-4">
          <h4 className="text-lg font-semibold">Support</h4>
          <nav className="flex flex-col space-y-2">
            <a href="#help" className="text-sm lg:text-base hover:opacity-70 transition-opacity">
              Help Center
            </a>
            <a href="#contact" className="text-sm lg:text-base hover:opacity-70 transition-opacity">
              Contact Us
            </a>
            <a href="#faq" className="text-sm lg:text-base hover:opacity-70 transition-opacity">
              FAQ
            </a>
            <a href="#privacy" className="text-sm lg:text-base hover:opacity-70 transition-opacity">
              Privacy Policy
            </a>
            <a href="#terms" className="text-sm lg:text-base hover:opacity-70 transition-opacity">
              Terms of Service
            </a>
          </nav>
        </div>

        {/* Contact Info */}
        <div className="space-y-4">
          <h4 className="text-lg font-semibold">Contact Info</h4>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 flex-shrink-0" />
              <a href="mailto:support@neutrion.com" className="text-sm lg:text-base hover:opacity-70 transition-opacity">
                support@neutrion.com
              </a>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="w-5 h-5 flex-shrink-0" />
              <a href="tel:+1234567890" className="text-sm lg:text-base hover:opacity-70 transition-opacity">
                +1 (234) 567-890
              </a>
            </div>
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 flex-shrink-0 mt-1" />
              <address className="text-sm lg:text-base not-italic">
                123 Health Street,<br />
                Wellness City, WC 12345<br />
                United States
              </address>
            </div>
          </div>
        </div>
      </div>

      {/* Newsletter Subscription */}
      <div className="mt-8 lg:mt-12 pt-8 border-t border-yellow-300">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
          <div className="text-center lg:text-left">
            <h4 className="text-lg font-semibold mb-2">Stay Updated</h4>
            <p className="text-sm lg:text-base text-gray-700">
              Get the latest nutrition tips and personalized meal plans delivered to your inbox.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#FF6B4A] flex-1 lg:w-64"
            />
            <button className="bg-[#FF6B4A] text-white px-6 py-2 rounded-lg hover:opacity-90 transition-opacity whitespace-nowrap">
              Subscribe
            </button>
          </div>
        </div>
      </div>


      {/* Copyright */}
      <div className="mt-8 pt-6 border-t border-yellow-300 text-center">
        <p className="text-sm text-gray-600 mb-2">
          © 2024 Neutrion Diet. All rights reserved. | Design & Development by <span className="font-bold">TrustingBrains</span>
        </p>
        
      </div>
    </footer>
  );
}
