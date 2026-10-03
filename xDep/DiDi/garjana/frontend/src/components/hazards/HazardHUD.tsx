'use client';

import TierBadge from '@/components/TierBadge';

interface HazardData {
  hazard: string;
  value: number;
  unit: string;
  validation_tier: string;
}

interface HazardHUDProps {
  hazards: HazardData[];
}

export default function HazardHUD({ hazards }: HazardHUDProps) {
  if (!hazards || hazards.length === 0) {
    return (
      <div className="glass-panel p-3 max-w-[200px]">
        <div className="text-xs g-text-dim italic">Awaiting data</div>
      </div>
    );
  }

  const humanize = (str: string) => {
    return str.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  const getSeverity = (value: number) => {
    if (value > 0.6) return { label: 'HIGH', color: 'border-rose-500', textClass: 'text-rose-400' };
    if (value >= 0.3) return { label: 'MOD', color: 'border-amber-500', textClass: 'text-amber-400' };
    return { label: 'LOW', color: 'border-gray-500', textClass: 'text-gray-400' };
  };

  return (
    <div className="glass-panel p-2 w-full max-w-[200px] flex flex-col gap-1">
      {hazards.map((h, i) => {
        const severity = getSeverity(h.value);
        return (
          <div 
            key={i} 
            className={`flex flex-col justify-center px-2 py-1 h-8 border-l-2 ${severity.color} bg-black/20`}
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-medium text-gray-200 truncate" title={humanize(h.hazard)}>
                {humanize(h.hazard)}
              </span>
              <TierBadge tier={h.validation_tier} size="xs" />
            </div>
          </div>
        );
      })}
    </div>
  );
}
