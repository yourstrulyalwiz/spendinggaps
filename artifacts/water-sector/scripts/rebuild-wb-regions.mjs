/**
 * Rebuilds wb-regions.geojson from the 2025 World Bank country classification.
 * Uses world-atlas 110m topojson + topojson-client merge() to dissolve borders.
 *
 * Non-HIC country lists derived from CLASS_2025_10_07.xlsx
 */

import { createRequire } from "module";
import { fileURLToPath } from "url";
import { writeFileSync } from "fs";
import { resolve, dirname } from "path";

const require = createRequire(import.meta.url);
const topojson = require("../node_modules/topojson-client/dist/topojson-client.js");

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = resolve(__dirname, "../public/wb-regions.geojson");

// ── New WB classification: ISO3 → region ID ──────────────────────────────────
// Source: CLASS_2025_10_07.xlsx, non-HIC countries only
const ISO3_TO_REGION = {
  // Sub-Saharan Africa (SSA) — 47 non-HIC
  AGO:"SSA",BEN:"SSA",BWA:"SSA",BFA:"SSA",BDI:"SSA",CPV:"SSA",CMR:"SSA",
  CAF:"SSA",TCD:"SSA",COM:"SSA",COD:"SSA",COG:"SSA",CIV:"SSA",GNQ:"SSA",
  ERI:"SSA",SWZ:"SSA",ETH:"SSA",GAB:"SSA",GMB:"SSA",GHA:"SSA",GIN:"SSA",
  GNB:"SSA",KEN:"SSA",LSO:"SSA",LBR:"SSA",MDG:"SSA",MWI:"SSA",MLI:"SSA",
  MRT:"SSA",MUS:"SSA",MOZ:"SSA",NAM:"SSA",NER:"SSA",NGA:"SSA",RWA:"SSA",
  STP:"SSA",SEN:"SSA",SLE:"SSA",SOM:"SSA",ZAF:"SSA",SSD:"SSA",SDN:"SSA",
  TZA:"SSA",TGO:"SSA",UGA:"SSA",ZMB:"SSA",ZWE:"SSA",

  // South Asia (SA) — 6 non-HIC (AFG + PAK move to MENA)
  BGD:"SA",BTN:"SA",IND:"SA",MDV:"SA",NPL:"SA",LKA:"SA",

  // Latin America & Caribbean (LAC) — 23 non-HIC
  ARG:"LAC",BLZ:"LAC",BOL:"LAC",BRA:"LAC",COL:"LAC",CUB:"LAC",DMA:"LAC",
  DOM:"LAC",ECU:"LAC",SLV:"LAC",GRD:"LAC",GTM:"LAC",HTI:"LAC",HND:"LAC",
  JAM:"LAC",MEX:"LAC",NIC:"LAC",PRY:"LAC",PER:"LAC",LCA:"LAC",VCT:"LAC",
  SUR:"LAC",VEN:"LAC",

  // Middle East, North Africa, Afghanistan & Pakistan (MENA) — 15 non-HIC
  AFG:"MENA",DZA:"MENA",DJI:"MENA",EGY:"MENA",IRN:"MENA",IRQ:"MENA",
  JOR:"MENA",LBN:"MENA",LBY:"MENA",MAR:"MENA",PAK:"MENA",SYR:"MENA",
  TUN:"MENA",PSE:"MENA",YEM:"MENA",

  // Europe & Central Asia (ECA) — 18 non-HIC (Kosovo XKX not in Natural Earth 110m)
  ALB:"ECA",ARM:"ECA",AZE:"ECA",BLR:"ECA",BIH:"ECA",GEO:"ECA",KAZ:"ECA",
  KGZ:"ECA",MDA:"ECA",MNE:"ECA",MKD:"ECA",SRB:"ECA",TJK:"ECA",TUR:"ECA",
  TKM:"ECA",UKR:"ECA",UZB:"ECA",

  // East Asia & Pacific (EAP) — 22 non-HIC
  KHM:"EAP",CHN:"EAP",FJI:"EAP",IDN:"EAP",KIR:"EAP",PRK:"EAP",LAO:"EAP",
  MYS:"EAP",MHL:"EAP",FSM:"EAP",MNG:"EAP",MMR:"EAP",PNG:"EAP",PHL:"EAP",
  WSM:"EAP",SLB:"EAP",THA:"EAP",TLS:"EAP",TON:"EAP",TUV:"EAP",VUT:"EAP",
  VNM:"EAP",
};

// ISO numeric → ISO3 mapping (all countries that appear in world-atlas 110m)
// Derived from ISO 3166-1 for every country we need
const NUMERIC_TO_ISO3 = {
  4:"AFG",8:"ALB",12:"DZA",24:"AGO",31:"AZE",50:"BGD",51:"ARM",64:"BTN",
  68:"BOL",70:"BIH",72:"BWA",76:"BRA",84:"BLZ",90:"SLB",104:"MMR",108:"BDI",
  112:"BLR",116:"KHM",120:"CMR",132:"CPV",136:"CYM",140:"CAF",144:"LKA",
  148:"TCD",156:"CHN",170:"COL",174:"COM",178:"COG",180:"COD",192:"CUB",
  204:"BEN",212:"DMA",214:"DOM",218:"ECU",222:"SLV",226:"GNQ",231:"ETH",
  232:"ERI",242:"FJI",262:"DJI",266:"GAB",268:"GEO",270:"GMB",275:"PSE",
  288:"GHA",296:"KIR",308:"GRD",320:"GTM",324:"GIN",328:"GUY",332:"HTI",
  340:"HND",356:"IND",360:"IDN",364:"IRN",368:"IRQ",388:"JAM",398:"KAZ",
  400:"JOR",404:"KEN",408:"PRK",417:"KGZ",418:"LAO",422:"LBN",426:"LSO",
  430:"LBR",434:"LBY",450:"MDG",454:"MWI",458:"MYS",462:"MDV",466:"MLI",
  478:"MRT",480:"MUS",484:"MEX",496:"MNG",498:"MDA",499:"MNE",504:"MAR",
  508:"MOZ",516:"NAM",524:"NPL",528:"NLD",548:"VUT",558:"NIC",562:"NER",
  566:"NGA",583:"FSM",584:"MHL",586:"PAK",598:"PNG",600:"PRY",604:"PER",
  608:"PHL",624:"GNB",626:"TLS",646:"RWA",662:"LCA",670:"VCT",678:"STP",
  686:"SEN",688:"SRB",694:"SLE",704:"VNM",706:"SOM",710:"ZAF",716:"ZWE",
  724:"ESP",728:"SSD",729:"SDN",740:"SUR",748:"SWZ",760:"SYR",762:"TJK",
  764:"THA",768:"TGO",776:"TON",788:"TUN",792:"TUR",795:"TKM",798:"TUV",
  800:"UGA",804:"UKR",807:"MKD",818:"EGY",826:"GBR",834:"TZA",854:"BFA",
  858:"URY",860:"UZB",862:"VEN",882:"WSM",887:"YEM",894:"ZMB",
};

console.log("Fetching world-atlas countries-110m.json …");
const res = await fetch(
  "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json"
);
const topology = await res.json();
console.log("Fetched. Objects:", Object.keys(topology.objects));

// All country geometry objects from the topology
const countryObjs = topology.objects.countries.geometries;
console.log(`Total country geometries: ${countryObjs.length}`);

// Group geometry objects by region
const byRegion = {};
let matched = 0, unmatched = [];

for (const geom of countryObjs) {
  const numId = parseInt(geom.id, 10);
  const iso3 = NUMERIC_TO_ISO3[numId];
  const region = iso3 ? ISO3_TO_REGION[iso3] : undefined;
  if (region) {
    if (!byRegion[region]) byRegion[region] = [];
    byRegion[region].push(geom);
    matched++;
  } else if (iso3 && !["USA","CAN","MEX","AUS","JPN","DEU","FRA","GBR","ITA","ESP","KOR","NLD","CHE","BEL","SWE","NOR","DNK","AUT","FIN","IRL","PRT","GRC","CZE","POL","HUN","ROU","BGR","SVK","SVN","EST","LVA","LTU","HRV","LUX","ISL","LIE","SMR","MCO","AND","MDV","SYC","SGP","HKG","MAC","TWN"].includes(iso3)) {
    // Not matched and not an obvious HIC we're ignoring
    if (iso3) unmatched.push(`${numId}/${iso3}`);
  }
}

console.log(`Matched: ${matched} country geometries`);
console.log(`Unmatched non-obvious: ${unmatched.join(", ")}`);
Object.entries(byRegion).forEach(([r, gs]) =>
  console.log(`  ${r}: ${gs.length} geometries`)
);

// Dissolve each region using topojson.merge()
const features = Object.entries(byRegion).map(([regionId, geoms]) => {
  const merged = topojson.merge(topology, geoms);
  return {
    type: "Feature",
    properties: { region: regionId },
    geometry: merged,
  };
});

const geojson = { type: "FeatureCollection", features };
writeFileSync(OUT, JSON.stringify(geojson));
console.log(`\nWrote ${OUT} (${features.length} region features)`);
