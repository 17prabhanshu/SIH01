'use client'

interface TierBadgeProps {
  tier?: string
  size?: 'sm' | 'xs'
}

export default function TierBadge({ tier, size = 'sm' }: TierBadgeProps) {
  if (!tier) {
    return (
      <span className={`inline-flex items-center rounded-full bg-g-rose/10 px-2 py-0.5 font-medium text-g-rose ${size === 'xs' ? 'text-[10px]' : 'text-xs'}`}>
        Unvalidated
      </span>
    )
  }

  const t = tier.toLowerCase()
  let colorClass = 'bg-g-dim/10 text-g-dim'

  if (t === 'validated') colorClass = 'bg-g-emerald/10 text-g-emerald'
  else if (t === 'experimental') colorClass = 'bg-g-amber/10 text-g-amber'
  else if (t === 'proxy') colorClass = 'bg-g-dim/10 text-g-dim'
  else if (t === 'environment_only') colorClass = 'bg-g-cyan/10 text-g-cyan'

  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 font-medium capitalize ${colorClass} ${size === 'xs' ? 'text-[10px]' : 'text-xs'}`}>
      {t.replace('_', ' ')}
    </span>
  )
}
