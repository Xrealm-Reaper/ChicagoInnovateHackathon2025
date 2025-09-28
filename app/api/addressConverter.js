import proj4 from "proj4";

/*
File Workflow:
1. Input: human readable address - e.g. 36 S Wabash Ave
2. Geocodes input according to City of Chicago's Arc Geographic Information System (arcGIS) Geocoder System
-> Looks up address in the Chicago’s database, returns longitude/latitude according to (WGS84, EPSG:4326).
-> ranks based on match quality, returns best match
3. 
*/

/** EPSG:3435 (NAD83 / Illinois East (ftUS)) */
export const EPSG_3435 =
  "+proj=tmerc +lat_0=36.6666666666667 +lon_0=-88.3333333333333 +k=0.999975 +x_0=300000 +y_0=0 +datum=NAD83 +units=us-ft +no_defs +type=crs";

/** Chicago Address Locator endpoint */
const GEOCODER_BASE =
  "https://gisapps.chicago.gov/arcgis/rest/services/Chicago_Addresses/GeocodeServer";

/* ---------- Street-type helpers ---------- */

const STREET_TYPE_ALIASES = {
  ST: ["ST", "STREET"],
  PL: ["PL", "PLACE"],
  AVE: ["AVE", "AV", "AVENUE"],
  BLVD: ["BLVD", "BOULEVARD"],
  DR: ["DR", "DRIVE"],
  RD: ["RD", "ROAD"],
  CT: ["CT", "COURT"],
  TER: ["TER", "TERRACE"],
  LN: ["LN", "LANE"],
  PKWY: ["PKWY", "PKY", "PARKWAY"],
  HWY: ["HWY", "HIGHWAY"],
};

export function extractZip(address) {
  const m = address.match(/\b(\d{5})(?:-\d{4})?\b/);
  return m ? m[1] : null;
}

export function extractStreetTypeToken(address) {
  const tokens = address.toUpperCase().replace(/[.,]/g, "").split(/\s+/);
  if (!tokens.length) return null;
  const suffix = tokens[tokens.length - 1];
  for (const key of Object.keys(STREET_TYPE_ALIASES)) {
    if (STREET_TYPE_ALIASES[key].includes(suffix)) return key;
  }
  return null;
}

export function streetTypeMatches(requestedKey, candidateStType) {
  if (!requestedKey || !candidateStType) return false;
  const list = STREET_TYPE_ALIASES[requestedKey] || [requestedKey];
  return list.includes(String(candidateStType).toUpperCase());
}

/* ---------- Geocoding (ranked) ---------- */

/**
 * Geocode a single-line address using the City's ArcGIS Locator.
 * Returns { lon, lat, score, address, wkid, candidateMeta, allCandidates }
 *
 * Options:
 *   - maxLocations: how many candidates to consider (default 10)
 */
export async function geocodeAddress(address, { maxLocations = 10 } = {}) {
  const params = new URLSearchParams({
    f: "json",
    singleLine: address,
    outFields: "*", // includes Addr_type, StType, Postal, etc.
    outSR: "4326",
    maxLocations: String(maxLocations),
    category: "Address",
  });

  const url = `${GEOCODER_BASE}/findAddressCandidates?${params.toString()}`;
  const resp = await fetch(url);
  if (!resp.ok) throw new Error(`Geocoder error: ${resp.status}`);
  const data = await resp.json();

  const candidates = Array.isArray(data?.candidates) ? data.candidates : [];
  if (!candidates.length) throw new Error("No geocoding candidates found.");

  const wantZip = extractZip(address);
  const wantStTypeKey = extractStreetTypeToken(address);

  const ranked = candidates
    .map((c) => {
      const attrs = c.attributes || {};
      const addrType = String(attrs.Addr_type || "").toUpperCase();
      const stType = attrs.StType || attrs.STTYPE || null;
      const zip = attrs.Postal || attrs.ZIP || attrs.Zip || null;
      const baseScore = Number(c.score || 0);

      let bonus = 0;
      if (wantStTypeKey && streetTypeMatches(wantStTypeKey, stType)) bonus += 40;
      if (addrType === "POINTADDRESS") bonus += 20;
      else if (addrType === "STREETADDRESS") bonus += 10;
      if (wantZip && zip && String(zip).slice(0, 5) === wantZip) bonus += 10;

      return {
        cand: c,
        finalScore: baseScore + bonus,
        meta: { addrType, stType, zip, baseScore },
      };
    })
    .sort((a, b) => b.finalScore - a.finalScore);

  const top = ranked[0]?.cand;
  if (!top) throw new Error("No usable geocoding candidate.");

  const { x: lon, y: lat } = top.location;
  return {
    lon,
    lat,
    score: top.score,
    address: top.address,
    wkid: 4326,
    candidateMeta: ranked[0].meta,
    allCandidates: ranked,
  };
}

/* ---------- Projection ---------- */

export function projectTo3435(lon, lat) {
  const [x, y] = proj4(proj4.WGS84, EPSG_3435, [lon, lat]);
  return { x3435: x, y3435: y };
}
