import { ScrollReveal } from "@/components/animations/scroll-reveal";
import { Mail, MapPin, Phone, MessageSquare } from "lucide-react";

export const metadata = { title: 'Get in Touch | Agentverse' };

export default function ContactPage() {
  return (
    <div className="relative min-h-screen pb-24 overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-0 right-1/4 w-[50vw] h-[50vw] bg-[radial-gradient(circle,var(--tw-gradient-stops))] from-primary/20 via-primary/5 to-transparent mix-blend-multiply pointer-events-none -z-10" />
      <div className="absolute bottom-1/4 left-0 w-[40vw] h-[40vw] bg-[radial-gradient(circle,var(--tw-gradient-stops))] from-accent/20 via-accent/5 to-transparent mix-blend-multiply pointer-events-none -z-10" />

      <div className="container mx-auto py-24 px-4 sm:px-6 lg:px-8 max-w-6xl">
        <ScrollReveal>
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h1 className="font-heading text-5xl md:text-7xl font-extrabold tracking-tight mb-6">
              Get in <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">Touch</span>
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed">
              Whether you are looking to partner, inquire about editorial content, or report an issue with the platform, our team is here to help.
            </p>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Contact Methods */}
          <div className="lg:col-span-1 space-y-6">
            <ScrollReveal delay={0.1}>
              <div className="bg-card/50 backdrop-blur-sm border border-border p-8 rounded-[2.5rem] flex flex-col items-start hover:border-primary/50 transition-colors">
                <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center mb-6">
                  <Mail className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-bold text-xl mb-2">Email Us</h3>
                <p className="text-muted-foreground mb-4">For general inquiries and editorial pitches.</p>
                <a href="mailto:hello@tecrese.com" className="font-bold text-primary hover:underline mt-auto">hello@tecrese.com</a>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={0.2}>
              <div className="bg-card/50 backdrop-blur-sm border border-border p-8 rounded-[2.5rem] flex flex-col items-start hover:border-accent/50 transition-colors">
                <div className="w-12 h-12 bg-accent/10 rounded-2xl flex items-center justify-center mb-6">
                  <MessageSquare className="w-6 h-6 text-accent" />
                </div>
                <h3 className="font-bold text-xl mb-2">Press & Media</h3>
                <p className="text-muted-foreground mb-4">For press kits and media inquiries.</p>
                <a href="mailto:press@tecrese.com" className="font-bold text-accent hover:underline mt-auto">press@tecrese.com</a>
              </div>
            </ScrollReveal>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <ScrollReveal delay={0.3}>
              <div className="bg-card border border-border p-8 md:p-12 rounded-[3rem] shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-[radial-gradient(circle,var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent -translate-y-1/2 translate-x-1/3 pointer-events-none" />
                
                <h2 className="font-heading text-3xl font-bold mb-8">Send a Message</h2>
                
                <form className="space-y-6 relative z-10" action="/api/contact" method="POST">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider ml-1">Your Name</label>
                      <input 
                        type="text" name="name" 
                        required 
                        placeholder="Jane Doe"
                        className="w-full px-5 py-4 bg-background border border-border rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all" 
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider ml-1">Email Address</label>
                      <input 
                        type="email" name="email" 
                        required 
                        placeholder="jane@example.com"
                        className="w-full px-5 py-4 bg-background border border-border rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all" 
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider ml-1">Subject</label>
                    <select name="subject" className="w-full px-5 py-4 bg-background border border-border rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all appearance-none">
                      <option>General Inquiry</option>
                      <option>Editorial / Guest Post</option>
                      <option>Partnership</option>
                      <option>Report an Issue</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider ml-1">Message</label>
                    <textarea name="message" 
                      required 
                      rows={6}
                      placeholder="How can we help you?"
                      className="w-full px-5 py-4 bg-background border border-border rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all resize-none" 
                    />
                  </div>

                  <button 
                    type="submit" 
                    className="w-full md:w-auto px-10 py-4 bg-primary text-primary-foreground font-bold rounded-full shadow-lg shadow-primary/25 hover:opacity-90 hover:scale-[1.02] active:scale-[0.98] transition-all"
                  >
                    Send Message
                  </button>
                </form>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </div>
    </div>
  );
}
