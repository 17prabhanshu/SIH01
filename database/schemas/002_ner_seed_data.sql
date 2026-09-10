-- Seed administrative boundaries (States and selected Districts)
INSERT INTO administrative_boundaries (name, level, geom, centroid) VALUES
-- STATES (Approximating geom with a buffer around centroid for seed purposes, actual polygons should be used in production)
('Arunachal Pradesh', 'STATE', ST_Buffer(ST_SetSRID(ST_MakePoint(93.6, 27.1), 4326), 1), ST_SetSRID(ST_MakePoint(93.6, 27.1), 4326)),
('Assam', 'STATE', ST_Buffer(ST_SetSRID(ST_MakePoint(92.9, 26.2), 4326), 1), ST_SetSRID(ST_MakePoint(92.9, 26.2), 4326)),
('Manipur', 'STATE', ST_Buffer(ST_SetSRID(ST_MakePoint(93.9, 24.8), 4326), 0.5), ST_SetSRID(ST_MakePoint(93.9, 24.8), 4326)),
('Meghalaya', 'STATE', ST_Buffer(ST_SetSRID(ST_MakePoint(91.4, 25.5), 4326), 0.5), ST_SetSRID(ST_MakePoint(91.4, 25.5), 4326)),
('Mizoram', 'STATE', ST_Buffer(ST_SetSRID(ST_MakePoint(92.8, 23.2), 4326), 0.5), ST_SetSRID(ST_MakePoint(92.8, 23.2), 4326)),
('Nagaland', 'STATE', ST_Buffer(ST_SetSRID(ST_MakePoint(94.6, 26.1), 4326), 0.5), ST_SetSRID(ST_MakePoint(94.6, 26.1), 4326)),
('Sikkim', 'STATE', ST_Buffer(ST_SetSRID(ST_MakePoint(88.5, 27.5), 4326), 0.3), ST_SetSRID(ST_MakePoint(88.5, 27.5), 4326)),
('Tripura', 'STATE', ST_Buffer(ST_SetSRID(ST_MakePoint(91.9, 23.9), 4326), 0.3), ST_SetSRID(ST_MakePoint(91.9, 23.9), 4326));

-- Insert some districts (getting parent IDs dynamically)
DO $$
DECLARE
    arunachal_id UUID;
    assam_id UUID;
    sikkim_id UUID;
    meghalaya_id UUID;
    mizoram_id UUID;
BEGIN
    SELECT id INTO arunachal_id FROM administrative_boundaries WHERE name = 'Arunachal Pradesh' AND level = 'STATE';
    SELECT id INTO assam_id FROM administrative_boundaries WHERE name = 'Assam' AND level = 'STATE';
    SELECT id INTO sikkim_id FROM administrative_boundaries WHERE name = 'Sikkim' AND level = 'STATE';
    SELECT id INTO meghalaya_id FROM administrative_boundaries WHERE name = 'Meghalaya' AND level = 'STATE';
    SELECT id INTO mizoram_id FROM administrative_boundaries WHERE name = 'Mizoram' AND level = 'STATE';

    INSERT INTO administrative_boundaries (name, level, parent_id, geom, centroid) VALUES
    ('Papum Pare', 'DISTRICT', arunachal_id, ST_Buffer(ST_SetSRID(ST_MakePoint(93.7, 27.1), 4326), 0.2), ST_SetSRID(ST_MakePoint(93.7, 27.1), 4326)),
    ('West Kameng', 'DISTRICT', arunachal_id, ST_Buffer(ST_SetSRID(ST_MakePoint(92.4, 27.2), 4326), 0.2), ST_SetSRID(ST_MakePoint(92.4, 27.2), 4326)),
    ('Tawang', 'DISTRICT', arunachal_id, ST_Buffer(ST_SetSRID(ST_MakePoint(91.9, 27.6), 4326), 0.1), ST_SetSRID(ST_MakePoint(91.9, 27.6), 4326)),
    
    ('Dima Hasao', 'DISTRICT', assam_id, ST_Buffer(ST_SetSRID(ST_MakePoint(93.0, 25.4), 4326), 0.2), ST_SetSRID(ST_MakePoint(93.0, 25.4), 4326)),
    ('Karbi Anglong', 'DISTRICT', assam_id, ST_Buffer(ST_SetSRID(ST_MakePoint(93.3, 26.0), 4326), 0.2), ST_SetSRID(ST_MakePoint(93.3, 26.0), 4326)),
    ('Cachar', 'DISTRICT', assam_id, ST_Buffer(ST_SetSRID(ST_MakePoint(92.9, 24.9), 4326), 0.2), ST_SetSRID(ST_MakePoint(92.9, 24.9), 4326)),

    ('North Sikkim', 'DISTRICT', sikkim_id, ST_Buffer(ST_SetSRID(ST_MakePoint(88.5, 27.7), 4326), 0.1), ST_SetSRID(ST_MakePoint(88.5, 27.7), 4326)),
    ('East Sikkim', 'DISTRICT', sikkim_id, ST_Buffer(ST_SetSRID(ST_MakePoint(88.6, 27.3), 4326), 0.1), ST_SetSRID(ST_MakePoint(88.6, 27.3), 4326)),

    ('East Khasi Hills', 'DISTRICT', meghalaya_id, ST_Buffer(ST_SetSRID(ST_MakePoint(91.8, 25.4), 4326), 0.1), ST_SetSRID(ST_MakePoint(91.8, 25.4), 4326)),
    
    ('Aizawl', 'DISTRICT', mizoram_id, ST_Buffer(ST_SetSRID(ST_MakePoint(92.7, 23.7), 4326), 0.1), ST_SetSRID(ST_MakePoint(92.7, 23.7), 4326));
END $$;
