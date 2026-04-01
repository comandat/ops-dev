import Navbar from '@/components/marketing/Navbar';
import Hero from '@/components/marketing/Hero';
import StatsBar from '@/components/marketing/StatsBar';
import FeaturesGrid from '@/components/marketing/FeaturesGrid';
import PricingSection from '@/components/marketing/PricingSection';
import CtaSection from '@/components/marketing/CtaSection';
import Footer from '@/components/marketing/Footer';

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <StatsBar />
        <FeaturesGrid />
        <PricingSection />
        <CtaSection />
      </main>
      <Footer />
    </>
  );
}
