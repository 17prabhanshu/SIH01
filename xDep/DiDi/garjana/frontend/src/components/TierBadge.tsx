'use client';

interface TierBadgeProps {
  tier?: string;
  size?: 'sm' | 'xs';
}

export default function TierBadge({ tier, size = 'sm' }: TierBadgeProps) {
  const t = tier?.toLowerCase() || '';
  
  let colorClass = 'bg-rose-500/20 text-rose-400 border border-rose-500/30';
  let label = 'NO TIER';

  if (t === 'validated') {
    colorClass = 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30';
    label = 'Validated';
  } else if (t === 'experimental') {
    colorClass = 'bg-amber-500/20 text-amber-400 border border-amber-500/30';
    label = 'Experimental';
  } else if (t === 'proxy') {
    colorClass = 'bg-gray-500/20 text-gray-400 border border-gray-500/30';
    label = 'Proxy';
  } else if (t === 'environment' || t === 'environment_only') {
    colorClass = 'bg-sky-500/20 text-sky-400 border border-sky-500/30';
    label = 'Environment';
  }

  const sizeClass = size === 'xs' ? 'text-[9px] px-1 py-0' : 'text-[10px] px-1.5 py-0.5';

  return (
    <span className={`rounded-full uppercase tracking-wider font-medium ${sizeClass} ${colorClass}`}>
      {label}
    </span>
  );
}
