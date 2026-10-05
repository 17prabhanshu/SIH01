import { ScrollReveal } from "@/components/animations/scroll-reveal";

export const metadata = { title: 'Privacy Policy | Agentverse' };

export default function PrivacyPolicyPage() {
  return (
    <div className="relative min-h-screen pb-24">
      <div className="absolute top-0 right-1/4 w-[50vw] h-[50vw] bg-[radial-gradient(circle,var(--tw-gradient-stops))] from-primary/10 via-primary/5 to-transparent mix-blend-multiply pointer-events-none -z-10" />

      <div className="container mx-auto py-24 px-4 sm:px-6 lg:px-8 max-w-4xl">
        <ScrollReveal>
          <h1 className="font-heading text-5xl md:text-6xl font-extrabold tracking-tight mb-6">
            Privacy <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">Policy</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-12">Last Updated: September 18, 2026</p>
        </ScrollReveal>

        <ScrollReveal delay={0.1}>
          <div className="prose prose-lg dark:prose-invert max-w-none prose-headings:font-heading prose-headings:font-bold prose-h2:text-3xl prose-h2:mt-12 prose-h2:mb-6 prose-a:text-primary">
            <p className="lead text-xl">
              At Agentverse, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our platform, use our API, or interact with our AI agents and services.
            </p>

            <h2>1. Information We Collect</h2>
            <p>We may collect information about you in a variety of ways. The information we may collect on the Site includes:</p>
            <ul>
              <li><strong>Personal Data:</strong> Personally identifiable information, such as your name, shipping address, email address, and telephone number, that you voluntarily give to us when you register with the Site or when you choose to participate in various activities related to the Site.</li>
              <li><strong>Derivative Data:</strong> Information our servers automatically collect when you access the Site, such as your IP address, your browser type, your operating system, your access times, and the pages you have viewed directly before and after accessing the Site.</li>
              <li><strong>AI Interaction Data:</strong> When you interact with AI models or agents hosted on or linked through our platform, the prompts, inputs, and feedback you provide may be processed to improve the underlying models.</li>
            </ul>

            <h2>2. Use of Your Information</h2>
            <p>Having accurate information about you permits us to provide you with a smooth, efficient, and customized experience. Specifically, we may use information collected about you via the Site to:</p>
            <ul>
              <li>Create and manage your account.</li>
              <li>Deliver targeted advertising, newsletters, and other information regarding promotions and the Site to you.</li>
              <li>Monitor and analyze usage and trends to improve your experience with the Site.</li>
              <li>Process guest post submissions and editorial profiles.</li>
            </ul>

            <h2>3. Disclosure of Your Information</h2>
            <p>We may share information we have collected about you in certain situations. Your information may be disclosed as follows:</p>
            <ul>
              <li><strong>By Law or to Protect Rights:</strong> If we believe the release of information about you is necessary to respond to legal process, to investigate or remedy potential violations of our policies, or to protect the rights, property, and safety of others.</li>
              <li><strong>Third-Party Service Providers:</strong> We may share your information with third parties that perform services for us or on our behalf, including data analysis, email delivery, hosting services, customer service, and marketing assistance.</li>
              <li><strong>AI Model Partners:</strong> Anonymized interaction data may be shared with our foundational model partners to ensure safety and alignment of agentic tools.</li>
            </ul>

            <h2>4. Security of Your Information</h2>
            <p>We use administrative, technical, and physical security measures to help protect your personal information. While we have taken reasonable steps to secure the personal information you provide to us, please be aware that despite our efforts, no security measures are perfect or impenetrable, and no method of data transmission can be guaranteed against any interception or other type of misuse.</p>

            <h2>5. Policy for Children</h2>
            <p>We do not knowingly solicit information from or market to children under the age of 13. If you become aware of any data we have collected from children under age 13, please contact us using the contact information provided below.</p>

            <h2>6. Your Privacy Rights (GDPR & CCPA)</h2>
            <p>Depending on your location, you may have the following rights regarding your personal data:</p>
            <ul>
              <li>The right to access, update, or delete the information we have on you.</li>
              <li>The right of rectification.</li>
              <li>The right to object to processing.</li>
              <li>The right of restriction.</li>
              <li>The right to data portability.</li>
              <li>The right to withdraw consent.</li>
            </ul>
            <p>To exercise these rights, please contact our Data Protection Officer at privacy@tecrese.com.</p>
          </div>
        </ScrollReveal>
      </div>
    </div>
  );
}
