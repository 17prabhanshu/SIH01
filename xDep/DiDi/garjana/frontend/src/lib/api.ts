const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001'
const WS  = process.env.NEXT_PUBLIC_WS_URL  || 'ws://localhost:8001/ws/events'

export { API, WS }

// ── Types ──────────────────────────────────────────────────────────
export interface Storm {
  storm_id: string
  centroid_lat: number
  centroid_lon: number
  area_km2: number
  zmax: number
  timestamp: string | null
}

export interface Hazard {
  hazard: string
  value: number
  unit: string
  validation_tier: string
}

export interface Alert {
  alert_id: string
  hazard: string
  validation_tier: string
  status: string
  issued: string
  approved_by?: string
  dismiss_reason?: string
}

export interface HealthData {
  status: string
  service: string
  version: string
  run_mode: string
  system_mode: string
  timestamp: string
  cycle_available: boolean
}

export interface OI {
  composite: number
  components: Record<string, number>
}

export interface DataSource {
  source: string
  status: string
  fidelity: string
}

export interface ForecastFrame {
  lead_min: number
  shape: number[]
  min_dbz: number
  max_dbz: number
  mean_dbz: number
}

export interface CycleResult {
  status: string
  cycle_time: string
  elapsed_seconds: number
  steps: Record<string, string>
  num_storms: number
  num_hazards: number
  num_alerts: number
  run_mode: string
}

export interface VerificationScores {
  metadata: {
    evaluation_type: string
    data_source: string
    motion_backend: string
    n_seeds: number
    timestamp: string
  }
  results: Record<string, {
    csi_extrap_mean: number
    csi_extrap_p025: number
    csi_extrap_p975: number
    csi_persist_mean: number
    fss_extrap_mean: number
  }>
}

// ── Fetch helpers ──────────────────────────────────────────────────
async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${API}${path}`, { cache: 'no-store' })
  if (!res.ok) throw new Error(`API ${path}: ${res.status}`)
  return res.json()
}

async function post<T>(path: string, body?: unknown): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
    cache: 'no-store',
  })
  if (!res.ok) throw new Error(`API ${path}: ${res.status}`)
  return res.json()
}

// ── API functions ──────────────────────────────────────────────────
export const api = {
  health:       () => get<HealthData>('/health'),
  storms:       () => get<{ storms: Storm[]; count: number; run_mode: string }>('/storms'),
  hazards:      () => get<{ hazards: Hazard[]; count: number; run_mode: string }>('/hazards'),
  alerts:       () => get<{ alerts: Alert[]; count: number; run_mode: string }>('/alerts'),
  oi:           () => get<{ oi: OI | null; run_mode: string }>('/oi'),
  dataHealth:   () => get<{ sources: DataSource[]; run_mode: string }>('/data-health'),
  verification: () => get<{ scores: VerificationScores; run_mode: string }>('/verification'),
  forecastFrames: () => get<{ frames: ForecastFrame[]; run_mode: string }>('/forecast/frames'),
  bundles:      () => get<{ bundles: string[]; run_mode: string }>('/replay/bundles'),
  runReplay:    (bundle?: string, mode?: string) => post<CycleResult>(`/replay/run${bundle ? `?bundle_name=${bundle}` : ''}${mode ? `&mode=${mode}` : ''}`),
  approveAlert: (id: string) => post<Alert>(`/alerts/${id}/approve`),
  dismissAlert: (id: string, reason?: string) => post<Alert>(`/alerts/${id}/dismiss?reason=${reason || ''}`),
}
