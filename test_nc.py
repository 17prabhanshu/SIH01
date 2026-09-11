import urllib.request
import os

url = "https://data.gesdisc.earthdata.nasa.gov/data/Landslide/Global_Landslide_Nowcast.2.0.0/2021/Global_Landslide_Nowcast_v2.0.0_20210209.nc4"
filepath = "Global_Landslide_Nowcast_v2.0.0_20210209.nc4"

print("Downloading LHASA nc4...")
urllib.request.urlretrieve(url, filepath)
print("Download complete.")

try:
    import netCDF4 as nc
    ds = nc.Dataset(filepath)
    print("Variables:")
    for var in ds.variables:
        print(f"  {var}")
    
    if 'nowcast' in ds.variables:
        print(f"Nowcast shape: {ds.variables['nowcast'].shape}")
    
    ds.close()
except ImportError:
    print("netCDF4 not installed.")
