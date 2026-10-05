-- Garjana PostGIS Schema
-- Architecture spec §3.11

-- Enable PostGIS
CREATE EXTENSION IF NOT EXISTS postgis;

-- Storm cells (tracked objects)
CREATE TABLE IF NOT EXISTS storm_cells (
    storm_id TEXT NOT NULL,
    ts TIMESTAMPTZ NOT NULL,
    geom GEOMETRY(Polygon, 4326),
    centroid GEOMETRY(Point, 4326),
    area_km2 REAL,
    zmax REAL,
    vil REAL,
    echo_top_proxy REAL,
    flash_rate REAL,
    flash_rate_trend REAL,
    u_kmh REAL,
    v_kmh REAL,
    growth REAL,
    track_id TEXT,
    lifecycle_event TEXT,
    PRIMARY KEY (storm_id, ts)
);

-- Hazard forecasts
CREATE TABLE IF NOT EXISTS hazard_forecasts (
    id BIGSERIAL PRIMARY KEY,
    storm_id TEXT,
    issued TIMESTAMPTZ NOT NULL,
    valid_time TIMESTAMPTZ NOT NULL,
    lead_min INT NOT NULL,
    hazard TEXT NOT NULL,
    value REAL NOT NULL,
    unit TEXT NOT NULL,
    validation_tier TEXT NOT NULL,  -- R3: REQUIRED
    method_version TEXT NOT NULL,
    oi_mean REAL,
    geom GEOMETRY(MultiPolygon, 4326)
);

-- Exposure assets (airports, highways, hospitals, etc.)
CREATE TABLE IF NOT EXISTS exposure_assets (
    asset_id TEXT PRIMARY KEY,
    kind TEXT NOT NULL,
    name TEXT,
    criticality REAL NOT NULL DEFAULT 0.5,
    geom GEOMETRY(Geometry, 4326)
);

-- ETA estimates (probabilistic)
CREATE TABLE IF NOT EXISTS eta_estimates (
    storm_id TEXT NOT NULL,
    asset_id TEXT NOT NULL,
    issued TIMESTAMPTZ NOT NULL,
    eta_p10 INT,
    eta_p50 INT,
    eta_p90 INT,
    p_impact_60 REAL,
    p_impact_120 REAL,
    n_members_impacting INT DEFAULT 0,
    n_members_total INT DEFAULT 8,
    PRIMARY KEY (storm_id, asset_id, issued)
);

-- Alerts (CAP-style)
CREATE TABLE IF NOT EXISTS alerts (
    alert_id TEXT PRIMARY KEY,
    status TEXT NOT NULL DEFAULT 'draft',  -- R10: always starts draft
    hazard TEXT NOT NULL,
    severity TEXT,
    urgency TEXT,
    certainty TEXT,
    validation_tier TEXT NOT NULL,  -- R3
    issued TIMESTAMPTZ,
    expires TIMESTAMPTZ,
    geom GEOMETRY(MultiPolygon, 4326),
    cap_xml TEXT,
    languages TEXT[] DEFAULT ARRAY['en', 'hi'],
    approved_by TEXT,
    dismiss_reason TEXT,
    outcome TEXT
);

-- Observation metadata (provenance tracking - R2)
CREATE TABLE IF NOT EXISTS observations_meta (
    source TEXT NOT NULL,
    valid_time TIMESTAMPTZ NOT NULL,
    received_time TIMESTAMPTZ NOT NULL,
    fidelity TEXT NOT NULL,  -- native/derived/proxy/synthetic
    qc JSONB DEFAULT '{}',
    meta JSONB DEFAULT '{}',
    PRIMARY KEY (source, valid_time)
);

-- Verification scores
CREATE TABLE IF NOT EXISTS verification_scores (
    run_id TEXT NOT NULL,
    model TEXT NOT NULL,
    lead_min INT NOT NULL,
    metric TEXT NOT NULL,
    threshold REAL,
    oi_bucket TEXT DEFAULT 'all',
    value REAL NOT NULL,
    n INT NOT NULL DEFAULT 0,
    PRIMARY KEY (run_id, model, lead_min, metric, threshold, oi_bucket)
);

-- Mode transitions log
CREATE TABLE IF NOT EXISTS mode_transitions (
    id BIGSERIAL PRIMARY KEY,
    ts TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    old_mode TEXT,
    new_mode TEXT NOT NULL,
    reason TEXT,
    source_status JSONB DEFAULT '{}'
);

-- Indices
CREATE INDEX IF NOT EXISTS idx_storm_cells_ts ON storm_cells (ts);
CREATE INDEX IF NOT EXISTS idx_storm_cells_track ON storm_cells (track_id);
CREATE INDEX IF NOT EXISTS idx_hazard_forecasts_issued ON hazard_forecasts (issued);
CREATE INDEX IF NOT EXISTS idx_hazard_forecasts_hazard ON hazard_forecasts (hazard);
CREATE INDEX IF NOT EXISTS idx_alerts_status ON alerts (status);
CREATE INDEX IF NOT EXISTS idx_observations_meta_source ON observations_meta (source);
CREATE INDEX IF NOT EXISTS idx_storm_cells_geom ON storm_cells USING GIST (geom);
CREATE INDEX IF NOT EXISTS idx_hazard_forecasts_geom ON hazard_forecasts USING GIST (geom);
CREATE INDEX IF NOT EXISTS idx_exposure_assets_geom ON exposure_assets USING GIST (geom);
CREATE INDEX IF NOT EXISTS idx_alerts_geom ON alerts USING GIST (geom);
