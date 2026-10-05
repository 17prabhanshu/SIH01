"use client";

import { useState } from "react";
import { Sparkles, Loader2, CheckCircle2, AlertTriangle, Lightbulb, Wand2, Link as LinkIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";

export function AiSeoAssistant({ article }: { article: any }) {
  const router = useRouter();
  const [analyzing, setAnalyzing] = useState(false);
  const [magicDrafting, setMagicDrafting] = useState(false);
  const [autoLinking, setAutoLinking] = useState(false);
  const [suggestions, setSuggestions] = useState<{type: 'success'|'warning'|'idea', text: string}[] | null>(null);

  const analyze = () => {
    setAnalyzing(true);
    setSuggestions(null);
    
    setTimeout(() => {
      const titleInput = document.querySelector('input[name="seoTitle"]') as HTMLInputElement;
      const descInput = document.querySelector('textarea[name="seoDescription"]') as HTMLTextAreaElement;
      const keywordInput = document.querySelector('input[name="focusKeyword"]') as HTMLInputElement;
      
      const title = titleInput?.value || article.seoTitle || article.title || "";
      const desc = descInput?.value || article.seoDescription || article.excerpt || "";
      const keyword = keywordInput?.value || article.focusKeyword || "";
      const content = article.body || "";

      const results: {type: 'success'|'warning'|'idea', text: string}[] = [];

      if (!keyword) {
        results.push({ type: 'warning', text: "You haven't set a Focus Keyword. Setting one allows me to deeply analyze relevance." });
      } else {
        const keywordLower = keyword.toLowerCase();
        
        if (title.toLowerCase().includes(keywordLower)) {
          results.push({ type: 'success', text: `Great job! Your focus keyword "${keyword}" is present in the SEO Title.` });
        } else {
          results.push({ type: 'idea', text: `Try adding "${keyword}" to the beginning of your SEO Title for better indexing.` });
        }

        if (desc.toLowerCase().includes(keywordLower)) {
          results.push({ type: 'success', text: `Your meta description includes the focus keyword.` });
        } else {
          results.push({ type: 'idea', text: `Rewrite the meta description to naturally include "${keyword}".` });
        }

        const keywordCount = (content.toLowerCase().match(new RegExp(keywordLower, "g")) || []).length;
        if (keywordCount === 0) {
          results.push({ type: 'warning', text: `The focus keyword doesn't appear anywhere in the guest author's content! Consider editing the first paragraph to include it.` });
        } else if (keywordCount > 10) {
          results.push({ type: 'warning', text: `Keyword stuffing detected! You used "${keyword}" ${keywordCount} times. Try using synonyms instead.` });
        }
      }

      if (title.length < 40) {
        results.push({ type: 'idea', text: `Your SEO Title (${title.length} chars) is a bit short. Try expanding it, e.g., "${title}: The Ultimate Guide".` });
      } else if (title.length > 60) {
        results.push({ type: 'warning', text: `Your SEO Title (${title.length} chars) is too long and will be truncated by Google. Keep it under 60 characters.` });
      } else {
        results.push({ type: 'success', text: "SEO Title length is perfectly optimized (40-60 characters)." });
      }

      if (desc.length < 120) {
        results.push({ type: 'idea', text: `Your meta description is too short (${desc.length} chars). Expand it to ~150 chars to improve click-through rates.` });
      } else if (desc.length > 160) {
        results.push({ type: 'warning', text: `Meta description is too long (${desc.length} chars). Google cuts it off at 160. Try condensing it.` });
      }

      setSuggestions(results);
      setAnalyzing(false);
    }, 1500);
  };

  const handleMagicDraft = () => {
    setMagicDrafting(true);
    setTimeout(() => {
      // Heuristic generation based on article title and content
      const baseTopic = article.title.replace(/[^a-zA-Z0-9 ]/g, "").split(" ").slice(0, 3).join(" ");
      const generatedKeyword = baseTopic.toLowerCase();
      const generatedTitle = `${article.title} | Complete 2026 Guide & Analysis`;
      
      // Extract a smart snippet from the body for the description
      const sentences = (article.body || "").split(". ");
      const cleanSnippet = (sentences[0] || article.excerpt || "").substring(0, 100);
      const generatedDesc = `Discover everything you need to know about ${generatedKeyword}. ${cleanSnippet}... Read our complete analysis and expert review to stay ahead of the curve.`;

      // Inject into DOM
      const titleInput = document.querySelector('input[name="seoTitle"]') as HTMLInputElement;
      const descInput = document.querySelector('textarea[name="seoDescription"]') as HTMLTextAreaElement;
      const keywordInput = document.querySelector('input[name="focusKeyword"]') as HTMLInputElement;

      if (titleInput) titleInput.value = generatedTitle.substring(0, 60);
      if (descInput) descInput.value = generatedDesc.substring(0, 155);
      if (keywordInput) keywordInput.value = generatedKeyword;

      setMagicDrafting(false);
      
      // Auto-analyze after generating
      setTimeout(analyze, 300);
    }, 2000);
  };

  const handleAutoLink = async () => {
    setAutoLinking(true);
    try {
      const res = await fetch(`/api/admin/articles/${article.id}/auto-link`, { method: "POST" });
      if (res.ok) {
        router.refresh(); // Refresh the page to show the newly linked content
      }
    } catch (e) {
      console.error(e);
    } finally {
      setAutoLinking(false);
    }
  };

  return (
    <div className="mt-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h2 className="font-bold text-xl flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-indigo-500" />
          AI SEO Assistant
        </h2>
        <div className="flex flex-wrap items-center gap-2">
          <button 
            type="button"
            onClick={handleAutoLink}
            disabled={autoLinking || analyzing || magicDrafting}
            className="text-xs bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 border border-emerald-500/20 px-3 py-1.5 rounded-full font-bold transition-colors flex items-center gap-1.5 disabled:opacity-50"
          >
            {autoLinking ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <LinkIcon className="w-3.5 h-3.5" />}
            Semantic Link
          </button>
          
          <button 
            type="button"
            onClick={handleMagicDraft}
            disabled={magicDrafting || analyzing || autoLinking}
            className="text-xs bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 border border-amber-500/20 px-3 py-1.5 rounded-full font-bold transition-colors flex items-center gap-1.5 disabled:opacity-50"
          >
            {magicDrafting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Wand2 className="w-3.5 h-3.5" />}
            Magic Draft
          </button>

          <button 
            type="button"
            onClick={analyze}
            disabled={analyzing || magicDrafting || autoLinking}
            className="text-xs bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-1.5 rounded-full font-bold transition-colors flex items-center gap-1.5 disabled:opacity-50"
          >
            {analyzing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
            {suggestions ? "Re-Analyze" : "Analyze"}
          </button>
        </div>
      </div>

      <div className="bg-indigo-500/5 border border-indigo-500/20 p-6 rounded-2xl relative overflow-hidden min-h-[150px]">
        {/* Background glow */}
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-indigo-500/10 blur-3xl rounded-full" />
        
        <AnimatePresence mode="wait">
          {!suggestions && !analyzing && !magicDrafting && !autoLinking && (
            <motion.div 
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex flex-col items-center justify-center text-center p-6"
            >
              <Sparkles className="w-8 h-8 text-indigo-500/50 mb-3" />
              <p className="text-muted-foreground text-sm max-w-[250px]">
                Click Magic Draft to auto-write SEO, Semantic Link to interconnect entities, or Analyze to scan manually.
              </p>
            </motion.div>
          )}

          {(analyzing || magicDrafting || autoLinking) && (
            <motion.div 
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex flex-col items-center justify-center text-center p-6"
            >
              <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mb-3" />
              <p className="text-indigo-500 text-sm font-bold animate-pulse">
                {magicDrafting ? "Generating AI SEO metadata..." : 
                 autoLinking ? "Scanning and semantically linking entities..." : 
                 "Running heuristic algorithms..."}
              </p>
            </motion.div>
          )}

          {suggestions && !analyzing && !magicDrafting && !autoLinking && (
            <motion.div 
              key="results"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4 relative z-10"
            >
              {suggestions.map((s, i) => (
                <div key={i} className={`flex gap-3 p-3 rounded-xl border ${
                  s.type === 'success' ? 'bg-green-500/10 border-green-500/20 text-green-700 dark:text-green-400' :
                  s.type === 'warning' ? 'bg-orange-500/10 border-orange-500/20 text-orange-700 dark:text-orange-400' :
                  'bg-indigo-500/10 border-indigo-500/20 text-indigo-700 dark:text-indigo-400'
                }`}>
                  <div className="mt-0.5 flex-shrink-0">
                    {s.type === 'success' && <CheckCircle2 className="w-4 h-4" />}
                    {s.type === 'warning' && <AlertTriangle className="w-4 h-4" />}
                    {s.type === 'idea' && <Lightbulb className="w-4 h-4" />}
                  </div>
                  <p className="text-sm font-medium leading-snug">{s.text}</p>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
