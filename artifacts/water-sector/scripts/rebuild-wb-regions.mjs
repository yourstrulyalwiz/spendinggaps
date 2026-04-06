/**
 * Rebuilds wb-regions.geojson using ALL countries in the 2025 WB classification.
 * No income-group filtering — every country in the file is included.
 * North America (CAN/USA/BMU) is excluded as it has no spending-gap region.
 */

import { createRequire } from "module";
import { fileURLToPath } from "url";
import { writeFileSync } from "fs";
import { resolve, dirname } from "path";

const require = createRequire(import.meta.url);
const topojson = require("../node_modules/topojson-client/dist/topojson-client.js");

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = resolve(__dirname, "../public/wb-regions.geojson");

// ── ISO3 → region (all countries from CLASS_2025_10_07.xlsx, no income filter) ──
const ISO3_TO_REGION = {
  // Sub-Saharan Africa (48)
  AGO:"SSA",BEN:"SSA",BWA:"SSA",BFA:"SSA",BDI:"SSA",CPV:"SSA",CMR:"SSA",
  CAF:"SSA",TCD:"SSA",COM:"SSA",COD:"SSA",COG:"SSA",CIV:"SSA",GNQ:"SSA",
  ERI:"SSA",SWZ:"SSA",ETH:"SSA",GAB:"SSA",GMB:"SSA",GHA:"SSA",GIN:"SSA",
  GNB:"SSA",KEN:"SSA",LSO:"SSA",LBR:"SSA",MDG:"SSA",MWI:"SSA",MLI:"SSA",
  MRT:"SSA",MUS:"SSA",MOZ:"SSA",NAM:"SSA",NER:"SSA",NGA:"SSA",RWA:"SSA",
  STP:"SSA",SEN:"SSA",SYC:"SSA",SLE:"SSA",SOM:"SSA",ZAF:"SSA",SSD:"SSA",
  SDN:"SSA",TZA:"SSA",TGO:"SSA",UGA:"SSA",ZMB:"SSA",ZWE:"SSA",
  // South Asia (6)
  BGD:"SA",BTN:"SA",IND:"SA",MDV:"SA",NPL:"SA",LKA:"SA",
  // Latin America & Caribbean (42)
  ATG:"LAC",ARG:"LAC",ABW:"LAC",BHS:"LAC",BRB:"LAC",BLZ:"LAC",BOL:"LAC",
  BRA:"LAC",VGB:"LAC",CYM:"LAC",CHL:"LAC",COL:"LAC",CRI:"LAC",CUB:"LAC",
  CUW:"LAC",DMA:"LAC",DOM:"LAC",ECU:"LAC",SLV:"LAC",GRD:"LAC",GTM:"LAC",
  GUY:"LAC",HTI:"LAC",HND:"LAC",JAM:"LAC",MEX:"LAC",NIC:"LAC",PAN:"LAC",
  PRY:"LAC",PER:"LAC",PRI:"LAC",SXM:"LAC",KNA:"LAC",LCA:"LAC",MAF:"LAC",
  VCT:"LAC",SUR:"LAC",TTO:"LAC",TCA:"LAC",URY:"LAC",VEN:"LAC",VIR:"LAC",
  // Middle East, North Africa, Afghanistan & Pakistan (23)
  AFG:"MENA",DZA:"MENA",BHR:"MENA",DJI:"MENA",EGY:"MENA",IRN:"MENA",
  IRQ:"MENA",ISR:"MENA",JOR:"MENA",KWT:"MENA",LBN:"MENA",LBY:"MENA",
  MLT:"MENA",MAR:"MENA",OMN:"MENA",PAK:"MENA",QAT:"MENA",SAU:"MENA",
  SYR:"MENA",TUN:"MENA",ARE:"MENA",PSE:"MENA",YEM:"MENA",
  // Europe & Central Asia (58; XKX/Kosovo and CHI/Channel Islands have no standard ISO numeric)
  ALB:"ECA",AND:"ECA",ARM:"ECA",AUT:"ECA",AZE:"ECA",BLR:"ECA",BEL:"ECA",
  BIH:"ECA",BGR:"ECA",HRV:"ECA",CYP:"ECA",CZE:"ECA",DNK:"ECA",EST:"ECA",
  FRO:"ECA",FIN:"ECA",FRA:"ECA",GEO:"ECA",DEU:"ECA",GIB:"ECA",GRC:"ECA",
  GRL:"ECA",HUN:"ECA",ISL:"ECA",IRL:"ECA",IMN:"ECA",ITA:"ECA",KAZ:"ECA",
  KGZ:"ECA",LVA:"ECA",LIE:"ECA",LTU:"ECA",LUX:"ECA",MDA:"ECA",MCO:"ECA",
  MNE:"ECA",NLD:"ECA",MKD:"ECA",NOR:"ECA",POL:"ECA",PRT:"ECA",ROU:"ECA",
  RUS:"ECA",SMR:"ECA",SRB:"ECA",SVK:"ECA",SVN:"ECA",ESP:"ECA",SWE:"ECA",
  CHE:"ECA",TJK:"ECA",TUR:"ECA",TKM:"ECA",UKR:"ECA",GBR:"ECA",UZB:"ECA",
  // East Asia & Pacific (38; TWN has numeric 158 but may not be in world-atlas)
  ASM:"EAP",AUS:"EAP",BRN:"EAP",KHM:"EAP",CHN:"EAP",FJI:"EAP",PYF:"EAP",
  GUM:"EAP",HKG:"EAP",IDN:"EAP",JPN:"EAP",KIR:"EAP",PRK:"EAP",KOR:"EAP",
  LAO:"EAP",MAC:"EAP",MYS:"EAP",MHL:"EAP",FSM:"EAP",MNG:"EAP",MMR:"EAP",
  NRU:"EAP",NCL:"EAP",NZL:"EAP",MNP:"EAP",PLW:"EAP",PNG:"EAP",PHL:"EAP",
  WSM:"EAP",SGP:"EAP",SLB:"EAP",TWN:"EAP",THA:"EAP",TLS:"EAP",TON:"EAP",
  TUV:"EAP",VUT:"EAP",VNM:"EAP",
};

// ── ISO numeric → ISO3 (all countries from the WB file with valid ISO numerics) ──
const NUMERIC_TO_ISO3 = {
  4:"AFG",8:"ALB",12:"DZA",16:"ASM",20:"AND",24:"AGO",28:"ATG",32:"ARG",
  36:"AUS",40:"AUT",44:"BHS",48:"BHR",50:"BGD",51:"ARM",52:"BRB",56:"BEL",
  64:"BTN",68:"BOL",70:"BIH",72:"BWA",76:"BRA",84:"BLZ",90:"SLB",92:"VGB",
  96:"BRN",100:"BGR",104:"MMR",108:"BDI",112:"BLR",116:"KHM",120:"CMR",
  132:"CPV",136:"CYM",140:"CAF",144:"LKA",148:"TCD",152:"CHL",156:"CHN",
  158:"TWN",170:"COL",174:"COM",178:"COG",180:"COD",188:"CRI",191:"HRV",
  192:"CUB",196:"CYP",203:"CZE",204:"BEN",208:"DNK",212:"DMA",214:"DOM",
  218:"ECU",222:"SLV",226:"GNQ",231:"ETH",232:"ERI",233:"EST",234:"FRO",
  242:"FJI",246:"FIN",250:"FRA",258:"PYF",262:"DJI",266:"GAB",268:"GEO",
  270:"GMB",275:"PSE",276:"DEU",288:"GHA",292:"GIB",296:"KIR",300:"GRC",
  304:"GRL",308:"GRD",316:"GUM",320:"GTM",324:"GIN",328:"GUY",332:"HTI",
  340:"HND",344:"HKG",348:"HUN",352:"ISL",356:"IND",360:"IDN",364:"IRN",
  368:"IRQ",372:"IRL",376:"ISR",380:"ITA",384:"CIV",388:"JAM",392:"JPN",
  398:"KAZ",400:"JOR",404:"KEN",408:"PRK",410:"KOR",414:"KWT",417:"KGZ",
  418:"LAO",422:"LBN",426:"LSO",428:"LVA",430:"LBR",434:"LBY",438:"LIE",
  440:"LTU",442:"LUX",446:"MAC",450:"MDG",454:"MWI",458:"MYS",462:"MDV",
  466:"MLI",470:"MLT",478:"MRT",480:"MUS",484:"MEX",492:"MCO",496:"MNG",
  498:"MDA",499:"MNE",504:"MAR",508:"MOZ",512:"OMN",516:"NAM",520:"NRU",
  524:"NPL",528:"NLD",531:"CUW",533:"ABW",534:"SXM",540:"NCL",548:"VUT",
  554:"NZL",558:"NIC",562:"NER",566:"NGA",578:"NOR",580:"MNP",583:"FSM",
  584:"MHL",585:"PLW",586:"PAK",591:"PAN",598:"PNG",600:"PRY",604:"PER",
  608:"PHL",616:"POL",620:"PRT",624:"GNB",626:"TLS",630:"PRI",634:"QAT",
  642:"ROU",643:"RUS",646:"RWA",659:"KNA",662:"LCA",663:"MAF",670:"VCT",
  674:"SMR",678:"STP",682:"SAU",686:"SEN",688:"SRB",690:"SYC",694:"SLE",
  702:"SGP",703:"SVK",704:"VNM",705:"SVN",706:"SOM",710:"ZAF",716:"ZWE",
  724:"ESP",728:"SSD",729:"SDN",740:"SUR",748:"SWZ",750:"PSE",752:"SWE",
  756:"CHE",760:"SYR",762:"TJK",764:"THA",768:"TGO",776:"TON",780:"TTO",
  784:"ARE",788:"TUN",792:"TUR",795:"TKM",796:"TCA",798:"TUV",800:"UGA",
  804:"UKR",807:"MKD",818:"EGY",826:"GBR",833:"IMN",834:"TZA",850:"VIR",
  854:"BFA",858:"URY",860:"UZB",862:"VEN",882:"WSM",887:"YEM",894:"ZMB",
};

console.log("Fetching world-atlas countries-110m.json …");
const res = await fetch(
  "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json"
);
const topology = await res.json();
const countryObjs = topology.objects.countries.geometries;
console.log(`Total geometries in topology: ${countryObjs.length}`);

// Group geometries by region
const byRegion = {};
let matched = 0;

for (const geom of countryObjs) {
  const numId = parseInt(geom.id, 10);
  const iso3 = NUMERIC_TO_ISO3[numId];
  const region = iso3 ? ISO3_TO_REGION[iso3] : undefined;
  if (region) {
    if (!byRegion[region]) byRegion[region] = [];
    byRegion[region].push(geom);
    matched++;
  }
}

console.log(`Matched: ${matched} / ${countryObjs.length} geometries`);
Object.entries(byRegion)
  .sort((a,b) => a[0].localeCompare(b[0]))
  .forEach(([r, gs]) => console.log(`  ${r}: ${gs.length} geometries`));

// Dissolve each region with topojson.merge() — shared borders are removed
const features = Object.entries(byRegion).map(([regionId, geoms]) => ({
  type: "Feature",
  properties: { region: regionId },
  geometry: topojson.merge(topology, geoms),
}));

const geojson = { type: "FeatureCollection", features };
writeFileSync(OUT, JSON.stringify(geojson));
console.log(`\nWrote ${OUT}  (${features.length} region features)`);
