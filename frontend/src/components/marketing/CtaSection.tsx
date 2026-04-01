'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default function CtaSection() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 to-violet-600 px-6 py-16 sm:px-12 sm:py-20 text-center shadow-2xl">
          {/* Background decoration */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-1/2 -left-1/4 w-full h-full bg-white/5 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-1/2 -right-1/4 w-full h-full bg-white/5 rounded-full blur-3xl"></div>
          </div>

          {/* Content */}
          <div className="relative z-10">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white mb-4">
              Gata să începi?
            </h2>
            <p className="text-lg sm:text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              14 zile trial gratuit. Nu necesită card de credit.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/register"
                className="inline-flex items-center justify-center px-8 py-4 rounded-xl bg-white text-blue-600 font-bold text-sm uppercase tracking-wider hover:bg-blue-50 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                Începe Acum
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center justify-center px-8 py-4 rounded-xl bg-blue-700/50 text-white font-bold text-sm uppercase tracking-wider hover:bg-blue-700 transition-all duration-200 border border-white/20"
              >
                Loghează-te
              </Link>
            </div>

            {/* Trust badges */}
            <div className="mt-8 flex flex-wrap justify-center gap-6 text-xs text-blue-200">
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Setup în 5 minute
              </span>
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Fără card necesar
              </span>
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Suport inclus
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
