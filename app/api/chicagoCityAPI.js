// chicagoCityAPI.js
// Node 18+ (global fetch); install: npm i proj4

import proj4 from "proj4";

/**
 * EPSG:3435 (NAD83 / Illinois East (ftUS)) proj4 string
 * Source: spatialreference.org/epsg/3435
 */
const EPSG_3435 =
  "+proj=tmerc +lat_0=36.6666666666667 +lon_0=-88.3333333333333 +k=0.999975 +x_0=300000 +y_0=0 +datum=NAD83 +units=us-ft +no_defs +type=crs";

/**
 * Endpoints
 */
const GEOCODER_BASE =
  "https://gisapps.chicago.gov/arcgis/rest/services/Chicago_Addresses/GeocodeServer";
const ZONING_MAPSERVER_BASE =
  "https://gisapps.chicago.gov/arcgis/rest/services/ExternalApps/Zoning/MapServer";

/**
 * Geocode a single-line address using the City's ArcGIS Locator.
 * Returns { lon, lat, score, address, wkid }
 *
 * We request outSR=4326 (WGS84) so we get standard lon/lat first.
 */
export async function geocodeAddress(address) {
  const params = new URLSearchParams({
    f: "json",
    singleLine: address,
    outFields: "*",
    outSR: "4326",
    maxLocations: "1",
  });

  const url = `${GEOCODER_BASE}/findAddressCandidates?${params.toString()}`;
  const resp = await fetch(url);
  if (!resp.ok) throw new Error(`Geocoder error: ${resp.status}`);
  const data = await resp.json();

  const top = data?.candidates?.[0];
  if (!top) throw new Error("No geocoding candidates found.");

  const { x: lon, y: lat } = top.location;
  return {
    lon,
    lat,
    score: top.score,
    address: top.address,
    wkid: 4326,
  };
}

/**
 * Project WGS84 lon/lat to EPSG:3435 (Illinois East feet).
 * Returns { x3435, y3435 }
 */
export function projectTo3435(lon, lat) {
  // proj4 takes (fromCRS, toCRS, [lon, lat]) and returns [x, y]
  const [x, y] = proj4(proj4.WGS84, EPSG_3435, [lon, lat]);
  return { x3435: x, y3435: y };
}

/**
 * Build a minimal mapExtent around a point, as required by ArcGIS Identify.
 * We use a small square buffer (default 500 feet).
 */
function makeExtentAroundPoint(x, y, bufferFeet = 500) {
  return {
    xmin: x - bufferFeet,
    ymin: y - bufferFeet,
    xmax: x + bufferFeet,
    ymax: y + bufferFeet,
    spatialReference: { wkid: 3435 },
  };
}

/**
 * Call ArcGIS MapServer /identify for one or more layers.
 * By default we hit ONLY layer 15 (Zoning).
 *
 * Returns the raw Identify JSON (an object with `results` array).
 */
export async function identifyAtPoint(x3435, y3435, { layers = [15] } = {}) {
  const geometry = {
    x: x3435,
    y: y3435,
    spatialReference: { wkid: 3435 },
  };

  const params = new URLSearchParams({
    f: "json",
    geometry: JSON.stringify(geometry),
    geometryType: "esriGeometryPoint",
    sr: "3435",
    tolerance: "2",
    returnGeometry: "false",
    mapExtent: JSON.stringify(makeExtentAroundPoint(x3435, y3435)),
    imageDisplay: "800,600,96", // width,height,dpi (any reasonable values work)
    layers: `ALL:${layers.join(",")}`, // restrict to specific layers
  });

  const url = `${ZONING_MAPSERVER_BASE}/identify?${params.toString()}`;
  const resp = await fetch(url);
  if (!resp.ok) throw new Error(`Identify error: ${resp.status}`);
  return resp.json();
}

/**
 * Extract ZONE_CLASS from Identify results (layerId 15).
 * Returns a string like "DX-16" or null if not found.
 */
export function extractZoneClass(identifyJson) {
  const zoningHit = identifyJson?.results?.find(
    (r) => Number(r.layerId) === 15
  );
  return zoningHit?.attributes?.ZONE_CLASS ?? null;
}

/**
 * High-level convenience:
 *   address -> geocode -> project -> identify (layer 15) -> ZONE_CLASS
 *
 * Returns:
 *   {
 *     addressMatched,
 *     lon, lat, x3435, y3435,
 *     zoneClass,
 *     identifyRaw
 *   }
 */
export async function getZoningByAddress(address) {
  // 1) Geocode to lon/lat
  const { lon, lat, address: addressMatched } = await geocodeAddress(address);

  // 2) Project to EPSG:3435
  const { x3435, y3435 } = projectTo3435(lon, lat);

  // 3) Identify at that point (layer 15 only)
  const identifyRaw = await identifyAtPoint(x3435, y3435, { layers: [15] });

  // 4) Parse ZONE_CLASS
  const zoneClass = extractZoneClass(identifyRaw);

  return {
    addressMatched,
    lon,
    lat,
    x3435,
    y3435,
    zoneClass,
    identifyRaw,
  };
}

// Example usage (uncomment to test):
// (async () => {
//   const result = await getZoningByAddress("36 S Wabash Ave, Chicago, IL 60603");
//   console.log(result.zoneClass, result);
// })();
