'use client'

const SCREENS = [
  { id: 'control-room', label: 'Control Room', icon: '🗺️' },
  { id: 'storm-detail', label: 'Storm Detail', icon: '⛈️' },
  { id: 'asset-watch', label: 'Asset Watch', icon: '🏥' },
  { id: 'alert-desk', label: 'Alert Desk', icon: '🔔' },
  { id: 'verification', label: 'Verification', icon: '📊' },
  { id: 'data-health', label: 'Data Health', icon: '💚' },
]

interface SidebarProps {
  activeScreen: string
  onNavigate: (screen: string) => void
}

export default function Sidebar({ activeScreen, onNavigate }: SidebarProps) {
  return (
    <nav className="w-16 bg-garjana-dark flex flex-col items-center py-4 gap-2 border-r border-gray-800">
      <div className="text-2xl mb-4" title="Garjana">⚡</div>
      {SCREENS.map(screen => (
        <button
          key={screen.id}
          onClick={() => onNavigate(screen.id)}
          className={`w-12 h-12 rounded-lg flex items-center justify-center text-lg transition-colors
            ${activeScreen === screen.id
              ? 'bg-garjana-accent text-white'
              : 'text-gray-500 hover:bg-garjana-secondary hover:text-gray-300'
            }`}
          title={screen.label}
        >
          {screen.icon}
        </button>
      ))}
    </nav>
  )
}
