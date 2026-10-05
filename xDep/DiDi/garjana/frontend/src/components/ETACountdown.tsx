'use client'

interface ETACountdownProps {
  etaP10: number | null
  etaP50: number | null
  etaP90: number | null
  pImpact60: number | null
  pImpact120: number | null
  nMembersImpacting: number
  nMembersTotal: number
  assetName: string
}

/**
 * Probabilistic ETA display.
 * Shows median + interval band, NEVER a bare ticking number.
 * R1: Every number from computation.
 */
export default function ETACountdown({
  etaP10, etaP50, etaP90,
  pImpact60, pImpact120,
  nMembersImpacting, nMembersTotal,
  assetName
}: ETACountdownProps) {
  const impactLikelihood = nMembersImpacting / nMembersTotal

  if (impactLikelihood < 0.5) {
    return (
      <div className="bg-garjana-dark rounded-lg p-3 border border-gray-700">
        <div className="text-xs text-gray-400">{assetName}</div>
        <div className="text-sm text-gray-500 mt-1">
          Impact possible, low likelihood ({Math.round(impactLikelihood * 100)}% of members)
        </div>
      </div>
    )
  }

  return (
    <div className="bg-garjana-dark rounded-lg p-3 border border-amber-700">
      <div className="text-xs text-gray-400">{assetName}</div>
      <div className="mt-1">
        <span className="text-xl font-bold text-amber-400">
          {etaP50 !== null ? `${etaP50} min` : '--'}
        </span>
        <span className="text-xs text-gray-400 ml-2">
          (10-90%: {etaP10 ?? '--'}-{etaP90 ?? '--'} min)
        </span>
      </div>
      <div className="flex gap-4 mt-2 text-xs">
        <div>
          <span className="text-gray-500">P(≤60 min):</span>
          <span className="ml-1">{pImpact60 !== null ? pImpact60.toFixed(2) : '--'}</span>
        </div>
        <div>
          <span className="text-gray-500">P(≤120 min):</span>
          <span className="ml-1">{pImpact120 !== null ? pImpact120.toFixed(2) : '--'}</span>
        </div>
      </div>
      {/* Visual band */}
      <div className="mt-2 h-2 bg-gray-700 rounded-full relative">
        {etaP10 !== null && etaP90 !== null && etaP50 !== null && (
          <>
            <div
              className="absolute h-full bg-amber-800 rounded-full"
              style={{
                left: `${(etaP10 / 180) * 100}%`,
                width: `${((etaP90 - etaP10) / 180) * 100}%`,
              }}
            />
            <div
              className="absolute h-full w-1 bg-amber-400 rounded"
              style={{ left: `${(etaP50 / 180) * 100}%` }}
            />
          </>
        )}
      </div>
    </div>
  )
}
