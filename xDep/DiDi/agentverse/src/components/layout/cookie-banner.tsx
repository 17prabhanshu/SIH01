"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

export function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if user has already consented or declined
    const consent = localStorage.getItem("agentverse-cookie-consent");
    if (!consent) {
      // Small delay so it doesn't instantly jump scare the user on load
      const timer = setTimeout(() => setIsVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem("agentverse-cookie-consent", "accepted");
    setIsVisible(false);
  };

  const handleDecline = () => {
    localStorage.setItem("agentverse-cookie-consent", "declined");
    setIsVisible(false);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 150, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 150, opacity: 0 }}
          transition={{ type: "spring", bounce: 0.3, duration: 0.8 }}
          className="fixed bottom-0 inset-x-0 z-[100] p-4 sm:p-6 pointer-events-none"
        >
          <div className="container mx-auto max-w-5xl pointer-events-auto">
            <div className="bg-card/90 backdrop-blur-xl border border-border p-6 rounded-3xl shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
              {/* Decorative accent */}
              <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
              
              <div className="flex-1">
                <h3 className="font-heading font-bold text-lg mb-2">We value your privacy</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  We use cookies and similar technologies to help personalize content, tailor and measure ads, and provide a better experience. 
                  By clicking accept, you agree to this, as outlined in our <Link href="/cookies" className="text-primary hover:underline">Cookie Policy</Link>.
                </p>
              </div>

              <div className="flex items-center gap-3 shrink-0 w-full md:w-auto">
                <button
                  onClick={handleDecline}
                  className="flex-1 md:flex-none px-6 py-2.5 rounded-full border border-border text-sm font-bold hover:bg-muted transition-colors"
                >
                  Decline All
                </button>
                <button
                  onClick={handleAccept}
                  className="flex-1 md:flex-none px-6 py-2.5 rounded-full bg-primary text-primary-foreground text-sm font-bold hover:opacity-90 transition-opacity shadow-lg shadow-primary/20"
                >
                  Accept Cookies
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
