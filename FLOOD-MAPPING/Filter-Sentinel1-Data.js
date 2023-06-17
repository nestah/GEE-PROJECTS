// ENSURE TO IMPORT YOUR SENTINEL 1 DATASET
// HINT, SEARCH Sentinel-1 SAR GRD: C-band Synthetic Aperture Radar Ground Range Detected, ON THE GEE SEARCH BAR
//AND CLICK import TO IMPORT
//ENSURE TO USE ADM2 GEOBOUNDARY DATA. find here https://www.geoboundaries.org/index.html#getdata

var ROI = ee.FeatureCollection("IMPORT-TABLE-FROM-ASSETS")
  .filter(ee.Filter.eq("shapeName","ENTER-PROVINCE-NAME"))
  .first()
  .geometry();
print(ROI);
// Load the Sentinel-1 ImageCollection, filter to Jun-Sep 2020 observations.
var sentinel1 = ee.ImageCollection('COPERNICUS/S1_GRD')
                    .filterDate('2022-12-13', '2022-12-31');
// Filter the Sentinel-1 collection by metadata properties.
var vvVhIw = sentinel1
  // Filter to get images with VV and VH dual polarization.
  .filter(ee.Filter.listContains('transmitterReceiverPolarisation', 'VV'))
  .filter(ee.Filter.listContains('transmitterReceiverPolarisation', 'VH'))
  // Filter to get images collected in interferometric wide swath mode.
  .filter(ee.Filter.eq('instrumentMode', 'IW'));
// Separate ascending and descending orbit images into distinct collections.
var vvVhIwAsc = vvVhIw.filter(
  ee.Filter.eq('orbitProperties_pass', 'ASCENDING'));
var vvVhIwDesc = vvVhIw.filter(
  ee.Filter.eq('orbitProperties_pass', 'DESCENDING'));  

// Calculate temporal means for various observations to use for visualization.
// Mean VH ascending.
var vhIwAscMean = vvVhIwAsc.select('VH').mean().clip(ROI);
// Mean VH descending.
var vhIwDescMean = vvVhIwDesc.select('VH').mean().clip(ROI);
// Mean VV for combined ascending and descending image collections.
var vvIwAscDescMean = vvVhIwAsc.merge(vvVhIwDesc).select('VV').mean().clip(ROI);
// Mean VH for combined ascending and descending image collections.
var vhIwAscDescMean = vvVhIwAsc.merge(vvVhIwDesc).select('VH').mean().clip(ROI);

//Display the temporal means for various observations, compare them.
Map.addLayer(vvIwAscDescMean, {min: -12, max: -4}, 'vvIwAscDescMean');
Map.addLayer(vhIwAscDescMean, {min: -18, max: -10}, 'vhIwAscDescMean');
Map.addLayer(vhIwAscMean, {min: -18, max: -10}, 'vhIwAscMean');
Map.addLayer(vhIwDescMean, {min: -18, max: -10}, 'vhIwDescMean');
Map.centerObject(ROI)
//Convert the single band images to RGB visualization.
var vvVhIwAscDescMeanRGB = vvIwAscDescMean.addBands(vhIwAscDescMean).addBands(vhIwAscMean);
var clippedImage = vvVhIwAscDescMeanRGB.clip(ROI);

// Define visualization parameters for RGB image.
var visParamsRGB = { bands: ['VV', 'VH', 'VH'], min: -18, max: -4 };

Map.addLayer(clippedImage, visParamsRGB, 'RGB Image');
  
                    