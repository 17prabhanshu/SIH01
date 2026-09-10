INSERT INTO susceptibility_zones (name, classification, geom, data_source) VALUES
('NH-44 Assam-Meghalaya Corridor', 'HIGH', ST_Buffer(ST_SetSRID(ST_MakeLine(ST_MakePoint(92.2, 25.1), ST_MakePoint(92.5, 24.8)), 4326), 0.01), 'GSI_PUBLISHED'),
('NH-6 Corridor (Meghalaya-Assam-Mizoram)', 'VERY_HIGH', ST_Buffer(ST_SetSRID(ST_MakeLine(ST_MakePoint(92.3, 25.0), ST_MakePoint(92.7, 24.5)), 4326), 0.01), 'NDMA_PUBLISHED'),
('Aizawl-Silchar Route', 'VERY_HIGH', ST_Buffer(ST_SetSRID(ST_MakeLine(ST_MakePoint(92.7, 23.7), ST_MakePoint(92.8, 24.8)), 4326), 0.01), 'GSI_PUBLISHED'),
('Darjeeling-Sikkim Corridor (NH-10)', 'VERY_HIGH', ST_Buffer(ST_SetSRID(ST_MakeLine(ST_MakePoint(88.4, 27.0), ST_MakePoint(88.6, 27.3)), 4326), 0.01), 'GSI_PUBLISHED'),
('Itanagar-Naharlagun Area', 'HIGH', ST_Buffer(ST_SetSRID(ST_MakePoint(93.65, 27.1), 4326), 0.05), 'NDMA_PUBLISHED'),
('Dima Hasao Rail Corridor', 'VERY_HIGH', ST_Buffer(ST_SetSRID(ST_MakeLine(ST_MakePoint(92.8, 25.2), ST_MakePoint(93.2, 25.5)), 4326), 0.01), 'GSI_PUBLISHED');

-- Insert known historical events into landslide_inventory
INSERT INTO landslide_inventory (event_date, location_name, geom, trigger_factor, data_source, severity) VALUES
('2022-05-15 10:00:00+05:30', 'Dima Hasao Haflong Landslide', ST_SetSRID(ST_MakePoint(93.02, 25.17), 4326), 'HEAVY_RAINFALL', 'GSI_PUBLISHED', 'SEVERE'),
('2023-10-04 01:00:00+05:30', 'South Lhonak Lake GLOF & Landslide', ST_SetSRID(ST_MakePoint(88.2, 27.9), 4326), 'GLOF_HEAVY_RAINFALL', 'NDMA_PUBLISHED', 'EXTREME'),
('2021-06-05 14:00:00+05:30', 'NH-6 Sonapur Tunnel Area', ST_SetSRID(ST_MakePoint(92.37, 25.12), 4326), 'HEAVY_RAINFALL', 'GSI_PUBLISHED', 'HIGH'),
('2020-07-09 08:30:00+05:30', 'Itanagar Sector 4', ST_SetSRID(ST_MakePoint(93.63, 27.10), 4326), 'HEAVY_RAINFALL', 'NDMA_PUBLISHED', 'MODERATE'),
('2022-06-30 00:30:00+05:30', 'Tupul Railway Station Landslide, Noney', ST_SetSRID(ST_MakePoint(93.61, 24.81), 4326), 'PROLONGED_RAINFALL', 'GSI_PUBLISHED', 'EXTREME');
