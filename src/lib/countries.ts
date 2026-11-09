/** ISO 3166-1 alpha-2 codes. Names come from Intl.DisplayNames so there's no hand-kept name table to drift. */
const CODES =
  "AF AX AL DZ AS AD AO AI AQ AG AR AM AW AU AT AZ BS BH BD BB BY BE BZ BJ BM BT BO BQ BA BW BV BR IO BN BG BF BI CV KH CM CA KY CF TD CL CN CX CC CO KM CG CD CK CR CI HR CU CW CY CZ DK DJ DM DO EC EG SV GQ ER EE SZ ET FK FO FJ FI FR GF PF TF GA GM GE DE GH GI GR GL GD GP GU GT GG GN GW GY HT HM VA HN HK HU IS IN ID IR IQ IE IM IL IT JM JP JE JO KZ KE KI KP KR KW KG LA LV LB LS LR LY LI LT LU MO MG MW MY MV ML MT MH MQ MR MU YT MX FM MD MC MN ME MS MA MZ MM NA NR NP NL NC NZ NI NE NG NU NF MK MP NO OM PK PW PS PA PG PY PE PH PN PL PT PR QA RE RO RU RW BL SH KN LC MF PM VC WS SM ST SA SN RS SC SL SG SX SK SI SB SO ZA GS SS ES LK SD SR SJ SE CH SY TW TJ TZ TH TL TG TK TO TT TN TR TM TC TV UG UA AE GB US UM UY UZ VU VE VN VG VI WF EH YE ZM ZW".split(
    " ",
  );

const CODE_SET = new Set(CODES);

export function isCountryCode(value: unknown): value is string {
  return typeof value === "string" && CODE_SET.has(value);
}

export function countryName(code: string): string {
  try {
    return new Intl.DisplayNames(["en"], { type: "region" }).of(code) ?? code;
  } catch {
    return code;
  }
}

/** All countries, A–Z by name. */
export function countryOptions(): { code: string; name: string }[] {
  return CODES.map((code) => ({ code, name: countryName(code) })).sort((a, b) => a.name.localeCompare(b.name));
}

/** Stored in `users.country` when a player picks "Prefer not to say" — never matches a country, so they only appear in the global ladder. */
export const COUNTRY_HIDDEN = "none";

const ALPHA3 = Object.fromEntries(
  "AF AFG,AX ALA,AL ALB,DZ DZA,AS ASM,AD AND,AO AGO,AI AIA,AQ ATA,AG ATG,AR ARG,AM ARM,AW ABW,AU AUS,AT AUT,AZ AZE,BS BHS,BH BHR,BD BGD,BB BRB,BY BLR,BE BEL,BZ BLZ,BJ BEN,BM BMU,BT BTN,BO BOL,BQ BES,BA BIH,BW BWA,BV BVT,BR BRA,IO IOT,BN BRN,BG BGR,BF BFA,BI BDI,CV CPV,KH KHM,CM CMR,CA CAN,KY CYM,CF CAF,TD TCD,CL CHL,CN CHN,CX CXR,CC CCK,CO COL,KM COM,CG COG,CD COD,CK COK,CR CRI,CI CIV,HR HRV,CU CUB,CW CUW,CY CYP,CZ CZE,DK DNK,DJ DJI,DM DMA,DO DOM,EC ECU,EG EGY,SV SLV,GQ GNQ,ER ERI,EE EST,SZ SWZ,ET ETH,FK FLK,FO FRO,FJ FJI,FI FIN,FR FRA,GF GUF,PF PYF,TF ATF,GA GAB,GM GMB,GE GEO,DE DEU,GH GHA,GI GIB,GR GRC,GL GRL,GD GRD,GP GLP,GU GUM,GT GTM,GG GGY,GN GIN,GW GNB,GY GUY,HT HTI,HM HMD,VA VAT,HN HND,HK HKG,HU HUN,IS ISL,IN IND,ID IDN,IR IRN,IQ IRQ,IE IRL,IM IMN,IL ISR,IT ITA,JM JAM,JP JPN,JE JEY,JO JOR,KZ KAZ,KE KEN,KI KIR,KP PRK,KR KOR,KW KWT,KG KGZ,LA LAO,LV LVA,LB LBN,LS LSO,LR LBR,LY LBY,LI LIE,LT LTU,LU LUX,MO MAC,MG MDG,MW MWI,MY MYS,MV MDV,ML MLI,MT MLT,MH MHL,MQ MTQ,MR MRT,MU MUS,YT MYT,MX MEX,FM FSM,MD MDA,MC MCO,MN MNG,ME MNE,MS MSR,MA MAR,MZ MOZ,MM MMR,NA NAM,NR NRU,NP NPL,NL NLD,NC NCL,NZ NZL,NI NIC,NE NER,NG NGA,NU NIU,NF NFK,MK MKD,MP MNP,NO NOR,OM OMN,PK PAK,PW PLW,PS PSE,PA PAN,PG PNG,PY PRY,PE PER,PH PHL,PN PCN,PL POL,PT PRT,PR PRI,QA QAT,RE REU,RO ROU,RU RUS,RW RWA,BL BLM,SH SHN,KN KNA,LC LCA,MF MAF,PM SPM,VC VCT,WS WSM,SM SMR,ST STP,SA SAU,SN SEN,RS SRB,SC SYC,SL SLE,SG SGP,SX SXM,SK SVK,SI SVN,SB SLB,SO SOM,ZA ZAF,GS SGS,SS SSD,ES ESP,LK LKA,SD SDN,SR SUR,SJ SJM,SE SWE,CH CHE,SY SYR,TW TWN,TJ TJK,TZ TZA,TH THA,TL TLS,TG TGO,TK TKL,TO TON,TT TTO,TN TUN,TR TUR,TM TKM,TC TCA,TV TUV,UG UGA,UA UKR,AE ARE,GB GBR,US USA,UM UMI,UY URY,UZ UZB,VU VUT,VE VEN,VN VNM,VG VGB,VI VIR,WF WLF,EH ESH,YE YEM,ZM ZMB,ZW ZWE".split(",").map((p) => p.split(" ") as [string, string]),
);

const slugify = (name: string) =>
  name
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/['\u2019]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

/** URL slug for a country, from its English name: "DO" -> "dominican-republic". */
export function countrySlug(code: string): string {
  return slugify(countryName(code));
}

let slugIndex: Map<string, string> | null = null;
function slugToCode(slug: string): string | undefined {
  if (!slugIndex) slugIndex = new Map(CODES.map((c) => [countrySlug(c), c]));
  return slugIndex.get(slug);
}

export type CountryRouteMatch =
  | { kind: "canonical"; code: string }
  | { kind: "redirect"; code: string }
  | { kind: "none" };

/**
 * Resolves the `[country]` URL segment. The English-name slug is canonical; ISO-2 (`do`), ISO-3 (`dom`)
 * and any other casing redirect to it so each country has exactly one indexable URL.
 */
export function matchCountryParam(param: string): CountryRouteMatch {
  const raw = decodeURIComponent(param);
  const lower = raw.toLowerCase();
  const bySlug = slugToCode(lower);
  if (bySlug) return raw === lower ? { kind: "canonical", code: bySlug } : { kind: "redirect", code: bySlug };
  if (lower.length === 2 && isCountryCode(lower.toUpperCase())) return { kind: "redirect", code: lower.toUpperCase() };
  if (lower.length === 3) {
    const code = Object.keys(ALPHA3).find((c) => ALPHA3[c].toLowerCase() === lower);
    if (code) return { kind: "redirect", code };
  }
  return { kind: "none" };
}
