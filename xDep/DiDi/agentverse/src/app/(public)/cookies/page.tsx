import { ScrollReveal } from "@/components/animations/scroll-reveal";

export const metadata = { title: 'Cookie Policy | Agentverse' };

export default function CookiesPage() {
  return (
    <div className="relative min-h-screen pb-24">
      <div className="absolute top-0 right-1/4 w-[50vw] h-[50vw] bg-[radial-gradient(circle,var(--tw-gradient-stops))] from-primary/10 via-primary/5 to-transparent mix-blend-multiply pointer-events-none -z-10" />

      <div className="container mx-auto py-24 px-4 sm:px-6 lg:px-8 max-w-4xl">
        <ScrollReveal>
          <h1 className="font-heading text-5xl md:text-6xl font-extrabold tracking-tight mb-6">
            Cookie <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">Policy</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-12">Last Updated: September 18, 2026</p>
        </ScrollReveal>

        <ScrollReveal delay={0.1}>
          <div className="prose prose-lg dark:prose-invert max-w-none prose-headings:font-heading prose-headings:font-bold prose-h2:text-3xl prose-h2:mt-12 prose-h2:mb-6 prose-a:text-primary">
            <p className="lead text-xl">
              This Cookie Policy explains how Agentverse uses cookies and similar technologies to recognize you when you visit our website. It explains what these technologies are and why we use them, as well as your rights to control our use of them.
            </p>

            <h2>1. What are cookies?</h2>
            <p>Cookies are small data files that are placed on your computer or mobile device when you visit a website. Cookies are widely used by website owners in order to make their websites work, or to work more efficiently, as well as to provide reporting information.</p>
            <p>Cookies set by the website owner (in this case, Agentverse) are called "first-party cookies". Cookies set by parties other than the website owner are called "third-party cookies".</p>

            <h2>2. Why do we use cookies?</h2>
            <p>We use first-party and third-party cookies for several reasons. Some cookies are required for technical reasons in order for our Website to operate, and we refer to these as "essential" or "strictly necessary" cookies. Other cookies also enable us to track and target the interests of our users to enhance the experience on our Website.</p>

            <h3>Essential Cookies</h3>
            <p>These cookies are strictly necessary to provide you with services available through our Website and to use some of its features, such as access to secure areas.</p>
            
            <h3>Analytics and Customization Cookies</h3>
            <p>These cookies collect information that is used either in aggregate form to help us understand how our Website is being used or how effective our marketing campaigns are, or to help us customize our Website for you.</p>

            <h3>Advertising Cookies</h3>
            <p>These cookies are used to make advertising messages more relevant to you. They perform functions like preventing the same ad from continuously reappearing, ensuring that ads are properly displayed for advertisers, and in some cases selecting advertisements that are based on your interests.</p>

            <h2>3. How can I control cookies?</h2>
            <p>You have the right to decide whether to accept or reject cookies. You can exercise your cookie rights by setting your preferences in our Cookie Consent Manager, which appears when you first visit the site.</p>
            <p>In addition, you can set or amend your web browser controls to accept or refuse cookies. If you choose to reject cookies, you may still use our website though your access to some functionality and areas of our website may be restricted.</p>
            
            <h2>4. Updates to this policy</h2>
            <p>We may update this Cookie Policy from time to time in order to reflect, for example, changes to the cookies we use or for other operational, legal, or regulatory reasons. Please therefore revisit this Cookie Policy regularly to stay informed about our use of cookies and related technologies.</p>
          </div>
        </ScrollReveal>
      </div>
    </div>
  );
}
