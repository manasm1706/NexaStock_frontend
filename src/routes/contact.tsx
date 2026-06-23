import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { motion } from "motion/react";
import { Mail, MessageSquare, Phone, Globe } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact Us & Support · NexaStock" },
      { name: "description", content: "Get in touch with the NexaStock support team or request a customized product demo." },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) {
      toast.error("Please fill in all fields.");
      return;
    }
    setIsSubmitting(true);
    setTimeout(() => {
      toast.success("Message sent successfully! Our team will reach out within 24 hours.");
      setName("");
      setEmail("");
      setMessage("");
      setIsSubmitting(false);
    }, 1000);
  };

  return (
    <main className="min-h-screen text-foreground relative overflow-hidden bg-zinc-950">
      <div className="absolute inset-0 grid-bg pointer-events-none -z-10" />
      <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[900px] h-[900px] rounded-full pointer-events-none -z-10"
        style={{ background: "radial-gradient(closest-side, color-mix(in oklab, var(--electric) 20%, transparent), transparent 70%)" }} />
      
      <Navbar />

      <div className="max-w-6xl mx-auto px-6 pt-36 pb-20 relative z-10 grid md:grid-cols-2 gap-12 items-center">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-6"
        >
          <div className="text-xs text-primary uppercase tracking-widest font-semibold">Contact Sales & Support</div>
          <h1 className="font-display text-4xl sm:text-5xl font-semibold tracking-tight leading-tight">
            We're here to help<br/>your business scale.
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base font-sans leading-relaxed">
            Have questions about warehouse sync, custom API connections, or pricing models? 
            Fill out the form, or reach out directly via one of our corporate channels.
          </p>

          <div className="space-y-4 pt-4 text-sm font-sans">
            <div className="flex items-center gap-3 text-zinc-300">
              <Mail className="w-5 h-5 text-primary" />
              <span>support@nexastock.com</span>
            </div>
            <div className="flex items-center gap-3 text-zinc-300">
              <Phone className="w-5 h-5 text-primary" />
              <span>+1 (800) 555-0199</span>
            </div>
            <div className="flex items-center gap-3 text-zinc-300">
              <Globe className="w-5 h-5 text-primary" />
              <span>HQ: Mumbai, India</span>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="glass rounded-3xl p-8 border border-white/5 bg-zinc-900/40 backdrop-blur-md"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs text-muted-foreground font-semibold">Your Name</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Jane Doe"
                className="mt-1.5 h-10 w-full rounded-xl border border-white/10 bg-white/3 px-3 text-xs text-foreground placeholder:text-muted-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                required
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground font-semibold">Email Address</label>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                placeholder="jane@company.com"
                className="mt-1.5 h-10 w-full rounded-xl border border-white/10 bg-white/3 px-3 text-xs text-foreground placeholder:text-muted-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                required
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground font-semibold">Message</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Tell us about your multi-store network..."
                rows={4}
                className="mt-1.5 w-full rounded-xl border border-white/10 bg-white/3 p-3 text-xs text-foreground placeholder:text-muted-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all font-sans resize-none"
                required
              />
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-11 bg-primary hover:bg-primary/95 text-primary-foreground font-semibold text-xs rounded-xl shadow-glow-sm cursor-pointer transition-all active:scale-[0.98] flex items-center justify-center gap-1.5"
            >
              <MessageSquare className="w-4 h-4" />
              {isSubmitting ? "Sending..." : "Submit Inquiry"}
            </button>
          </form>
        </motion.div>
      </div>

      <Footer />
    </main>
  );
}
