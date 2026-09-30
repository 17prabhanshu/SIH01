'use client'

interface TierBadgeProps {
  tier: string
}

/**
 * R3: Every hazard value must show its validation tier.
 * The UI refuses to render a hazard without a tier badge.
 */
export default function TierBadge({ tier }: TierBadgeProps) {
  const tierClasses: Record<string, string> = {
    validated: 'tier-badge tier-validated',
    experimental: 'tier-badge tier-experimental',
    environment_only: 'tier-badge tier-environment_only',
    proxy: 'tier-badge tier-proxy',
  }

  const tierLabels: Record<string, string> = {
    validated: 'Validated',
    experimental: 'Experimental',
    environment_only: 'Env-only',
    proxy: 'Proxy',
  }

  if (!tier) {
    // R3: Refuse to render without tier
    return <span className="tier-badge bg-red-900 text-red-200 border border-red-500">NO TIER</span>
  }

  return (
    <span className={tierClasses[tier] || 'tier-badge bg-gray-600 text-gray-300'}>
      {tierLabels[tier] || tier}
    </span>
  )
}
