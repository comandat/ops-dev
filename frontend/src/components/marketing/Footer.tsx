'use client';

import Link from 'next/link';
import { Mail, Github, Linkedin, Twitter } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-slate-800 bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand Column */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="inline-block mb-4">
              <span className="text-xl font-black text-white tracking-tight">
                Open<span className="text-blue-500">Sales</span>
              </span>
            </Link>
            <p className="text-sm text-slate-400 mb-4">
              Automatizează vânzările pe marketplace-uri. Simplu, rapid, eficient.
            </p>
            <div className="flex gap-3">
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="w-4 h-4" />
              </a>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
                aria-label="GitHub"
              >
                <Github className="w-4 h-4" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin className="w-4 h-4" />
              </a>
              <a
                href="mailto:contact@opensales.ro"
                className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
                aria-label="Email"
              >
                <Mail className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Links Column */}
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
              Produs
            </h3>
            <ul className="space-y-3">
              <li>
                <Link href="/#features" className="text-sm text-slate-400 hover:text-white transition-colors">
                  Features
                </Link>
              </li>
              <li>
                <Link href="/#pricing" className="text-sm text-slate-400 hover:text-white transition-colors">
                  Pricing
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-sm text-slate-400 hover:text-white transition-colors">
                  Despre Noi
                </Link>
              </li>
              <li>
                <Link href="/changelog" className="text-sm text-slate-400 hover:text-white transition-colors">
                  Changelog
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal Column */}
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
              Legal
            </h3>
            <ul className="space-y-3">
              <li>
                <Link href="/terms" className="text-sm text-slate-400 hover:text-white transition-colors">
                  Termeni și Condiții
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-sm text-slate-400 hover:text-white transition-colors">
                  Politica de Confidențialitate
                </Link>
              </li>
              <li>
                <Link href="/cookies" className="text-sm text-slate-400 hover:text-white transition-colors">
                  Politica Cookies
                </Link>
              </li>
              <li>
                <Link href="/gdpr" className="text-sm text-slate-400 hover:text-white transition-colors">
                  GDPR
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Column */}
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
              Contact
            </h3>
            <ul className="space-y-3">
              <li>
                <a
                  href="mailto:contact@opensales.ro"
                  className="text-sm text-slate-400 hover:text-white transition-colors"
                >
                  contact@opensales.ro
                </a>
              </li>
              <li>
                <a
                  href="mailto:support@opensales.ro"
                  className="text-sm text-slate-400 hover:text-white transition-colors"
                >
                  support@opensales.ro
                </a>
              </li>
              <li className="pt-2">
                <Link
                  href="/contact"
                  className="inline-flex items-center text-sm font-bold text-blue-400 hover:text-blue-300 transition-colors"
                >
                  Trimite un mesaj →
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-slate-800">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-slate-500">
              © {currentYear} OpenSales. Toate drepturile rezervate.
            </p>
            <div className="flex items-center gap-4 text-xs text-slate-500">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                Toate sistemele operaționale
              </span>
              <span>•</span>
              <span>RO</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
