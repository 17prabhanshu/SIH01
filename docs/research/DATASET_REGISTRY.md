# Dataset Registry

This registry tracks the datasets utilized and evaluated for the NER Landslide Early Warning platform.

| Dataset | Source | License | Format | Resolution | Coverage | Access | NER Relevance |
|---------|--------|---------|--------|------------|----------|--------|---------------|
| **Landslide4Sense** | IARAI / Univ of Tokyo | CC BY 4.0 | HDF5/GeoTIFF | 10m (128x128 patches) | 4 regions (India, Nepal, Taiwan, Japan) | Public | High (Kodagu and Gorkha subsets are great analogs) |
| **NASA GLC (Global Landslide Catalog)** | NASA | Public Domain | CSV/GeoJSON | Point data | Global | Public | Moderate (Historical context, underrepresented in NER) |
| **GSI NLSM (National Landslide Susceptibility Mapping)** | GSI (Govt of India) | Restricted Govt | WMS/WFS / Vector | 1:50,000 | India (All 8 NER states) | Restricted (Bhukosh credentials) | Extremely High (Ground truth and susceptibility base) |
| **IMD Gridded Rainfall** | IMD | Restricted Govt | NetCDF / API | 0.25 deg | India | Restricted API / CDSP Pune | High (Official ground truth rainfall) |
| **NASA IMERG** | NASA | Public Domain | NetCDF/HDF5 | 10km (0.1 deg) | Global | NASA Earthdata | High (Dynamic input for LHASA, underestimates orographic rain) |
| **NASA SMAP L4** | NASA | Public Domain | NetCDF/HDF5 | 9km | Global | NASA Earthdata | High (Dynamic input for LHASA) |
| **NISAR Products** | ISRO / NASA | Public Domain | SAR (L-band & S-band) | High | Global (12-day repeat) | Bhoonidhi / ASF | Revolutionary (L-band penetrates dense NER forest canopy) |
| **Sentinel-1** | ESA | Public Domain | SAR (C-band) | 10m | Global | Copernicus SciHub / GEE | Low-Moderate (Decorrelates in NER forests quickly) |
| **Sentinel-2** | ESA | Public Domain | Optical | 10m | Global | Copernicus SciHub / GEE | Moderate (Blind during monsoon, good for dry season) |
| **EOS-04** | ISRO | Govt (Free >5m) | SAR (C-band PolSAR) | 3-9m | India (On-demand) | Bhoonidhi | Moderate (On-demand only, C-band forest limitations) |
| **ALOS DEM / Copernicus DEM** | JAXA / ESA | Public Domain / CC BY | Raster | 30m / 30m | Global | Public / GEE | High (Elevation and slope derivation) |
