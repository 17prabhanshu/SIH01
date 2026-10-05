import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "NewsMediaOrganization",
            "name": "Agentverse",
            "url": "https://tecrese.com",
            "logo": "https://tecrese.com/logo.png",
            "sameAs": [
              "https://twitter.com/tecrese"
            ],
            "description": "The premier platform for discovering, building, and learning about AI agents, tools, and the models that power them.",
            "knowsAbout": ["Artificial Intelligence", "AI Agents", "Machine Learning", "Software Development"],
            "ethicsPolicy": "https://tecrese.com/about/editorial-policy",
            "unnamedSourcesPolicy": "https://tecrese.com/about/editorial-policy",
            "actionableFeedbackPolicy": "https://tecrese.com/contact"
          })
        }}
      />
      <Navbar />
      <main className="flex-1 mt-16 flex flex-col">
        {children}
      </main>
      <Footer />
    </>
  );
}
