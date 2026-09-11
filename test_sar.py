from services.geospatial.gee.sentinel1 import Sentinel1Adapter

adapter = Sentinel1Adapter()
result = adapter.get_sar_change_metric(
    lat=27.3314, 
    lon=88.6138, 
    pre_start='2023-09-15', 
    pre_end='2023-10-04', 
    post_start='2023-10-04', 
    post_end='2023-10-15'
)
import json
print(json.dumps(result, indent=2))
