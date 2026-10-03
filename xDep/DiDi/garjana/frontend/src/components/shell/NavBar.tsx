'use client'

interface NavBarProps {
  active: string
  onNavigate: (tab: string) => void
}

const TABS = [
  { id: 'control-room', label: 'Dashboard' },
  { id: 'storms', label: 'Storm Details' },
  { id: 'replay', label: 'Simulations' },
  { id: 'alerts', label: 'Alerts' },
  { id: 'verification', label: 'Accuracy Scores' },
  { id: 'data-health', label: 'Data Sources' },
]

export default function NavBar({ active, onNavigate }: NavBarProps) {
  return (
    <div className="h-12 bg-g-bg border-b border-g-border flex items-center px-6 w-full shrink-0 overflow-x-auto z-20">
      <div className="flex h-full gap-2">
        {TABS.map(tab => {
          const isActive = active === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => onNavigate(tab.id)}
              className={`h-full px-4 flex items-center text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                isActive
                  ? 'border-g-accent text-white'
                  : 'border-transparent text-g-dim hover:text-white hover:border-g-border'
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
