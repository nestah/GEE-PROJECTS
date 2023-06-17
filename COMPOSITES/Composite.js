
// ENSURE TO IMPORT VARIBLES OF YOUR TABLE AND DATASETS ABOVE BEFORE roi
// THIS CODE USES JAVASCRIPT EARTH ENGINE FUNCTIONS AND CAN ONLY WORK IN THE GEE EDITOR!
var roi = ee.FeatureCollection('YOUR-TABLE-HERE');

var startDate = ee.Date('2000-01-01');
var endDate = ee.Date('2020-12-31');

// MOD11A1-LST: MODIS/Aqua Land Surface Temperature/Emissivity 8-Day L3 Global 1km
var lstCollection = ee.ImageCollection('MODIS/006/MOD11A1')
  .filterBounds(roi)
  .filterDate(startDate, endDate);

// MOD09GA-Surface Reflectance Daily L2G Global 1km
var reflectanceCollection = ee.ImageCollection('MODIS/061/MOD09GA')
  .filterBounds(roi)
  .filterDate(startDate, endDate);

// CHIRPS: Climate Hazards Group InfraRed Precipitation with Station Data Monthly 0.05°
var precipCollection = ee.ImageCollection('UCSB-CHG/CHIRPS/PENTAD')
  .filterBounds(roi)
  .filterDate(startDate, endDate)
  .map(function(image) {
    var precip = image.select('precipitation');
    return precip.multiply(0.1).set('system:time_start', image.get('system:time_start'));
  });

// Function to calculate monthly composite for each dataset
var compositeMonthly = function(year, month) {
  var startMonth = ee.Date.fromYMD(year, month, 1);
  var endMonth = startMonth.advance(1, 'month');

  var lstImages = lstCollection.filterDate(startMonth, endMonth);
  var reflectanceImages = reflectanceCollection.filterDate(startMonth, endMonth);
  var precipImage = precipCollection.filterDate(startMonth, endMonth).sum();

  var lstComposite = lstImages.median();
  var reflectanceComposite = reflectanceImages.median();

  return lstComposite.addBands(reflectanceComposite).addBands(precipImage)
    .set('system:time_start', startMonth.millis());
};

// Create monthly composites for each month between 2000 and 2020
for (var year = 2000; year <= 2020; year++) {
  for (var month = 1; month <= 12; month++) {
    var composite = compositeMonthly(year, month);
     var compositeName = 'Composite_' + year + '_' + month;
    // Clip composite to ROI
    var compositeClipped = composite.clip(roi);
    // Add composite as a layer for visualization
    Map.addLayer(compositeClipped, {}, compositeName);

    // Export composite monthly images to Google Drive
    Export.image.toDrive({
      image: compositeClipped,
      description: compositeName,
      folder: 'PATH-TO-DRIVE',
      scale: 1000,
      region: roi.geometry()
    });
  }
}
