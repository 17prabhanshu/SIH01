import { ScrollReveal } from "@/components/animations/scroll-reveal";

export const metadata = { title: 'Terms of Service | Agentverse' };

export default function TermsPage() {
  return (
    <div className="relative min-h-screen pb-24">
      <div className="absolute top-0 left-1/4 w-[50vw] h-[50vw] bg-[radial-gradient(circle,var(--tw-gradient-stops))] from-accent/10 via-accent/5 to-transparent mix-blend-multiply pointer-events-none -z-10 dark:bg-emerald-900/10" />

      <div className="container mx-auto py-24 px-4 sm:px-6 lg:px-8 max-w-4xl">
        <ScrollReveal>
          <h1 className="font-heading text-5xl md:text-6xl font-extrabold tracking-tight mb-6">
            Terms of <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-primary">Service</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-12">Effective Date: September 18, 2026</p>
        </ScrollReveal>

        <ScrollReveal delay={0.1}>
          <div className="prose prose-lg dark:prose-invert max-w-none prose-headings:font-heading prose-headings:font-bold prose-h2:text-3xl prose-h2:mt-12 prose-h2:mb-6 prose-a:text-primary">
            <p className="lead text-xl">
              Welcome to Agentverse. These Terms of Service ("Terms") govern your use of the Agentverse website, platform, and related services (collectively, the "Services"). By accessing or using our Services, you agree to be bound by these Terms.
            </p>

            <h2>1. Acceptance of Terms</h2>
            <p>By accessing this website, we assume you accept these terms and conditions. Do not continue to use Agentverse if you do not agree to take all of the terms and conditions stated on this page.</p>

            <h2>2. Guest Posting & Content Contributions</h2>
            <p>Users may submit articles, guides, and other content ("Contributions") via our Guest Posting system. By submitting a Contribution, you agree to the following:</p>
            <ul>
              <li><strong>Originality:</strong> Your Contribution must be original and not plagiarized or spun from other sources.</li>
              <li><strong>License:</strong> You grant Agentverse a perpetual, worldwide, non-exclusive, royalty-free license to use, reproduce, edit, publish, and distribute your Contribution.</li>
              <li><strong>Accuracy:</strong> You are solely responsible for the factual accuracy of your Contribution.</li>
              <li><strong>No Promotional Spam:</strong> We reserve the right to remove undisclosed affiliate links, spam, or excessive self-promotion at our editorial discretion.</li>
            </ul>

            <h2>3. AI Agents & Third-Party Tools</h2>
            <p>Agentverse acts as a discovery and intelligence platform for autonomous AI agents, tools, and foundational models. We do not own, operate, or control the third-party agents listed in our directory.</p>
            <ul>
              <li>You acknowledge that interacting with autonomous AI agents carries inherent risks, including but not limited to hallucinations, unintended actions, or data processing errors.</li>
              <li>Agentverse is not liable for any damages, data loss, or system compromise resulting from your use of third-party agents, MCP servers, or tools discovered through our platform.</li>
            </ul>

            <h2>4. Intellectual Property</h2>
            <p>Unless otherwise stated, Agentverse and/or its licensors own the intellectual property rights for all material on Agentverse. All intellectual property rights are reserved. You may access this from Agentverse for your own personal use subjected to restrictions set in these terms and conditions.</p>

            <h2>5. User Accounts & Security</h2>
            <p>If you create an account on the Services, you are responsible for maintaining the security of your account, and you are fully responsible for all activities that occur under the account and any other actions taken in connection with it. You must immediately notify Agentverse of any unauthorized uses of your account or any other breaches of security.</p>

            <h2>6. Limitation of Liability</h2>
            <p>In no event shall Agentverse, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from:</p>
            <ul>
              <li>Your access to or use of or inability to access or use the Services;</li>
              <li>Any conduct or content of any third party on the Services;</li>
              <li>Any content obtained from the Services; and</li>
              <li>Unauthorized access, use or alteration of your transmissions or content.</li>
            </ul>

            <h2>7. Governing Law</h2>
            <p>These Terms shall be governed and construed in accordance with the laws of the jurisdiction in which Agentverse operates, without regard to its conflict of law provisions.</p>
          </div>
        </ScrollReveal>
      </div>
    </div>
  );
}
