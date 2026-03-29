import React from "react";

const Header = () => {
  return (
    <header className="fixed w-full z-50 top-0 start-0 border-b border-white/20 bg-black/90 backdrop-blur-sm">
      <div className="flex flex-wrap items-center justify-between mx-auto lg:ml-64 px-4 h-16">
        {/* Logo Section */}
        <a href="#" className="flex items-start rtl:space-x-reverse flex-col">
          <span className="text-xl font-semibold uppercase text-white">
            <span className="text-[#CDFF00]">Shalmali</span> Patil
          </span>
          <span className="text-xs tracking-[4px] uppercase text-gray-400">
            Innovator
          </span>
        </a>

        {/* Contact Info and Button - Only show on larger screens */}
        <div className="hidden lg:flex items-center space-x-8">
          <span className="text-gray-400 text-sm">
            <a href="tel:+1234567890" className="hover:text-[#CDFF00] transition-colors">
              +1 (469) 614-9980
            </a>
            <span className="mx-2">/</span>
            <a href="mailto:shalupatil15@gmail.com" className="hover:text-[#CDFF00] transition-colors">
              shalupatil15@gmail.com
            </a>
          </span>
          <button
            type="button"
            onClick={() => document.getElementById('consultation')?.scrollIntoView({ behavior: 'smooth' })}
            className="border border-[#CDFF00] text-[#CDFF00] py-2 px-6 hover:bg-[#CDFF00] hover:text-black text-sm font-semibold rounded-lg transition-all duration-300"
          >
            Book Consultation
          </button>
        </div>

        {/* Mobile Menu Button - Only show on smaller screens */}
        <button
          type="button"
          className="lg:hidden p-2 text-gray-400 hover:text-[#CDFF00] transition-colors"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path d="M4 6h16M4 12h16M4 18h16"></path>
          </svg>
        </button>
      </div>
    </header>
  );
};

export default Header;
