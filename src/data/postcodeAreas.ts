// Approximate postcode district boundary polygons (indicative only)
// Coordinates are [lat, lng] pairs forming polygon boundaries

export interface PostcodeArea {
  code: string;
  name: string;
  coords: [number, number][];
}

export const CAT4_POSTCODES_LIST = ["RG1","RG2","RG30","RG31","RG4","RG5","RG6","RG7","RG8","RG9","RG10","RG40","RG41"];
export const CAT5_ONLY_POSTCODES_LIST = ["RG12","RG14","RG18","RG19","RG26","RG27","RG42","RG45","GU15","GU17","GU19","GU46","GU47","OX10","SL4","SL5"];

// Category 4 postcode approximate boundaries
export const CAT4_AREAS: PostcodeArea[] = [
  { code: "RG1", name: "RG1 – Central Reading", coords: [
    [51.4620, -0.9850], [51.4620, -0.9380], [51.4480, -0.9380], [51.4400, -0.9500], [51.4400, -0.9850]
  ]},
  { code: "RG2", name: "RG2 – South Reading", coords: [
    [51.4400, -1.0000], [51.4400, -0.9380], [51.4200, -0.9380], [51.4100, -0.9550], [51.4100, -1.0000]
  ]},
  { code: "RG4", name: "RG4 – Caversham", coords: [
    [51.5000, -1.0050], [51.5000, -0.9350], [51.4750, -0.9350], [51.4620, -0.9500], [51.4620, -1.0050]
  ]},
  { code: "RG5", name: "RG5 – Woodley", coords: [
    [51.4700, -0.9200], [51.4700, -0.8700], [51.4450, -0.8700], [51.4450, -0.9200]
  ]},
  { code: "RG6", name: "RG6 – Earley / Lower Earley", coords: [
    [51.4480, -0.9380], [51.4480, -0.8800], [51.4220, -0.8800], [51.4220, -0.9380]
  ]},
  { code: "RG7", name: "RG7 – Burghfield / Mortimer", coords: [
    [51.4100, -1.1000], [51.4100, -0.9500], [51.3600, -0.9500], [51.3400, -1.0000], [51.3400, -1.1000]
  ]},
  { code: "RG8", name: "RG8 – Pangbourne / Streatley", coords: [
    [51.5600, -1.1500], [51.5600, -1.0400], [51.5200, -1.0400], [51.4800, -1.0500], [51.4800, -1.1500]
  ]},
  { code: "RG9", name: "RG9 – Henley-on-Thames", coords: [
    [51.5800, -0.9300], [51.5800, -0.8200], [51.5400, -0.8200], [51.5200, -0.8500], [51.5200, -0.9300]
  ]},
  { code: "RG10", name: "RG10 – Twyford / Wargrave", coords: [
    [51.5200, -0.8800], [51.5200, -0.8000], [51.4700, -0.8000], [51.4700, -0.8800]
  ]},
  { code: "RG30", name: "RG30 – West Reading / Tilehurst", coords: [
    [51.4700, -1.0500], [51.4700, -0.9850], [51.4400, -0.9850], [51.4400, -1.0500]
  ]},
  { code: "RG31", name: "RG31 – Tilehurst / Purley", coords: [
    [51.4850, -1.1000], [51.4850, -1.0500], [51.4400, -1.0500], [51.4400, -1.1000]
  ]},
  { code: "RG40", name: "RG40 – Wokingham", coords: [
    [51.4300, -0.8800], [51.4300, -0.8100], [51.3900, -0.8100], [51.3900, -0.8800]
  ]},
  { code: "RG41", name: "RG41 – Winnersh / Wokingham", coords: [
    [51.4500, -0.9200], [51.4500, -0.8600], [51.4200, -0.8600], [51.4200, -0.9200]
  ]},
];

// Category 5 only (additional postcodes beyond Cat 4)
export const CAT5_ONLY_AREAS: PostcodeArea[] = [
  { code: "RG12", name: "RG12 – Bracknell", coords: [
    [51.4250, -0.7800], [51.4250, -0.7200], [51.3900, -0.7200], [51.3900, -0.7800]
  ]},
  { code: "RG14", name: "RG14 – Newbury", coords: [
    [51.4200, -1.3500], [51.4200, -1.2700], [51.3800, -1.2700], [51.3800, -1.3500]
  ]},
  { code: "RG18", name: "RG18 – Hermitage / Upper Bucklebury", coords: [
    [51.4800, -1.2500], [51.4800, -1.1500], [51.4400, -1.1500], [51.4400, -1.2500]
  ]},
  { code: "RG19", name: "RG19 – Thatcham", coords: [
    [51.4200, -1.2800], [51.4200, -1.1800], [51.3800, -1.1800], [51.3800, -1.2800]
  ]},
  { code: "RG26", name: "RG26 – Tadley", coords: [
    [51.3800, -1.1200], [51.3800, -1.0300], [51.3300, -1.0300], [51.3300, -1.1200]
  ]},
  { code: "RG27", name: "RG27 – Hook", coords: [
    [51.3300, -1.0600], [51.3300, -0.9500], [51.2800, -0.9500], [51.2800, -1.0600]
  ]},
  { code: "RG42", name: "RG42 – Bracknell (north)", coords: [
    [51.4400, -0.7500], [51.4400, -0.6800], [51.4100, -0.6800], [51.4100, -0.7500]
  ]},
  { code: "RG45", name: "RG45 – Crowthorne", coords: [
    [51.3900, -0.8200], [51.3900, -0.7700], [51.3550, -0.7700], [51.3550, -0.8200]
  ]},
  { code: "GU15", name: "GU15 – Camberley", coords: [
    [51.3600, -0.7700], [51.3600, -0.7200], [51.3200, -0.7200], [51.3200, -0.7700]
  ]},
  { code: "GU17", name: "GU17 – Blackwater / Hawley", coords: [
    [51.3500, -0.8000], [51.3500, -0.7600], [51.3200, -0.7600], [51.3200, -0.8000]
  ]},
  { code: "GU19", name: "GU19 – Bagshot", coords: [
    [51.3800, -0.7200], [51.3800, -0.6700], [51.3500, -0.6700], [51.3500, -0.7200]
  ]},
  { code: "GU46", name: "GU46 – Yateley", coords: [
    [51.3600, -0.8500], [51.3600, -0.7900], [51.3300, -0.7900], [51.3300, -0.8500]
  ]},
  { code: "GU47", name: "GU47 – Sandhurst", coords: [
    [51.3500, -0.8200], [51.3500, -0.7700], [51.3200, -0.7700], [51.3200, -0.8200]
  ]},
  { code: "OX10", name: "OX10 – Wallingford", coords: [
    [51.6400, -1.1800], [51.6400, -1.0600], [51.5700, -1.0600], [51.5700, -1.1800]
  ]},
  { code: "SL4", name: "SL4 – Windsor", coords: [
    [51.5100, -0.6800], [51.5100, -0.5800], [51.4600, -0.5800], [51.4600, -0.6800]
  ]},
  { code: "SL5", name: "SL5 – Ascot", coords: [
    [51.4300, -0.7000], [51.4300, -0.6300], [51.3900, -0.6300], [51.3900, -0.7000]
  ]},
];
