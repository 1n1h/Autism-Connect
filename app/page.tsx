import { Nav } from "@/components/landing/Nav";
import { Hero } from "@/components/landing/Hero";
import { Features } from "@/components/landing/Features";
import { GeographicMessaging } from "@/components/landing/GeographicMessaging";
import { WaitlistForm } from "@/components/landing/WaitlistForm";
import { Footer } from "@/components/landing/Footer";

export default function HomePage() {
  return (
    <main className="relative">
      <Nav />
      <Hero />
      <Features />
      <GeographicMessaging />
      <WaitlistForm />
      <Footer />
    </main>
  );
}
