import React from "react";
import { Link } from "react-router-dom";
import { Heart, PawPrint, Mail, MapPin, Phone } from "lucide-react";

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-warm-gray-900 text-warm-gray-100">
      {/* Main Footer Content */}
      <div className="container-wide py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand Column */}
          <div className="lg:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <PawPrint className="h-8 w-8 text-sky-blue-400" />
              <span className="font-capriola text-2xl text-white">Save Your Stray</span>
            </Link>
            <p className="text-warm-gray-400 mb-6 leading-relaxed">
              Connecting loving homes with animals in need. Every pet deserves a chance at happiness.
            </p>
            <div className="flex items-center gap-2 text-salmon-300">
              <Heart className="h-4 w-4 fill-current" />
              <span className="text-sm">Made with love for animals</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-capriola text-lg text-white mb-4">Quick Links</h4>
            <ul className="space-y-3">
              <li>
                <Link to="/register" className="text-warm-gray-400 hover:text-sky-blue-400 transition-colors">
                  Browse Animals
                </Link>
              </li>
              <li>
                <Link to="/success-stories" className="text-warm-gray-400 hover:text-sky-blue-400 transition-colors">
                  Success Stories
                </Link>
              </li>
              <li>
                <Link to="/quiz" className="text-warm-gray-400 hover:text-sky-blue-400 transition-colors">
                  Find Your Match Quiz
                </Link>
              </li>
              <li>
                <Link to="/newShelter" className="text-warm-gray-400 hover:text-sky-blue-400 transition-colors">
                  Register Your Shelter
                </Link>
              </li>
            </ul>
          </div>

          {/* For Shelters */}
          <div>
            <h4 className="font-capriola text-lg text-white mb-4">For Shelters</h4>
            <ul className="space-y-3">
              <li>
                <Link to="/newShelter" className="text-warm-gray-400 hover:text-sky-blue-400 transition-colors">
                  Partner With Us
                </Link>
              </li>
              <li>
                <Link to="/login" className="text-warm-gray-400 hover:text-sky-blue-400 transition-colors">
                  Shelter Dashboard
                </Link>
              </li>
              <li>
                <span className="text-warm-gray-400">
                  Manage Listings
                </span>
              </li>
              <li>
                <span className="text-warm-gray-400">
                  Track Applications
                </span>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-capriola text-lg text-white mb-4">Contact</h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-3 text-warm-gray-400">
                <Mail className="h-4 w-4 text-sky-blue-400" />
                <span>hello@saveyourstray.com</span>
              </li>
              <li className="flex items-center gap-3 text-warm-gray-400">
                <Phone className="h-4 w-4 text-sky-blue-400" />
                <span>(555) 123-4567</span>
              </li>
              <li className="flex items-start gap-3 text-warm-gray-400">
                <MapPin className="h-4 w-4 text-sky-blue-400 mt-1" />
                <span>Helping animals everywhere find loving homes</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-warm-gray-800">
        <div className="container-wide py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-warm-gray-500 text-sm">
              &copy; {currentYear} Save Your Stray. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <Link to="/privacy" className="text-warm-gray-500 hover:text-warm-gray-300 text-sm transition-colors">
                Privacy Policy
              </Link>
              <Link to="/tos" className="text-warm-gray-500 hover:text-warm-gray-300 text-sm transition-colors">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
