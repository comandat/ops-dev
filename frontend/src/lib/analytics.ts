/**
 * Analytics Helper - Plausible Event Tracking
 * 
 * Usage:
 * - trackEvent('cta_click', { cta: 'primary', location: 'hero' })
 * - trackEvent('register_started')
 * - trackEvent('register_completed')
 * - trackEvent('email_verified')
 * - trackEvent('first_login')
 */

declare global {
  interface Window {
    plausible?: (eventName: string, options?: { props?: Record<string, any> }) => void;
  }
}

export function trackEvent(eventName: string, props?: Record<string, any>) {
  if (typeof window !== 'undefined' && window.plausible) {
    window.plausible(eventName, { props });
  }
}

// CTA Click Types
export type CtaType = 'primary' | 'secondary';
export type CtaLocation = 'hero' | 'pricing' | 'footer';

export function trackCtaClick(cta: CtaType, location: CtaLocation) {
  trackEvent('cta_click', { cta, location });
}

// Conversion Funnel Events
export function trackRegisterStarted() {
  trackEvent('register_started');
}

export function trackRegisterCompleted() {
  trackEvent('register_completed');
}

export function trackEmailVerified() {
  trackEvent('email_verified');
}

export function trackFirstLogin() {
  trackEvent('first_login');
}
