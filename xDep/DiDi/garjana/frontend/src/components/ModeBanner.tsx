'use client'

interface ModeBannerProps {
  runMode: string
  systemMode: string
  eventId?: string
  simTime?: string
}

/**
 * R9: LIVE / REPLAY / SYNTHETIC banner is mandatory at all times.
 */
export default function ModeBanner({ runMode, systemMode, eventId, simTime }: ModeBannerProps) {
  const bannerClass = runMode === 'LIVE'
    ? 'mode-live'
    : runMode === 'REPLAY'
      ? 'mode-replay'
      : 'mode-synthetic'

  return (
    <div className={`mode-banner ${bannerClass}`}>
      <span>{runMode}</span>
      {eventId && <span> — {eventId}</span>}
      {simTime && <span> — {simTime}</span>}
      <span className="mx-3">|</span>
      <span>System: {systemMode}</span>
      {runMode === 'SYNTHETIC' && (
        <span className="ml-3 text-xs opacity-75">
          ⚠ Data is SYNTHETIC — not real observations
        </span>
      )}
    </div>
  )
}
