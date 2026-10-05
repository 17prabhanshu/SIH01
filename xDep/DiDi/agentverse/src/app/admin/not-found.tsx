import Link from "next/link";
import { Hammer } from "lucide-react";

export default function AdminNotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-4">
      <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mb-6 border border-primary/20">
        <Hammer className="w-12 h-12 text-primary" />
      </div>
      <h1 className="font-heading text-4xl font-bold mb-4">Module Under Construction</h1>
      <p className="text-xl text-muted-foreground max-w-lg mb-8">
        This administrative module is currently being built out by our engineering team. It will be available in the next deployment.
      </p>
      <Link 
        href="/admin" 
        className="bg-card text-foreground border border-border px-8 py-3 rounded-full font-bold hover:border-primary/50 transition-colors shadow-sm"
      >
        &larr; Back to Dashboard
      </Link>
    </div>
  );
}
