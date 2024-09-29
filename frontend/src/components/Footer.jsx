import React from "react";
import logo from "../assets/images/white.png";
import facebookIcon from "../assets/images/facebook.png";
import tiktokIcon from "../assets/images/tik-tok.png";
import instagramIcon from "../assets/images/instagram.png";

const Footer = () => {
  return (
    <footer className="bg-gradient-to-b from-blue-900 to-transparent text-white py-8">
      <div className="container mx-auto grid grid-cols-1 md:grid-cols-12 gap-10">
        {/* Logo Section */}
        <div className="col-span-12 md:col-span-3 flex-shrink-0">
          <img src={logo} alt="Logo" className="h-12" />
        </div>

        {/* Support Section */}
        <div className="col-span-12 md:col-span-3">
          <h3 className="font-bold text-lg mb-4">Support</h3>
          <ul className="space-y-2">
            <li>
              <a href="/privacy-policy" className="hover:underline text-md">
                Privacy Policy
              </a>
            </li>
            <li>
              <a href="/help-center" className="hover:underline text-md">
                Help Center
              </a>
            </li>
            <li>
              <a href="/user-guide" className="hover:underline text-md">
                User Guide
              </a>
            </li>
          </ul>
        </div>

        {/* Company Section */}
        <div className="col-span-12 md:col-span-3">
          <h3 className="font-bold text-lg mb-4">Company</h3>
          <ul className="space-y-2">
            <li className="text-md text-gray-300">romi@romi.com</li>
            <li className="text-md text-gray-300">044-000-000</li>
            <li className="text-md text-gray-300">Prishtine, Kosove</li>
          </ul>
        </div>

        {/* Social Media Section */}
        <div className="col-span-12 md:col-span-3">
          <h3 className="font-bold text-lg mb-4">Follow Us</h3>
          <div className="flex space-x-4">
            <a href="https://facebook.com" className="hover:opacity-75">
              <img src={facebookIcon} alt="Facebook" className="h-8" />
            </a>
            <a href="https://tiktok.com" className="hover:opacity-75">
              <img src={tiktokIcon} alt="TikTok" className="h-8" />
            </a>
            <a href="https://instagram.com" className="hover:opacity-75">
              <img src={instagramIcon} alt="Instagram" className="h-8" />
            </a>
          </div>
        </div>
      </div>

      <div className="text-center text-gray-300 border-t border-gray-700 mt-8 pt-4 text-lg">
        &copy; 2024 Romi. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
