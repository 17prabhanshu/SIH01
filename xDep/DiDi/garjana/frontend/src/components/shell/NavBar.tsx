'use client'

interface NavBarProps {
  active: string
  onNavigate: (tab: string) => void
}

const TABS = [
  { id: 'control-room', label: 'CONTROL ROOM' },
  { id: 'storms', label: 'STORMS' },
  { id: 'replay', label: 'REPLAY' },
  { id: 'alerts', label: 'ALERTS' },
  { id: 'verification', label: 'VERIFICATION' },
  { id: 'data-health', label: 'DATA HEALTH' },
]

export default function NavBar({ active, onNavigate }: NavBarProps) {
  return (
    <div className="h-9 bg-g-surface border-b border-g-border flex items-center px-5 w-full shrink-0 overflow-x-auto z-20">
      <div className="flex h-full gap-1">
        {TABS.map(tab => {
          const isActive = active === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => onNavigate(tab.id)}
              className={`h-full px-3 flex items-center uppercase tracking-[0.15em] text-[10px] font-medium border-b-2 transition-colors whitespace-nowrap ${
                isActive
                  ? 'border-g-accent text-white'
                  : 'border-transparent text-g-text-muted hover:text-g-text-dim hover:border-g-border-light'
              }`}
            >
              {tab.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
