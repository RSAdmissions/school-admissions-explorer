// Postcode district definitions for catchment categories
// Real boundary data is loaded from GeoJSON files in /public/geojson/

export const CAT4_POSTCODES_LIST = ["RG1","RG2","RG30","RG31","RG4","RG5","RG6","RG7","RG8","RG9","RG10","RG40","RG41"];
export const CAT5_ONLY_POSTCODES_LIST = ["RG12","RG14","RG18","RG19","RG26","RG27","RG42","RG45","GU15","GU17","GU19","GU46","GU47","OX10","SL4","SL5"];

export const POSTCODE_NAMES: Record<string, string> = {
  RG1: "RG1 – Central Reading",
  RG2: "RG2 – South Reading",
  RG4: "RG4 – Caversham",
  RG5: "RG5 – Woodley",
  RG6: "RG6 – Earley / Lower Earley",
  RG7: "RG7 – Burghfield / Mortimer",
  RG8: "RG8 – Pangbourne / Streatley",
  RG9: "RG9 – Henley-on-Thames",
  RG10: "RG10 – Twyford / Wargrave",
  RG30: "RG30 – West Reading / Tilehurst",
  RG31: "RG31 – Tilehurst / Purley",
  RG40: "RG40 – Wokingham",
  RG41: "RG41 – Winnersh / Wokingham",
  RG12: "RG12 – Bracknell",
  RG14: "RG14 – Newbury",
  RG18: "RG18 – Hermitage / Upper Bucklebury",
  RG19: "RG19 – Thatcham",
  RG26: "RG26 – Tadley",
  RG27: "RG27 – Hook",
  RG42: "RG42 – Bracknell (north)",
  RG45: "RG45 – Crowthorne",
  GU15: "GU15 – Camberley",
  GU17: "GU17 – Blackwater / Hawley",
  GU19: "GU19 – Bagshot",
  GU46: "GU46 – Yateley",
  GU47: "GU47 – Sandhurst",
  OX10: "OX10 – Wallingford",
  SL4: "SL4 – Windsor",
  SL5: "SL5 – Ascot",
};

// GeoJSON files that need to be loaded for each category
export const GEOJSON_FILES = ["RG", "GU", "OX", "SL"];
