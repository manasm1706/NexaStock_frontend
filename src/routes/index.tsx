import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/landing/Navbar";
import { Hero } from "@/components/landing/Hero";
import { Marquee } from "@/components/landing/Marquee";
import { Industries } from "@/components/landing/Industries";
import { Features } from "@/components/landing/Features";
import { AISection } from "@/components/landing/AISection";
import { Pricing } from "@/components/landing/Pricing";
import { Footer } from "@/components/landing/Footer";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "NexaStock — AI-powered multi-store inventory & retail intelligence" },
      { name: "description", content: "Warehouse-first, AI-driven inventory and retail intelligence platform for modern multi-store businesses." },
      { property: "og:title", content: "NexaStock — AI-powered retail intelligence" },
      { property: "og:description", content: "The operations brain for modern multi-store retail." },
      { property: "og:type", content: "website" },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <main className="min-h-screen text-foreground">
      <Navbar />
      <Hero />
      <Marquee />
      <Features />
      <Industries />
      <AISection />
      <Pricing />
      <Footer />
    </main>
  );
}
