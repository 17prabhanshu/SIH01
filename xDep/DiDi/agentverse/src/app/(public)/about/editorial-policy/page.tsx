export const metadata = { title: "Editorial Policy | Agentverse" };

export default function EditorialPolicyPage() {
  return (
    <div className="container mx-auto max-w-3xl py-24 px-6">
      <h1 className="text-4xl font-bold font-heading mb-8">Editorial Policy & Standards</h1>
      
      <div className="prose prose-lg dark:prose-invert">
        <p className="lead text-xl text-muted-foreground mb-8">
          Agentverse maintains a strict, independent editorial desk. Our mission is to provide uncompromised intelligence on AI agents and frameworks.
        </p>

        <h2 className="text-2xl font-bold mt-12 mb-4">1. No Unsolicited Guest Posts</h2>
        <p className="mb-6">
          To maintain the highest caliber of research, <strong>we do not accept unsolicited guest posts, paid insertions, or sponsored "dofollow" link placements</strong>. All content published on Agentverse is rigorously reviewed by our internal Industry Analysts and intelligence team.
        </p>

        <h2 className="text-2xl font-bold mt-12 mb-4">2. Editorial Independence</h2>
        <p className="mb-6">
          Our reviews, benchmarks, and security alerts are generated independently. If a software provider or framework creator submits an agent for directory inclusion, it undergoes a strict factual verification process. We do not accept payment for directory prioritization.
        </p>

        <h2 className="text-2xl font-bold mt-12 mb-4">3. Verification & Corrections</h2>
        <p className="mb-6">
          Our Intelligence Team strives for technical accuracy. If a framework specification or model capability changes, we update our records and explicitly log the modification date. If you spot a factual inaccuracy, please contact our intelligence desk for a formal correction.
        </p>
      </div>
    </div>
  );
}
