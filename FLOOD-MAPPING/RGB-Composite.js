//CONFIRM DATES WHEN FLOODS WERE PREVALENT IN YOUR AREA OF STUDY
//IF SUGGESTED DATES WORK THEN YOURE GOOD.
var beforeStart = '2020-12-10';
var beforeEnd = '2020-12-14';
var afterStart = '2020-12-14';
var afterEnd = '2020-12-19';

var roi = ee.FeatureCollection("YOUR-AREA-IMPORT")
  .filter(ee.Filter.eq("shapeName","ENTER-PROVINCE-NAME"))
  .first()
  .geometry();
print(roi);
Map.addLayer(roi,{});
Map.addLayer(roi, {color: 'grey'}, 'Area Province')
var collection= ee.ImageCollection('COPERNICUS/S1_GRD')
  .filter(ee.Filter.eq('instrumentMode','IW'))
  .filter(ee.Filter.listContains('transmitterReceiverPolarisation', 'VH'))
  .filter(ee.Filter.listContains('transmitterReceiverPolarisation', 'VV'))
  .filter(ee.Filter.eq('orbitProperties_pass', 'DESCENDING')) 
  .filter(ee.Filter.eq('resolution_meters',10))
  .filter(ee.Filter.bounds(roi))
  .select(['VV', 'VH'])
  var beforeCollection = collection
  .filter(ee.Filter.date(beforeStart, beforeEnd));

var afterCollection = collection
  .filter(ee.Filter.date(afterStart, afterEnd));

var before = beforeCollection.mosaic().clip(roi);
var after = afterCollection.mosaic().clip(roi);

var visParams = { min: -30, max: 0 };
Map.centerObject(roi, 6);
Map.addLayer(before.select('VH'), visParams, 'Before Floods');
Map.addLayer(after.select('VH'), visParams, 'After Floods');

// Change Detection RGB Visualization
// Create an RGB composite with the following Band Combination: Before VH, After VH, Before VH
var rgbComposite = ee.Image.cat(before.select('VH'), after.select('VH'), before.select('VH'));

// Display the RGB composite with a min/max range of -25 to -8
Map.addLayer(rgbComposite, { bands: ['VH', 'VH_1', 'VH'], min: -25, max: -8 }, 'Change Detection RGB Composite');

// Create RGB composite image
var rgbComposite = ee.Image.cat(before.select('VH'), after.select('VH'), before.select('VV'));

// Display the image with a min/max range of -25 to -8
var visParams = {min: -25, max: -8};
Map.addLayer(rgbComposite, visParams, 'RGB Composite');

// Export the RGB composite image to Google Drive
Export.image.toDrive({
  image: rgbComposite,
  description: 'rgb_composite',
  folder: 'PATH-TO-DRIVE',
  scale: 5000,
  region: roi.geometry,
});
