'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-[rgba(255,255,255,0.08)] bg-[#0A0A0F]/80 backdrop-blur-md">
      <div className="container mx-auto px-6 md:px-12 max-w-7xl">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-500"></div>
            <span className="text-xl font-bold text-white">OpenSales</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <Link href="#features" className="text-sm font-medium text-[#A1A1AA] hover:text-white transition-colors">
              Features
            </Link>
            <Link href="#pricing" className="text-sm font-medium text-[#A1A1AA] hover:text-white transition-colors">
              Pricing
            </Link>
            <Link href="/login" className="text-sm font-medium text-white hover:text-white transition-colors">
              Login
            </Link>
            <Link
              href="/register"
              className="inline-flex items-center px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-indigo-500 to-violet-500 rounded-lg hover:from-indigo-600 hover:to-violet-600 transition-all"
            >
              Începe Gratuit
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-[#A1A1AA] hover:text-white"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[rgba(255,255,255,0.08)] bg-[#0A0A0F]">
          <div className="px-6 py-4 space-y-4">
            <Link
              href="#features"
              className="block text-sm font-medium text-[#A1A1AA] hover:text-white"
              onClick={() => setMobileMenuOpen(false)}
            >
              Features
            </Link>
            <Link
              href="#pricing"
              className="block text-sm font-medium text-[#A1A1AA] hover:text-white"
              onClick={() => setMobileMenuOpen(false)}
            >
              Pricing
            </Link>
            <Link
              href="/login"
              className="block text-sm font-medium text-white"
              onClick={() => setMobileMenuOpen(false)}
            >
              Login
            </Link>
            <Link
              href="/register"
              className="block text-center px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-indigo-500 to-violet-500 rounded-lg"
              onClick={() => setMobileMenuOpen(false)}
            >
              Începe Gratuit
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
