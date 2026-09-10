import logging
from typing import List, Dict, Any, Optional
from dataclasses import dataclass
from sqlalchemy import text
from sqlalchemy.orm import Session
from sqlalchemy.engine import Engine

logger = logging.getLogger(__name__)

@dataclass
class ExposureResult:
    exposed_population: int
    critical_assets_count: int
    critical_assets_details: List[Dict[str, Any]]
    road_segments_at_risk: int
    estimated_connectivity_loss: int  # number of settlements that become disconnected
    connectivity_impact: float # 0.0 to 1.0 multiplier

class ExposureEngine:
    def __init__(self, db_engine: Engine):
        self.db_engine = db_engine

    def analyze_exposure(self, lat: float, lon: float, radius_meters: float) -> ExposureResult:
        """
        Analyze exposure at a given hazard point
        """
        try:
            with Session(self.db_engine) as session:
                # 1. Exposed Population (from settlements)
                pop_query = text("""
                    SELECT SUM(population) as total_pop
                    FROM settlements
                    WHERE ST_DWithin(
                        geom::geography,
                        ST_SetSRID(ST_MakePoint(:lon, :lat), 4326)::geography,
                        :radius
                    )
                """)
                pop_result = session.execute(pop_query, {"lon": lon, "lat": lat, "radius": radius_meters}).scalar()
                exposed_population = int(pop_result) if pop_result else 0

                # 2. Critical Assets
                assets_query = text("""
                    SELECT id, name, asset_type, ST_Distance(geom::geography, ST_SetSRID(ST_MakePoint(:lon, :lat), 4326)::geography) as dist
                    FROM critical_assets
                    WHERE ST_DWithin(
                        geom::geography,
                        ST_SetSRID(ST_MakePoint(:lon, :lat), 4326)::geography,
                        :radius
                    )
                """)
                assets_result = session.execute(assets_query, {"lon": lon, "lat": lat, "radius": radius_meters}).fetchall()
                critical_assets_count = len(assets_result)
                critical_assets_details = [
                    {"id": r[0], "name": r[1], "type": r[2], "distance_meters": float(r[3])} 
                    for r in assets_result
                ]

                # 3. Road Segments
                roads_query = text("""
                    SELECT id
                    FROM road_network
                    WHERE ST_DWithin(
                        geom::geography,
                        ST_SetSRID(ST_MakePoint(:lon, :lat), 4326)::geography,
                        :radius
                    )
                """)
                roads_result = session.execute(roads_query, {"lon": lon, "lat": lat, "radius": radius_meters}).fetchall()
                road_ids = [r[0] for r in roads_result]
                road_segments_at_risk = len(road_ids)

                # 4. Connectivity Loss
                # Simple graph connectivity analysis using PostGIS pgRouting or basic intersection
                estimated_connectivity_loss = 0
                connectivity_impact = 0.0
                
                if road_ids:
                    # Estimate connectivity impact
                    # How many settlements rely on these road segments as their primary connection?
                    # This is an approximation if pgRouting is not available
                    conn_query = text("""
                        SELECT count(s.id)
                        FROM settlements s
                        JOIN road_network r ON ST_DWithin(s.geom::geography, r.geom::geography, 1000)
                        WHERE r.id = ANY(:road_ids)
                    """)
                    conn_result = session.execute(conn_query, {"road_ids": road_ids}).scalar()
                    estimated_connectivity_loss = int(conn_result) if conn_result else 0
                    
                    # Cap connectivity impact multiplier between 0.0 and 1.0 (e.g. 0.1 per settlement)
                    connectivity_impact = min(1.0, estimated_connectivity_loss * 0.1)

                return ExposureResult(
                    exposed_population=exposed_population,
                    critical_assets_count=critical_assets_count,
                    critical_assets_details=critical_assets_details,
                    road_segments_at_risk=road_segments_at_risk,
                    estimated_connectivity_loss=estimated_connectivity_loss,
                    connectivity_impact=connectivity_impact
                )
        except Exception as e:
            logger.error(f"Error computing exposure for {lat},{lon}: {e}")
            # Graceful degradation
            return ExposureResult(
                exposed_population=0,
                critical_assets_count=0,
                critical_assets_details=[],
                road_segments_at_risk=0,
                estimated_connectivity_loss=0,
                connectivity_impact=0.0
            )
