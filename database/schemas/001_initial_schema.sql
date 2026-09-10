-- Enable extensions
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS postgis_raster;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Enum types
CREATE TYPE user_role AS ENUM ('ADMIN', 'SCIENTIST', 'ANALYST', 'FIELD_OFFICER', 'PUBLIC');
CREATE TYPE alert_severity AS ENUM ('LOW', 'MODERATE', 'HIGH', 'SEVERE', 'EXTREME');
CREATE TYPE alert_status AS ENUM ('ACTIVE', 'RESOLVED', 'CANCELLED', 'EXPIRED');
CREATE TYPE sensor_type AS ENUM ('TILT_METER', 'PIEZOMETER', 'SOIL_MOISTURE', 'RAIN_GAUGE', 'GPS', 'EXTENSOMETER');
CREATE TYPE report_category AS ENUM ('CRACK', 'SLIPPAGE', 'WATER_SEEPAGE', 'ROCKFALL', 'TREE_TILT', 'OTHER');
CREATE TYPE model_status AS ENUM ('EXPERIMENTAL', 'STAGING', 'PRODUCTION', 'DEPRECATED');

-- Users
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role user_role NOT NULL DEFAULT 'PUBLIC',
    organization VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Administrative Boundaries
CREATE TABLE administrative_boundaries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    level VARCHAR(50) NOT NULL, -- 'STATE', 'DISTRICT', 'SUB_DISTRICT', 'VILLAGE'
    parent_id UUID REFERENCES administrative_boundaries(id) ON DELETE CASCADE,
    geom GEOMETRY(MultiPolygon, 4326) NOT NULL,
    centroid GEOMETRY(Point, 4326) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Landslide Inventory
CREATE TABLE landslide_inventory (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_date TIMESTAMP WITH TIME ZONE,
    location_name VARCHAR(255) NOT NULL,
    geom GEOMETRY(Geometry, 4326) NOT NULL,
    trigger_factor VARCHAR(100),
    volume_m3 NUMERIC,
    fatalities INTEGER,
    data_source VARCHAR(100) NOT NULL,
    severity VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Susceptibility Zones
CREATE TABLE susceptibility_zones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    classification VARCHAR(50) NOT NULL, -- 'LOW', 'MODERATE', 'HIGH', 'VERY_HIGH'
    geom GEOMETRY(MultiPolygon, 4326) NOT NULL,
    model_version VARCHAR(50),
    data_source VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Sensors
CREATE TABLE sensors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sensor_id VARCHAR(100) UNIQUE NOT NULL,
    type sensor_type NOT NULL,
    installation_date TIMESTAMP WITH TIME ZONE,
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE', -- 'ACTIVE', 'INACTIVE', 'MAINTENANCE', 'OFFLINE'
    location GEOMETRY(Point, 4326) NOT NULL,
    depth_m NUMERIC,
    manufacturer VARCHAR(255),
    model_number VARCHAR(100),
    calibration_date TIMESTAMP WITH TIME ZONE,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Sensor Observations (Partitioned)
CREATE TABLE sensor_observations (
    id UUID DEFAULT uuid_generate_v4(),
    sensor_id UUID REFERENCES sensors(id) ON DELETE CASCADE,
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    value NUMERIC NOT NULL,
    unit VARCHAR(50) NOT NULL,
    quality_flag VARCHAR(50) DEFAULT 'GOOD',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id, timestamp)
) PARTITION BY RANGE (timestamp);

-- Satellite Products
CREATE TABLE satellite_products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_name VARCHAR(255) NOT NULL,
    satellite VARCHAR(100) NOT NULL,
    sensor VARCHAR(100) NOT NULL,
    acquisition_date TIMESTAMP WITH TIME ZONE NOT NULL,
    resolution_m NUMERIC,
    cloud_cover_percent NUMERIC,
    bounding_box GEOMETRY(Polygon, 4326) NOT NULL,
    s3_uri VARCHAR(1024) NOT NULL,
    processing_level VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Model Registry
CREATE TABLE model_registry (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    version VARCHAR(50) NOT NULL,
    description TEXT,
    algorithm VARCHAR(100),
    status model_status NOT NULL DEFAULT 'EXPERIMENTAL',
    metrics JSONB,
    hyperparameters JSONB,
    artifact_uri VARCHAR(1024),
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (name, version)
);

-- Model Runs
CREATE TABLE model_runs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    model_id UUID REFERENCES model_registry(id) ON DELETE CASCADE,
    run_start TIMESTAMP WITH TIME ZONE NOT NULL,
    run_end TIMESTAMP WITH TIME ZONE,
    status VARCHAR(50) NOT NULL, -- 'RUNNING', 'SUCCESS', 'FAILED'
    configuration JSONB,
    logs TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Model Predictions (Partitioned)
CREATE TABLE model_predictions (
    id UUID DEFAULT uuid_generate_v4(),
    run_id UUID REFERENCES model_runs(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    geom GEOMETRY(Geometry, 4326) NOT NULL,
    probability NUMERIC NOT NULL CHECK (probability >= 0 AND probability <= 1),
    severity alert_severity NOT NULL,
    prediction_timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    PRIMARY KEY (id, created_at)
) PARTITION BY RANGE (created_at);

-- Rainfall Observations (Partitioned)
CREATE TABLE rainfall_observations (
    id UUID DEFAULT uuid_generate_v4(),
    station_name VARCHAR(255) NOT NULL,
    station_id VARCHAR(100),
    location GEOMETRY(Point, 4326) NOT NULL,
    observation_time TIMESTAMP WITH TIME ZONE NOT NULL,
    rainfall_mm NUMERIC NOT NULL CHECK (rainfall_mm >= 0),
    data_source VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id, observation_time)
) PARTITION BY RANGE (observation_time);

-- Alerts
CREATE TABLE alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    severity alert_severity NOT NULL,
    status alert_status NOT NULL DEFAULT 'ACTIVE',
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    affected_area GEOMETRY(Geometry, 4326) NOT NULL,
    issued_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE,
    model_run_id UUID REFERENCES model_runs(id) ON DELETE SET NULL,
    source_type VARCHAR(100) NOT NULL, -- 'MODEL', 'MANUAL', 'SENSOR_THRESHOLD'
    issued_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Alert Audit Log
CREATE TABLE alert_audit_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    alert_id UUID REFERENCES alerts(id) ON DELETE CASCADE,
    action VARCHAR(100) NOT NULL, -- 'CREATED', 'UPDATED', 'STATUS_CHANGED', 'SEVERITY_CHANGED'
    actor_id UUID REFERENCES users(id) ON DELETE SET NULL,
    previous_state JSONB,
    new_state JSONB,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Exposure Assets
CREATE TABLE exposure_assets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    asset_type VARCHAR(100) NOT NULL, -- 'ROAD', 'BRIDGE', 'SCHOOL', 'HOSPITAL', 'SETTLEMENT', 'POWER_STATION'
    name VARCHAR(255),
    geom GEOMETRY(Geometry, 4326) NOT NULL,
    vulnerability_score NUMERIC,
    population_affected INTEGER,
    criticality VARCHAR(50), -- 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Citizen Reports
CREATE TABLE citizen_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reporter_id UUID REFERENCES users(id) ON DELETE SET NULL,
    category report_category NOT NULL,
    description TEXT,
    location GEOMETRY(Point, 4326) NOT NULL,
    observation_time TIMESTAMP WITH TIME ZONE NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING_VERIFICATION', -- 'PENDING_VERIFICATION', 'VERIFIED', 'REJECTED'
    verified_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Report Media
CREATE TABLE report_media (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    report_id UUID REFERENCES citizen_reports(id) ON DELETE CASCADE,
    media_type VARCHAR(50) NOT NULL, -- 'IMAGE', 'VIDEO', 'AUDIO'
    s3_uri VARCHAR(1024) NOT NULL,
    mime_type VARCHAR(100),
    file_size_bytes BIGINT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- User Sessions
CREATE TABLE user_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Data Provenance
CREATE TABLE data_provenance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    entity_type VARCHAR(100) NOT NULL,
    entity_id UUID NOT NULL,
    source_system VARCHAR(100) NOT NULL,
    ingestion_time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    processing_steps JSONB,
    original_checksum VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- System Health Log
CREATE TABLE system_health_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    component VARCHAR(100) NOT NULL,
    status VARCHAR(50) NOT NULL, -- 'HEALTHY', 'DEGRADED', 'DOWN'
    latency_ms NUMERIC,
    message TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create Partitions
-- sensor_observations partitions (2024-2026)
CREATE TABLE sensor_observations_2024_01 PARTITION OF sensor_observations FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');
CREATE TABLE sensor_observations_2024_02 PARTITION OF sensor_observations FOR VALUES FROM ('2024-02-01') TO ('2024-03-01');
CREATE TABLE sensor_observations_2024_03 PARTITION OF sensor_observations FOR VALUES FROM ('2024-03-01') TO ('2024-04-01');
CREATE TABLE sensor_observations_2024_04 PARTITION OF sensor_observations FOR VALUES FROM ('2024-04-01') TO ('2024-05-01');
CREATE TABLE sensor_observations_2024_05 PARTITION OF sensor_observations FOR VALUES FROM ('2024-05-01') TO ('2024-06-01');
CREATE TABLE sensor_observations_2024_06 PARTITION OF sensor_observations FOR VALUES FROM ('2024-06-01') TO ('2024-07-01');
CREATE TABLE sensor_observations_2024_07 PARTITION OF sensor_observations FOR VALUES FROM ('2024-07-01') TO ('2024-08-01');
CREATE TABLE sensor_observations_2024_08 PARTITION OF sensor_observations FOR VALUES FROM ('2024-08-01') TO ('2024-09-01');
CREATE TABLE sensor_observations_2024_09 PARTITION OF sensor_observations FOR VALUES FROM ('2024-09-01') TO ('2024-10-01');
CREATE TABLE sensor_observations_2024_10 PARTITION OF sensor_observations FOR VALUES FROM ('2024-10-01') TO ('2024-11-01');
CREATE TABLE sensor_observations_2024_11 PARTITION OF sensor_observations FOR VALUES FROM ('2024-11-01') TO ('2024-12-01');
CREATE TABLE sensor_observations_2024_12 PARTITION OF sensor_observations FOR VALUES FROM ('2024-12-01') TO ('2025-01-01');

CREATE TABLE sensor_observations_2025_01 PARTITION OF sensor_observations FOR VALUES FROM ('2025-01-01') TO ('2025-02-01');
CREATE TABLE sensor_observations_2025_02 PARTITION OF sensor_observations FOR VALUES FROM ('2025-02-01') TO ('2025-03-01');
CREATE TABLE sensor_observations_2025_03 PARTITION OF sensor_observations FOR VALUES FROM ('2025-03-01') TO ('2025-04-01');
CREATE TABLE sensor_observations_2025_04 PARTITION OF sensor_observations FOR VALUES FROM ('2025-04-01') TO ('2025-05-01');
CREATE TABLE sensor_observations_2025_05 PARTITION OF sensor_observations FOR VALUES FROM ('2025-05-01') TO ('2025-06-01');
CREATE TABLE sensor_observations_2025_06 PARTITION OF sensor_observations FOR VALUES FROM ('2025-06-01') TO ('2025-07-01');
CREATE TABLE sensor_observations_2025_07 PARTITION OF sensor_observations FOR VALUES FROM ('2025-07-01') TO ('2025-08-01');
CREATE TABLE sensor_observations_2025_08 PARTITION OF sensor_observations FOR VALUES FROM ('2025-08-01') TO ('2025-09-01');
CREATE TABLE sensor_observations_2025_09 PARTITION OF sensor_observations FOR VALUES FROM ('2025-09-01') TO ('2025-10-01');
CREATE TABLE sensor_observations_2025_10 PARTITION OF sensor_observations FOR VALUES FROM ('2025-10-01') TO ('2025-11-01');
CREATE TABLE sensor_observations_2025_11 PARTITION OF sensor_observations FOR VALUES FROM ('2025-11-01') TO ('2025-12-01');
CREATE TABLE sensor_observations_2025_12 PARTITION OF sensor_observations FOR VALUES FROM ('2025-12-01') TO ('2026-01-01');

CREATE TABLE sensor_observations_2026_01 PARTITION OF sensor_observations FOR VALUES FROM ('2026-01-01') TO ('2026-02-01');
CREATE TABLE sensor_observations_2026_02 PARTITION OF sensor_observations FOR VALUES FROM ('2026-02-01') TO ('2026-03-01');
CREATE TABLE sensor_observations_2026_03 PARTITION OF sensor_observations FOR VALUES FROM ('2026-03-01') TO ('2026-04-01');
CREATE TABLE sensor_observations_2026_04 PARTITION OF sensor_observations FOR VALUES FROM ('2026-04-01') TO ('2026-05-01');
CREATE TABLE sensor_observations_2026_05 PARTITION OF sensor_observations FOR VALUES FROM ('2026-05-01') TO ('2026-06-01');
CREATE TABLE sensor_observations_2026_06 PARTITION OF sensor_observations FOR VALUES FROM ('2026-06-01') TO ('2026-07-01');
CREATE TABLE sensor_observations_2026_07 PARTITION OF sensor_observations FOR VALUES FROM ('2026-07-01') TO ('2026-08-01');
CREATE TABLE sensor_observations_2026_08 PARTITION OF sensor_observations FOR VALUES FROM ('2026-08-01') TO ('2026-09-01');
CREATE TABLE sensor_observations_2026_09 PARTITION OF sensor_observations FOR VALUES FROM ('2026-09-01') TO ('2026-10-01');
CREATE TABLE sensor_observations_2026_10 PARTITION OF sensor_observations FOR VALUES FROM ('2026-10-01') TO ('2026-11-01');
CREATE TABLE sensor_observations_2026_11 PARTITION OF sensor_observations FOR VALUES FROM ('2026-11-01') TO ('2026-12-01');
CREATE TABLE sensor_observations_2026_12 PARTITION OF sensor_observations FOR VALUES FROM ('2026-12-01') TO ('2027-01-01');

-- rainfall_observations partitions (2024-2026)
CREATE TABLE rainfall_observations_2024 PARTITION OF rainfall_observations FOR VALUES FROM ('2024-01-01') TO ('2025-01-01');
CREATE TABLE rainfall_observations_2025 PARTITION OF rainfall_observations FOR VALUES FROM ('2025-01-01') TO ('2026-01-01');
CREATE TABLE rainfall_observations_2026 PARTITION OF rainfall_observations FOR VALUES FROM ('2026-01-01') TO ('2027-01-01');

-- model_predictions partitions (2024-2026)
CREATE TABLE model_predictions_2024 PARTITION OF model_predictions FOR VALUES FROM ('2024-01-01') TO ('2025-01-01');
CREATE TABLE model_predictions_2025 PARTITION OF model_predictions FOR VALUES FROM ('2025-01-01') TO ('2026-01-01');
CREATE TABLE model_predictions_2026 PARTITION OF model_predictions FOR VALUES FROM ('2026-01-01') TO ('2027-01-01');


-- Indexes
CREATE INDEX idx_admin_geom ON administrative_boundaries USING GIST(geom);
CREATE INDEX idx_admin_centroid ON administrative_boundaries USING GIST(centroid);
CREATE INDEX idx_landslide_inv_geom ON landslide_inventory USING GIST(geom);
CREATE INDEX idx_susc_zones_geom ON susceptibility_zones USING GIST(geom);
CREATE INDEX idx_sensors_loc ON sensors USING GIST(location);
CREATE INDEX idx_sat_prod_bbox ON satellite_products USING GIST(bounding_box);
CREATE INDEX idx_model_pred_geom ON model_predictions USING GIST(geom);
CREATE INDEX idx_rainfall_obs_loc ON rainfall_observations USING GIST(location);
CREATE INDEX idx_alerts_area ON alerts USING GIST(affected_area);
CREATE INDEX idx_exposure_geom ON exposure_assets USING GIST(geom);
CREATE INDEX idx_citizen_reports_loc ON citizen_reports USING GIST(location);

CREATE INDEX idx_sensor_obs_ts ON sensor_observations USING BRIN(timestamp);
CREATE INDEX idx_rainfall_obs_ts ON rainfall_observations USING BRIN(observation_time);
CREATE INDEX idx_model_pred_ts ON model_predictions USING BRIN(created_at);

CREATE INDEX idx_admin_level ON administrative_boundaries(level);
CREATE INDEX idx_sensors_status ON sensors(status);
CREATE INDEX idx_alerts_status ON alerts(status);
CREATE INDEX idx_alerts_severity ON alerts(severity);
CREATE INDEX idx_model_reg_status ON model_registry(status);
