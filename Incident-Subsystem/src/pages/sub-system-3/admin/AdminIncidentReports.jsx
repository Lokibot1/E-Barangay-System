import React, { useState, useEffect, useMemo } from "react";
import {
  MapContainer,
  TileLayer,
  Polygon,
  CircleMarker,
  Popup,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import themeTokens from "../../../Themetokens";
import AdminReportDetailsModal from "../../../components/sub-system-3/AdminReportDetailsModal";

// ── Barangay Gulod boundary (OSM Relation 270990) ──────────────────────
const BARANGAY_BOUNDARY = [
  [14.710492, 121.0335323],
  [14.7101886, 121.033562],
  [14.709774, 121.0338342],
  [14.7095436, 121.0339713],
  [14.7094757, 121.0345597],
  [14.7094277, 121.0350814],
  [14.7093446, 121.0362553],
  [14.7092669, 121.0363582],
  [14.709162, 121.0364442],
  [14.7089794, 121.0366244],
  [14.7089056, 121.036688],
  [14.7091458, 121.03699],
  [14.7091637, 121.0372903],
  [14.709336, 121.0375888],
  [14.7094565, 121.0382147],
  [14.709263, 121.0384845],
  [14.7091378, 121.03848],
  [14.7090308, 121.0384375],
  [14.708583, 121.0387608],
  [14.7084187, 121.0387662],
  [14.7083563, 121.0389081],
  [14.7080226, 121.0396347],
  [14.7080861, 121.0400809],
  [14.7080705, 121.0401844],
  [14.7075016, 121.0415248],
  [14.7066561, 121.0415217],
  [14.7058151, 121.0418078],
  [14.7052453, 121.0419812],
  [14.7052824, 121.0440479],
  [14.7052707, 121.0454888],
  [14.704594, 121.0455003],
  [14.7050443, 121.0468975],
  [14.7053168, 121.0474573],
  [14.7061441, 121.0472436],
  [14.7061633, 121.0472437],
  [14.7063696, 121.0471759],
  [14.7070541, 121.047172],
  [14.7074933, 121.0468812],
  [14.7079836, 121.0468267],
  [14.7084147, 121.0467387],
  [14.7087975, 121.0466027],
  [14.7088616, 121.0465728],
  [14.708988, 121.0465237],
  [14.7090729, 121.0465472],
  [14.7091216, 121.0466418],
  [14.7091885, 121.0467319],
  [14.7093433, 121.0467944],
  [14.709431, 121.0467645],
  [14.7095276, 121.0466762],
  [14.709637, 121.0464922],
  [14.7097706, 121.0459681],
  [14.7098262, 121.0459465],
  [14.7099749, 121.0459745],
  [14.7100253, 121.0459659],
  [14.7100798, 121.0460252],
  [14.7102054, 121.045984],
  [14.7104115, 121.0460574],
  [14.7105981, 121.046219],
  [14.7107014, 121.046361],
  [14.7109051, 121.0467486],
  [14.7110597, 121.0469001],
  [14.7112651, 121.0470558],
  [14.7113701, 121.0470603],
  [14.7118121, 121.0468657],
  [14.7120473, 121.04668],
  [14.7122458, 121.0463628],
  [14.7125295, 121.0461321],
  [14.712751, 121.0459071],
  [14.7128774, 121.04565],
  [14.7129189, 121.0452638],
  [14.7128681, 121.0449875],
  [14.7126643, 121.0446371],
  [14.7125356, 121.0444294],
  [14.7122657, 121.0441094],
  [14.7119655, 121.0436705],
  [14.7119718, 121.0434184],
  [14.7120946, 121.0432508],
  [14.7122324, 121.0431034],
  [14.7123962, 121.0429966],
  [14.7125755, 121.0429383],
  [14.7127791, 121.0429079],
  [14.7130402, 121.0429966],
  [14.7133731, 121.0431543],
  [14.7135, 121.0432095],
  [14.7136163, 121.0432103],
  [14.7139198, 121.0430658],
  [14.7146356, 121.0428879],
  [14.7148887, 121.0428612],
  [14.7150544, 121.0429258],
  [14.7151967, 121.0430697],
  [14.7154815, 121.0434241],
  [14.7157166, 121.0438905],
  [14.7158245, 121.0442338],
  [14.7159932, 121.0443492],
  [14.7161024, 121.0443099],
  [14.7162898, 121.0441341],
  [14.7165224, 121.0440041],
  [14.7173538, 121.0438154],
  [14.717601, 121.0437188],
  [14.7178396, 121.0436498],
  [14.7184845, 121.0434931],
  [14.7185908, 121.0434293],
  [14.7186606, 121.0433855],
  [14.718696, 121.0433491],
  [14.7187068, 121.0432445],
  [14.7186606, 121.0430669],
  [14.7184907, 121.0427013],
  [14.7184298, 121.042527],
  [14.7183594, 121.0421883],
  [14.7183753, 121.0420877],
  [14.7185368, 121.0418588],
  [14.7186873, 121.0416664],
  [14.7188422, 121.0414534],
  [14.7190733, 121.0411207],
  [14.7190759, 121.0409713],
  [14.7188598, 121.0404672],
  [14.7187086, 121.0401682],
  [14.7184233, 121.039773],
  [14.7176617, 121.0391703],
  [14.7175646, 121.0390905],
  [14.7174147, 121.0389286],
  [14.7173238, 121.0388499],
  [14.7172294, 121.0387788],
  [14.7171469, 121.0387494],
  [14.7170159, 121.0387334],
  [14.7168797, 121.0387279],
  [14.7167954, 121.0387239],
  [14.7167398, 121.0386924],
  [14.7166645, 121.0386199],
  [14.7164802, 121.0383958],
  [14.7159739, 121.0374912],
  [14.7159302, 121.0374116],
  [14.7159069, 121.0373821],
  [14.7158693, 121.0373667],
  [14.7158368, 121.0373533],
  [14.7157973, 121.0373462],
  [14.7157255, 121.0373377],
  [14.715513, 121.0373544],
  [14.7153563, 121.0373727],
  [14.7152856, 121.0373694],
  [14.7152214, 121.0373586],
  [14.7151652, 121.0373378],
  [14.71503, 121.0372433],
  [14.7148582, 121.0370918],
  [14.7146629, 121.0369087],
  [14.7146156, 121.0368524],
  [14.7145884, 121.0368115],
  [14.7145735, 121.0367752],
  [14.7145637, 121.0367116],
  [14.7145624, 121.0366505],
  [14.7145683, 121.0365533],
  [14.714615, 121.0361651],
  [14.7146798, 121.0357641],
  [14.7147687, 121.0351744],
  [14.7147602, 121.0351244],
  [14.7147391, 121.0350697],
  [14.7146952, 121.035004],
  [14.7145509, 121.0348887],
  [14.7140667, 121.0344099],
  [14.7138862, 121.0342536],
  [14.7136913, 121.0341839],
  [14.7135132, 121.0341969],
  [14.7133827, 121.0342312],
  [14.7132461, 121.0342965],
  [14.7130565, 121.0344816],
  [14.7129008, 121.0345607],
  [14.7127621, 121.0345812],
  [14.712633, 121.0345279],
  [14.7122626, 121.0341479],
  [14.712102, 121.0339345],
  [14.7118143, 121.0335527],
  [14.711682, 121.0334848],
  [14.7115454, 121.0334957],
  [14.7114846, 121.0335308],
  [14.7114333, 121.0335862],
  [14.7112641, 121.0337882],
  [14.7111092, 121.0339523],
  [14.7109148, 121.0340751],
  [14.7108099, 121.0341028],
  [14.7106753, 121.0340604],
  [14.7105621, 121.0339774],
  [14.7105114, 121.0338543],
  [14.7104859, 121.0336751],
];

const MAP_CENTER = [14.7118, 121.0404];

// Point-in-polygon check
const isPointInPolygon = (point, polygon) => {
  let inside = false;
  const x = point[0];
  const y = point[1];
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i][0];
    const yi = polygon[i][1];
    const xj = polygon[j][0];
    const yj = polygon[j][1];
    const intersect =
      yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
};

// ── Mock incident data ─────────────────────────────────────────────────
const MOCK_INCIDENTS = [
  {
    id: "2026-02241025",
    type: "Traffic & Parking",
    details: "Illegally parked vehicles along Quirino Highway near Gulod intersection causing traffic",
    description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut enim lorem, fringilla in ullamcorper sit amet, facilisis vel leo. Pellentesque volutpat nisi a malesuada iaculis. Nam vitae purus laoreet nisi condimentum lobortis ut ac quam. Vivamus porta sapien nec mi tincidunt.",
    date: "2026-01-02",
    lastUpdated: "2026-01-02T12:03:29",
    reportedBy: "JONOTA, CHRISTOPHER B.",
    status: "pending",
    lat: 14.7155,
    lng: 121.0375,
    address: "Ciudad Regina Subdivision, 26 Calle Luz, Batasan Hills, Quezon City, 1126 Metro Manila",
    plusCode: "M3MR+9W Quezon City, Metro Manila",
    photos: [
      "https://images.unsplash.com/photo-1594230420743-52fa9e2f1322?w=600",
      "https://images.unsplash.com/photo-1517649763962-0c623066013b?w=600",
    ],
  },
  {
    id: "2026-02241026",
    type: "Traffic & Parking",
    details: "Illegally parked vehicles along residential area blocking pedestrian access",
    description: "Multiple vehicles have been parked along the narrow residential street for several days, blocking pedestrian walkways and preventing emergency vehicle access. Residents have complained about the obstruction.",
    date: "2026-01-02",
    lastUpdated: "2026-01-02T14:20:00",
    reportedBy: "JONOTA, CHRISTOPHER B.",
    status: "pending",
    lat: 14.7130,
    lng: 121.0432,
    address: "Purok 7, Barangay Gulod, Novaliches, Quezon City, Metro Manila",
    plusCode: "M3MR+5X Quezon City, Metro Manila",
    photos: [
      "https://images.unsplash.com/photo-1594230420743-52fa9e2f1322?w=600",
    ],
  },
  {
    id: "2026-02241027",
    type: "Waste Management",
    details: "Overflowing garbage bins near Gulod Barangay Hall causing foul odor",
    description: "The community garbage bins located near the barangay hall have not been collected for over a week. The overflowing waste is causing a strong foul odor and attracting pests in the area.",
    date: "2026-01-15",
    lastUpdated: "2026-01-16T09:15:00",
    reportedBy: "GARCIA, MARIA L.",
    status: "dispatched",
    lat: 14.7085,
    lng: 121.0395,
    address: "Near Gulod Barangay Hall, Novaliches, Quezon City, Metro Manila",
    plusCode: "M3MQ+8G Quezon City, Metro Manila",
    photos: [
      "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=600",
    ],
  },
  {
    id: "2026-02241028",
    type: "Roads & Infrastructure",
    details: "Large pothole on the main road near the barangay health center",
    description: "A large pothole approximately 2 feet wide has formed on the main road near the health center. Several motorcycles have already been affected and it poses danger especially at night when visibility is low.",
    date: "2026-01-20",
    lastUpdated: "2026-01-21T08:00:00",
    reportedBy: "SANTOS, JUAN P.",
    status: "dispatched",
    lat: 14.7095,
    lng: 121.0360,
    address: "Main Road, Barangay Gulod, Novaliches, Quezon City, Metro Manila",
    plusCode: "M3MQ+9C Quezon City, Metro Manila",
    photos: [
      "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=600",
    ],
  },
  {
    id: "2026-02241029",
    type: "Traffic & Parking",
    details: "Double parking issue near Geneva Gardens entrance blocking emergency lane",
    description: "Vehicles are consistently double parked near the Geneva Gardens entrance, completely blocking the emergency lane. This has been an ongoing issue during peak hours from 7-9 AM and 5-7 PM.",
    date: "2026-01-25",
    lastUpdated: "2026-01-25T18:45:00",
    reportedBy: "REYES, ANA M.",
    status: "active",
    lat: 14.7105,
    lng: 121.0460,
    address: "Geneva Gardens Entrance, Barangay Gulod, Novaliches, Quezon City",
    plusCode: "M3MR+3W Quezon City, Metro Manila",
    photos: [
      "https://images.unsplash.com/photo-1594230420743-52fa9e2f1322?w=600",
    ],
  },
  {
    id: "2026-02241030",
    type: "Draining & Flooding",
    details: "Clogged drainage causing street flooding during heavy rain near purok 5",
    description: "The main drainage canal near Purok 5 is severely clogged with debris and solid waste, causing significant street flooding even during moderate rainfall. Several homes have experienced minor flooding.",
    date: "2026-01-28",
    lastUpdated: "2026-01-29T07:30:00",
    reportedBy: "DELA CRUZ, PEDRO R.",
    status: "active",
    lat: 14.7070,
    lng: 121.0420,
    address: "Purok 5, Barangay Gulod, Novaliches, Quezon City, Metro Manila",
    plusCode: "M3MQ+4M Quezon City, Metro Manila",
    photos: [
      "https://images.unsplash.com/photo-1547683905-f686c993aae5?w=600",
    ],
  },
  {
    id: "2026-02241031",
    type: "Pollution",
    details: "Excessive noise from construction site during nighttime in residential zone",
    description: "A construction site near the residential area has been operating heavy machinery past 10 PM, violating noise ordinance regulations. Multiple residents have lost sleep and complained about the situation.",
    date: "2026-02-01",
    lastUpdated: "2026-02-02T11:00:00",
    reportedBy: "BAUTISTA, ELENA S.",
    status: "resolved",
    lat: 14.7060,
    lng: 121.0445,
    address: "Residential Zone, Barangay Gulod, Novaliches, Quezon City",
    plusCode: "M3MQ+2R Quezon City, Metro Manila",
    photos: [],
  },
  {
    id: "2026-02241032",
    type: "Stray Animals",
    details: "Pack of stray dogs roaming near the elementary school posing risk to children",
    description: "A pack of approximately 6-8 stray dogs has been spotted near the elementary school grounds. They have shown aggressive behavior towards children during morning and afternoon dismissal times.",
    date: "2026-02-01",
    lastUpdated: "2026-02-01T15:20:00",
    reportedBy: "LOPEZ, RICARDO T.",
    status: "resolved",
    lat: 14.7175,
    lng: 121.0410,
    address: "Near Gulod Elementary School, Novaliches, Quezon City, Metro Manila",
    plusCode: "M3PR+5H Quezon City, Metro Manila",
    photos: [],
  },
  {
    id: "2026-02241033",
    type: "Waste Management",
    details: "Illegal dumping of construction debris near the creek behind the chapel",
    description: "Construction waste including cement, broken tiles, and wood scraps have been illegally dumped near the creek behind the chapel. This is polluting the waterway and blocking water flow.",
    date: "2026-02-03",
    lastUpdated: "2026-02-03T10:45:00",
    reportedBy: "MENDOZA, JOSEFA C.",
    status: "pending",
    lat: 14.7120,
    lng: 121.0345,
    address: "Behind Chapel, Barangay Gulod, Novaliches, Quezon City, Metro Manila",
    plusCode: "M3MR+6A Quezon City, Metro Manila",
    photos: [
      "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=600",
    ],
  },
  {
    id: "2026-02241034",
    type: "Roads & Infrastructure",
    details: "Broken street light on the main corner creating safety hazard at night",
    description: "The street light at the main corner intersection has been broken for two weeks. The area becomes very dark at night, making it unsafe for pedestrians and motorists passing through.",
    date: "2026-02-05",
    lastUpdated: "2026-02-05T20:00:00",
    reportedBy: "VILLANUEVA, MARK D.",
    status: "active",
    lat: 14.7092,
    lng: 121.0370,
    address: "Main Corner, Barangay Gulod, Novaliches, Quezon City, Metro Manila",
    plusCode: "M3MQ+8E Quezon City, Metro Manila",
    photos: [],
  },
  {
    id: "2026-02241035",
    type: "Traffic & Parking",
    details: "Tricycles blocking the main road during rush hour near the market area",
    description: "Tricycle drivers congregate at the intersection during peak hours, blocking two-way traffic. The situation is worst from 7-8 AM and 5-6 PM causing significant delays for commuters.",
    date: "2026-02-06",
    lastUpdated: "2026-02-06T08:30:00",
    reportedBy: "AQUINO, TERESA G.",
    status: "pending",
    lat: 14.7145,
    lng: 121.0368,
    address: "Market Area, Barangay Gulod, Novaliches, Quezon City, Metro Manila",
    plusCode: "M3MR+7D Quezon City, Metro Manila",
    photos: [
      "https://images.unsplash.com/photo-1594230420743-52fa9e2f1322?w=600",
    ],
  },
  {
    id: "2026-02241036",
    type: "Waste Management",
    details: "Uncollected garbage bags piled up at the corner of Purok 3 for three days",
    description: "Residents of Purok 3 have placed their garbage bags at the designated collection point, but the garbage truck has not come for three consecutive days. The waste is attracting stray animals and flies.",
    date: "2026-02-06",
    lastUpdated: "2026-02-06T10:15:00",
    reportedBy: "CRUZ, ROBERTO M.",
    status: "pending",
    lat: 14.7098,
    lng: 121.0345,
    address: "Purok 3, Barangay Gulod, Novaliches, Quezon City, Metro Manila",
    plusCode: "M3MQ+9A Quezon City, Metro Manila",
    photos: [
      "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=600",
    ],
  },
  {
    id: "2026-02241037",
    type: "Draining & Flooding",
    details: "Manhole cover missing on residential street posing danger to pedestrians",
    description: "The manhole cover near the chapel has been missing for over a week. The open manhole is a significant safety hazard, especially at night when visibility is poor. Temporary barriers have been placed but keep getting moved.",
    date: "2026-02-04",
    lastUpdated: "2026-02-05T09:00:00",
    reportedBy: "FERNANDEZ, LILIA A.",
    status: "dispatched",
    lat: 14.7110,
    lng: 121.0440,
    address: "Near Chapel, Barangay Gulod, Novaliches, Quezon City, Metro Manila",
    plusCode: "M3MR+4P Quezon City, Metro Manila",
    photos: [],
  },
  {
    id: "2026-02241038",
    type: "Pollution",
    details: "Open burning of garbage in vacant lot producing thick smoke in residential area",
    description: "Someone has been burning garbage in the vacant lot behind the residential houses. The thick smoke is affecting residents with respiratory conditions and young children. This occurs almost every evening.",
    date: "2026-02-03",
    lastUpdated: "2026-02-04T07:45:00",
    reportedBy: "RAMOS, GLORIA F.",
    status: "dispatched",
    lat: 14.7135,
    lng: 121.0345,
    address: "Vacant Lot, Purok 6, Barangay Gulod, Novaliches, Quezon City",
    plusCode: "M3MR+6A Quezon City, Metro Manila",
    photos: [
      "https://images.unsplash.com/photo-1611273426858-450d8e3c9fce?w=600",
    ],
  },
  {
    id: "2026-02241039",
    type: "Roads & Infrastructure",
    details: "Collapsed concrete sidewalk near the barangay hall entrance causing trip hazard",
    description: "A section of the concrete sidewalk near the barangay hall main entrance has collapsed, creating a 6-inch drop that is a trip hazard for pedestrians, especially the elderly and children.",
    date: "2026-02-01",
    lastUpdated: "2026-02-02T14:00:00",
    reportedBy: "GARCIA, MARIA L.",
    status: "active",
    lat: 14.7082,
    lng: 121.0400,
    address: "Near Barangay Hall, Gulod, Novaliches, Quezon City, Metro Manila",
    plusCode: "M3MQ+8H Quezon City, Metro Manila",
    photos: [
      "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=600",
    ],
  },
  {
    id: "2026-02241040",
    type: "Stray Animals",
    details: "Aggressive stray cat colony near the daycare center scratching children",
    description: "A colony of approximately 10 stray cats has taken up residence near the daycare center. Some cats have become aggressive and have scratched two children this week. Parents are concerned about rabies risk.",
    date: "2026-02-07",
    lastUpdated: "2026-02-07T11:30:00",
    reportedBy: "SANTOS, JUAN P.",
    status: "pending",
    lat: 14.7165,
    lng: 121.0430,
    address: "Near Daycare Center, Barangay Gulod, Novaliches, Quezon City",
    plusCode: "M3PR+3N Quezon City, Metro Manila",
    photos: [],
  },
  {
    id: "2026-02241041",
    type: "Traffic & Parking",
    details: "Delivery trucks blocking narrow residential street during daytime hours",
    description: "Large delivery trucks have been parking along the narrow residential street for hours during the day while making deliveries to a nearby warehouse. The trucks completely block two-way traffic.",
    date: "2026-02-07",
    lastUpdated: "2026-02-07T16:00:00",
    reportedBy: "PEREZ, ANTONIO J.",
    status: "pending",
    lat: 14.7125,
    lng: 121.0435,
    address: "Residential Street, Barangay Gulod, Novaliches, Quezon City",
    plusCode: "M3MR+5N Quezon City, Metro Manila",
    photos: [
      "https://images.unsplash.com/photo-1594230420743-52fa9e2f1322?w=600",
    ],
  },
  {
    id: "2026-02241042",
    type: "Draining & Flooding",
    details: "Storm drain overflowing onto the road every time it rains near Purok 2",
    description: "The storm drain near Purok 2 has been consistently overflowing during even light rainfall, causing flooding on the road. The drain appears to be clogged with leaves and debris.",
    date: "2026-02-05",
    lastUpdated: "2026-02-06T06:00:00",
    reportedBy: "MORALES, CYNTHIA R.",
    status: "dispatched",
    lat: 14.7068,
    lng: 121.0440,
    address: "Purok 2, Barangay Gulod, Novaliches, Quezon City, Metro Manila",
    plusCode: "M3MQ+3P Quezon City, Metro Manila",
    photos: [
      "https://images.unsplash.com/photo-1547683905-f686c993aae5?w=600",
    ],
  },
  {
    id: "2026-02241043",
    type: "Waste Management",
    details: "Abandoned refrigerator dumped on sidewalk near the basketball court",
    description: "An old refrigerator has been abandoned on the sidewalk near the basketball court for over a week. It is an eyesore and takes up the entire walkway, forcing pedestrians to walk on the road.",
    date: "2026-01-30",
    lastUpdated: "2026-01-31T13:00:00",
    reportedBy: "DELA CRUZ, PEDRO R.",
    status: "resolved",
    lat: 14.7150,
    lng: 121.0440,
    address: "Near Basketball Court, Barangay Gulod, Novaliches, Quezon City",
    plusCode: "M3MR+8P Quezon City, Metro Manila",
    photos: [],
  },
  {
    id: "2026-02241044",
    type: "Roads & Infrastructure",
    details: "Water pipe leak causing road erosion and water waste on main street",
    description: "A water pipe beneath the main street has been leaking for several days, causing water to pool on the road surface. The constant water flow is eroding the pavement and creating muddy conditions.",
    date: "2026-02-02",
    lastUpdated: "2026-02-03T08:30:00",
    reportedBy: "REYES, ANA M.",
    status: "active",
    lat: 14.7140,
    lng: 121.0350,
    address: "Main Street, Barangay Gulod, Novaliches, Quezon City, Metro Manila",
    plusCode: "M3MR+7B Quezon City, Metro Manila",
    photos: [
      "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=600",
    ],
  },
  {
    id: "2026-02241045",
    type: "Pollution",
    details: "Auto repair shop discharging oil waste into drainage canal near creek",
    description: "An auto repair shop has been discharging used motor oil and other automotive fluids directly into the drainage canal. The oil is visible in the water and is flowing towards the nearby creek.",
    date: "2026-01-28",
    lastUpdated: "2026-01-30T10:00:00",
    reportedBy: "BAUTISTA, ELENA S.",
    status: "resolved",
    lat: 14.7088,
    lng: 121.0465,
    address: "Near Creek, Barangay Gulod, Novaliches, Quezon City, Metro Manila",
    plusCode: "M3MQ+8W Quezon City, Metro Manila",
    photos: [],
  },
  {
    id: "2026-02241046",
    type: "Traffic & Parking",
    details: "Unauthorized road construction blocking half of the two-lane road",
    description: "A private construction project has placed barriers blocking the entire right lane of the two-lane road without any permit or traffic management plan, causing dangerous one-lane traffic flow.",
    date: "2026-02-08",
    lastUpdated: "2026-02-08T09:00:00",
    reportedBy: "LOPEZ, RICARDO T.",
    status: "pending",
    lat: 14.7170,
    lng: 121.0395,
    address: "Two-Lane Road, Barangay Gulod, Novaliches, Quezon City",
    plusCode: "M3PR+4G Quezon City, Metro Manila",
    photos: [
      "https://images.unsplash.com/photo-1594230420743-52fa9e2f1322?w=600",
    ],
  },
  {
    id: "2026-02241047",
    type: "Stray Animals",
    details: "Roaming stray dogs chasing joggers at the barangay park early morning",
    description: "Multiple stray dogs have been chasing joggers and walkers at the barangay park during early morning hours (5-7 AM). Two joggers have reported being bitten in the past week.",
    date: "2026-02-04",
    lastUpdated: "2026-02-04T18:30:00",
    reportedBy: "MENDOZA, JOSEFA C.",
    status: "active",
    lat: 14.7115,
    lng: 121.0460,
    address: "Barangay Park, Gulod, Novaliches, Quezon City, Metro Manila",
    plusCode: "M3MR+4W Quezon City, Metro Manila",
    photos: [],
  },
  {
    id: "2026-02241048",
    type: "Waste Management",
    details: "Clogged communal trash bin attracting rats and cockroaches in Purok 4",
    description: "The communal trash bin in Purok 4 is severely overfilled and has not been emptied in over a week. Rats and cockroaches are now visible around the area, raising health concerns among residents.",
    date: "2026-02-07",
    lastUpdated: "2026-02-07T14:45:00",
    reportedBy: "AQUINO, TERESA G.",
    status: "dispatched",
    lat: 14.7100,
    lng: 121.0385,
    address: "Purok 4, Barangay Gulod, Novaliches, Quezon City, Metro Manila",
    plusCode: "M3MQ+9F Quezon City, Metro Manila",
    photos: [
      "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=600",
    ],
  },
];

// ── Status config ──────────────────────────────────────────────────────
const STATUS_CONFIG = {
  all: {
    label: "ALL",
    color: "#374151",
    bg: "bg-gray-700",
    tabBg: "bg-gray-700",
    tabText: "text-white",
    tabBorder: "border-gray-700",
  },
  pending: {
    label: "NEW (PENDING)",
    color: "#dc2626",
    bg: "bg-red-600",
    tabBg: "bg-green-700",
    tabText: "text-white",
    tabBorder: "border-green-700",
  },
  dispatched: {
    label: "DISPATCHED",
    color: "#f59e0b",
    bg: "bg-amber-400",
    tabBg: "bg-amber-100",
    tabText: "text-amber-800",
    tabBorder: "border-amber-400",
  },
  active: {
    label: "ON-SITE (ACTIVE)",
    color: "#2563eb",
    bg: "bg-blue-600",
    tabBg: "bg-white",
    tabText: "text-gray-700",
    tabBorder: "border-gray-300",
  },
  resolved: {
    label: "RESOLVED",
    color: "#16a34a",
    bg: "bg-green-500",
    tabBg: "bg-white",
    tabText: "text-gray-700",
    tabBorder: "border-gray-300",
  },
};

const INCIDENT_TYPES = [
  "All Types",
  "Traffic & Parking",
  "Waste Management",
  "Roads & Infrastructure",
  "Draining & Flooding",
  "Pollution",
  "Stray Animals",
];

// ════════════════════════════════════════════════════════════════════════
const AdminIncidentReports = () => {
  const [currentTheme, setCurrentTheme] = useState(
    () => localStorage.getItem("appTheme") || "blue",
  );

  useEffect(() => {
    const handler = (e) => setCurrentTheme(e.detail);
    window.addEventListener("themeChange", handler);
    return () => window.removeEventListener("themeChange", handler);
  }, []);

  const t = themeTokens[currentTheme] || themeTokens.blue;
  const isDark = currentTheme === "dark";

  // ── Modal state ─────────────────────────────────────────────────────
  const [selectedIncident, setSelectedIncident] = useState(null);

  // ── Filter state ───────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [startDate, setStartDate] = useState("2026-01-01");
  const [endDate, setEndDate] = useState("2026-02-28");
  const [currentPage, setCurrentPage] = useState(1);
  const ROWS_PER_PAGE = 10;

  // ── Map legend filter state ────────────────────────────────────────
  const [mapType, setMapType] = useState("All Types");
  const [mapStartDate, setMapStartDate] = useState("2026-01-01");
  const [mapEndDate, setMapEndDate] = useState("2026-02-28");
  const [visibleStatuses, setVisibleStatuses] = useState({
    resolved: true,
    dispatched: true,
    active: true,
    pending: true,
  });

  const toggleStatus = (status) => {
    setVisibleStatuses((prev) => ({ ...prev, [status]: !prev[status] }));
  };

  // ── Filtered data for table ────────────────────────────────────────
  const filteredTableData = useMemo(() => {
    return MOCK_INCIDENTS.filter((inc) => {
      if (activeTab !== "all" && inc.status !== activeTab) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchesSearch =
          inc.type.toLowerCase().includes(q) ||
          inc.details.toLowerCase().includes(q) ||
          inc.reportedBy.toLowerCase().includes(q) ||
          inc.id.toLowerCase().includes(q);
        if (!matchesSearch) return false;
      }
      if (startDate && inc.date < startDate) return false;
      if (endDate && inc.date > endDate) return false;
      return true;
    });
  }, [activeTab, searchQuery, startDate, endDate]);

  // ── Pagination ─────────────────────────────────────────────────────
  const totalPages = Math.ceil(filteredTableData.length / ROWS_PER_PAGE);
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * ROWS_PER_PAGE;
    return filteredTableData.slice(start, start + ROWS_PER_PAGE);
  }, [filteredTableData, currentPage]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searchQuery, startDate, endDate]);

  // ── Filtered data for map ──────────────────────────────────────────
  const filteredMapData = useMemo(() => {
    return MOCK_INCIDENTS.filter((inc) => {
      if (!visibleStatuses[inc.status]) return false;
      if (mapType !== "All Types" && inc.type !== mapType) return false;
      if (mapStartDate && inc.date < mapStartDate) return false;
      if (mapEndDate && inc.date > mapEndDate) return false;
      if (!isPointInPolygon([inc.lat, inc.lng], BARANGAY_BOUNDARY))
        return false;
      return true;
    });
  }, [visibleStatuses, mapType, mapStartDate, mapEndDate]);

  // ── Status tab counts ──────────────────────────────────────────────
  const statusCounts = useMemo(() => {
    const counts = { all: 0, pending: 0, dispatched: 0, active: 0, resolved: 0 };
    MOCK_INCIDENTS.forEach((inc) => {
      counts.all++;
      if (counts[inc.status] !== undefined) counts[inc.status]++;
    });
    return counts;
  }, []);

  return (
    <div className={`min-h-full ${t.pageBg} pb-10`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* ── Page Header ─────────────────────────────────────────── */}
        <div className="flex items-center gap-4 mb-8">
          <div className={`w-12 h-12 ${isDark ? "bg-slate-700" : "bg-gray-200"} rounded-lg flex items-center justify-center`}>
            <svg
              className={`w-7 h-7 ${isDark ? "text-slate-300" : "text-gray-600"}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <h1
            className={`text-2xl sm:text-3xl font-bold ${t.cardText} font-spartan uppercase`}
          >
            Incident Reports
          </h1>
        </div>

        {/* ── Table Section ────────────────────────────────────────── */}
        <div
          className={`${t.cardBg} border ${t.cardBorder} rounded-2xl shadow-lg mb-8 overflow-hidden`}
        >
          {/* Status Tabs */}
          <div className="flex flex-wrap gap-2 px-5 pt-5">
            {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`px-4 py-2 rounded-lg text-xs font-bold font-kumbh uppercase tracking-wide border-2 transition-all ${
                  activeTab === key
                    ? `${cfg.tabBg} ${cfg.tabText} ${cfg.tabBorder} shadow-md`
                    : isDark
                      ? "bg-slate-700 text-slate-300 border-slate-600 hover:bg-slate-200 hover:text-slate-800 hover:border-slate-400"
                      : "bg-white text-gray-500 border-gray-200 hover:border-gray-300"
                }`}
              >
                {cfg.label} ({statusCounts[key]})
              </button>
            ))}
          </div>

          {/* Search + Date Filters */}
          <div className="px-5 pt-5 pb-3">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <label
                  className={`block text-xs font-semibold ${t.subtleText} mb-1.5 font-kumbh uppercase`}
                >
                  Search
                </label>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by type, details, reporter..."
                  className={`w-full px-4 py-2.5 rounded-lg border ${t.cardBorder} ${t.cardBg} ${t.cardText} text-sm focus:outline-none focus:ring-2 focus:ring-green-500 font-kumbh`}
                />
              </div>
              <div>
                <label
                  className={`block text-xs font-semibold ${t.subtleText} mb-1.5 font-kumbh uppercase`}
                >
                  Start Date
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className={`px-4 py-2.5 rounded-lg border ${t.cardBorder} ${t.cardBg} ${t.cardText} text-sm focus:outline-none focus:ring-2 focus:ring-green-500 font-kumbh`}
                />
              </div>
              <div>
                <label
                  className={`block text-xs font-semibold ${t.subtleText} mb-1.5 font-kumbh uppercase`}
                >
                  End Date
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className={`px-4 py-2.5 rounded-lg border ${t.cardBorder} ${t.cardBg} ${t.cardText} text-sm focus:outline-none focus:ring-2 focus:ring-green-500 font-kumbh`}
                />
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto px-5 pb-5">
            <table className="w-full text-sm font-kumbh table-fixed">
              <thead>
                <tr className={`${isDark ? "bg-slate-700 border-y border-slate-600" : "bg-gray-100 border-y border-gray-200"}`}>
                  <th className={`text-left px-4 py-3 text-xs font-bold ${isDark ? "text-slate-300" : "text-gray-600"} uppercase w-[16%]`}>
                    Type of Incident
                  </th>
                  <th className={`text-left px-4 py-3 text-xs font-bold ${isDark ? "text-slate-300" : "text-gray-600"} uppercase w-[28%]`}>
                    Details
                  </th>
                  <th className={`text-left px-4 py-3 text-xs font-bold ${isDark ? "text-slate-300" : "text-gray-600"} uppercase w-[12%]`}>
                    Date
                  </th>
                  <th className={`text-left px-4 py-3 text-xs font-bold ${isDark ? "text-slate-300" : "text-gray-600"} uppercase w-[22%]`}>
                    Reported By
                  </th>
                  <th className={`text-left px-4 py-3 text-xs font-bold ${isDark ? "text-slate-300" : "text-gray-600"} uppercase w-[22%]`}>
                    Incident Number
                  </th>
                </tr>
              </thead>
              <tbody>
                {paginatedData.length > 0 ? (
                  paginatedData.map((inc) => (
                    <tr
                      key={inc.id}
                      onClick={() => setSelectedIncident(inc)}
                      className={`border-b ${t.cardBorder} ${isDark ? "hover:bg-slate-200 hover:text-slate-800" : "hover:bg-gray-50"} transition-colors cursor-pointer`}
                    >
                      <td className={`px-4 py-3 ${t.cardText} truncate`}>
                        {inc.type}
                      </td>
                      <td
                        className={`px-4 py-3 ${t.subtleText} truncate`}
                        title={inc.details}
                      >
                        {inc.details}
                      </td>
                      <td className={`px-4 py-3 ${t.cardText} whitespace-nowrap`}>
                        {new Date(inc.date).toLocaleDateString("en-US", {
                          month: "2-digit",
                          day: "2-digit",
                          year: "numeric",
                        })}
                      </td>
                      <td className={`px-4 py-3 ${t.cardText} truncate`}>
                        {inc.reportedBy}
                      </td>
                      <td className={`px-4 py-3 font-bold ${t.cardText}`}>
                        {inc.id}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={5}
                      className={`px-4 py-8 text-center ${t.subtleText}`}
                    >
                      No incidents found for the selected filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className={`flex items-center justify-between pt-4 border-t ${isDark ? "border-slate-700" : "border-gray-100"} mt-2`}>
                <p className={`text-xs ${t.subtleText} font-kumbh`}>
                  Showing {(currentPage - 1) * ROWS_PER_PAGE + 1}–
                  {Math.min(currentPage * ROWS_PER_PAGE, filteredTableData.length)}{" "}
                  of {filteredTableData.length} results
                </p>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className={`px-3 py-1.5 rounded-lg text-xs font-kumbh font-semibold transition-colors ${
                      currentPage === 1
                        ? isDark ? "text-slate-600 cursor-not-allowed" : "text-gray-300 cursor-not-allowed"
                        : isDark ? "text-slate-300 hover:bg-slate-200 hover:text-slate-800" : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    Prev
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (page) => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`w-8 h-8 rounded-lg text-xs font-kumbh font-bold transition-colors ${
                          page === currentPage
                            ? "bg-green-700 text-white"
                            : isDark ? "text-slate-300 hover:bg-slate-200 hover:text-slate-800" : "text-gray-600 hover:bg-gray-100"
                        }`}
                      >
                        {page}
                      </button>
                    ),
                  )}
                  <button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className={`px-3 py-1.5 rounded-lg text-xs font-kumbh font-semibold transition-colors ${
                      currentPage === totalPages
                        ? isDark ? "text-slate-600 cursor-not-allowed" : "text-gray-300 cursor-not-allowed"
                        : isDark ? "text-slate-300 hover:bg-slate-200 hover:text-slate-800" : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Map Section ──────────────────────────────────────────── */}
        <div
          className={`${t.cardBg} border ${t.cardBorder} rounded-2xl shadow-lg overflow-hidden`}
        >
          <div className="flex flex-col lg:flex-row">
            {/* Map Legend / Filters */}
            <div className={`lg:w-[280px] flex-shrink-0 p-5 border-b lg:border-b-0 lg:border-r ${isDark ? "border-slate-700" : "border-gray-200"}`}>
              {/* Legend header */}
              <div className="flex items-center gap-2 mb-5">
                <svg
                  className={`w-6 h-6 ${isDark ? "text-green-400" : "text-green-600"}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                  />
                </svg>
                <h3 className={`text-lg font-bold ${isDark ? "text-green-400" : "text-green-700"} font-spartan uppercase`}>
                  Map Legend
                </h3>
              </div>

              {/* Type Filter */}
              <div className="mb-4">
                <label className={`block text-xs font-bold ${isDark ? "text-slate-300" : "text-gray-600"} mb-1.5 font-kumbh uppercase`}>
                  Type of Incident
                </label>
                <select
                  value={mapType}
                  onChange={(e) => setMapType(e.target.value)}
                  className={`w-full px-3 py-2 rounded-lg border ${t.cardBorder} text-sm font-kumbh ${t.cardText} focus:outline-none focus:ring-2 focus:ring-green-500`}
                >
                  {INCIDENT_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type.toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date Range */}
              <div className="mb-5">
                <label className={`block text-xs font-bold ${isDark ? "text-slate-300" : "text-gray-600"} mb-1.5 font-kumbh uppercase`}>
                  Date
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="date"
                    value={mapStartDate}
                    onChange={(e) => setMapStartDate(e.target.value)}
                    className={`flex-1 px-2 py-2 rounded-lg border ${t.cardBorder} text-xs font-kumbh ${t.cardText} focus:outline-none focus:ring-2 focus:ring-green-500`}
                  />
                  <span className={`text-xs ${t.subtleText}`}>-</span>
                  <input
                    type="date"
                    value={mapEndDate}
                    onChange={(e) => setMapEndDate(e.target.value)}
                    className={`flex-1 px-2 py-2 rounded-lg border ${t.cardBorder} text-xs font-kumbh ${t.cardText} focus:outline-none focus:ring-2 focus:ring-green-500`}
                  />
                </div>
              </div>

              {/* Status toggles */}
              <div className="space-y-3">
                {/* Resolved */}
                <div
                  className={`p-3 rounded-lg border ${visibleStatuses.resolved ? (isDark ? "border-green-400 bg-green-50" : "border-green-300 bg-green-50") : (isDark ? "border-slate-600" : "border-gray-200")} transition-colors`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full bg-green-500" />
                      <span className={`text-sm font-bold ${visibleStatuses.resolved && isDark ? "text-green-800" : "text-green-700"} font-kumbh`}>
                        RESOLVED
                      </span>
                    </div>
                    <button
                      onClick={() => toggleStatus("resolved")}
                      className={`${isDark ? "text-slate-400 hover:text-slate-800 hover:bg-slate-200" : "text-gray-400 hover:text-gray-600"} rounded p-0.5 transition-colors`}
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        {visibleStatuses.resolved ? (
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                          />
                        ) : (
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M3 3l18 18"
                          />
                        )}
                      </svg>
                    </button>
                  </div>
                  <p className={`text-xs ${visibleStatuses.resolved && isDark ? "text-gray-600" : "text-gray-500"} font-kumbh`}>
                    Issue has been cleared or fixed
                  </p>
                </div>

                {/* Dispatched */}
                <div
                  className={`p-3 rounded-lg border ${visibleStatuses.dispatched ? (isDark ? "border-amber-400 bg-amber-50" : "border-amber-300 bg-amber-50") : (isDark ? "border-slate-600" : "border-gray-200")} transition-colors`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full bg-amber-400" />
                      <span className={`text-sm font-bold ${visibleStatuses.dispatched && isDark ? "text-amber-800" : "text-amber-700"} font-kumbh`}>
                        DISPATCHED
                      </span>
                    </div>
                    <button
                      onClick={() => toggleStatus("dispatched")}
                      className={`${isDark ? "text-slate-400 hover:text-slate-800 hover:bg-slate-200" : "text-gray-400 hover:text-gray-600"} rounded p-0.5 transition-colors`}
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        {visibleStatuses.dispatched ? (
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                          />
                        ) : (
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M3 3l18 18"
                          />
                        )}
                      </svg>
                    </button>
                  </div>
                  <p className={`text-xs ${visibleStatuses.dispatched && isDark ? "text-gray-600" : "text-gray-500"} font-kumbh`}>
                    Barangay officials dispatched on the site to check.
                  </p>
                </div>

                {/* In-Progress / Active */}
                <div
                  className={`p-3 rounded-lg border ${visibleStatuses.active ? (isDark ? "border-blue-400 bg-blue-50" : "border-blue-300 bg-blue-50") : (isDark ? "border-slate-600" : "border-gray-200")} transition-colors`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full bg-blue-600" />
                      <span className={`text-sm font-bold ${visibleStatuses.active && isDark ? "text-blue-800" : "text-blue-700"} font-kumbh`}>
                        IN-PROGRESS
                      </span>
                    </div>
                    <button
                      onClick={() => toggleStatus("active")}
                      className={`${isDark ? "text-slate-400 hover:text-slate-800 hover:bg-slate-200" : "text-gray-400 hover:text-gray-600"} rounded p-0.5 transition-colors`}
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        {visibleStatuses.active ? (
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                          />
                        ) : (
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M3 3l18 18"
                          />
                        )}
                      </svg>
                    </button>
                  </div>
                  <p className={`text-xs ${visibleStatuses.active && isDark ? "text-gray-600" : "text-gray-500"} font-kumbh`}>
                    Barangay officials or maintenance teams are on-site.
                  </p>
                </div>

                {/* New / Active (pending) */}
                <div
                  className={`p-3 rounded-lg border ${visibleStatuses.pending ? (isDark ? "border-red-400 bg-red-50" : "border-red-300 bg-red-50") : (isDark ? "border-slate-600" : "border-gray-200")} transition-colors`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full bg-red-500" />
                      <span className={`text-sm font-bold ${visibleStatuses.pending && isDark ? "text-red-800" : "text-red-700"} font-kumbh`}>
                        NEW/ACTIVE
                      </span>
                    </div>
                    <button
                      onClick={() => toggleStatus("pending")}
                      className={`${isDark ? "text-slate-400 hover:text-slate-800 hover:bg-slate-200" : "text-gray-400 hover:text-gray-600"} rounded p-0.5 transition-colors`}
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        {visibleStatuses.pending ? (
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                          />
                        ) : (
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M3 3l18 18"
                          />
                        )}
                      </svg>
                    </button>
                  </div>
                  <p className={`text-xs ${visibleStatuses.pending && isDark ? "text-gray-600" : "text-gray-500"} font-kumbh`}>
                    Issue recently reported and awaiting dispatch.
                  </p>
                </div>
              </div>
            </div>

            {/* Map */}
            <div className="flex-1 min-h-[450px]">
              <MapContainer
                center={MAP_CENTER}
                zoom={15}
                minZoom={13}
                maxZoom={18}
                scrollWheelZoom={true}
                style={{ height: "100%", width: "100%", minHeight: "450px" }}
                className="z-0"
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {/* Barangay boundary */}
                <Polygon
                  positions={BARANGAY_BOUNDARY}
                  pathOptions={{
                    color: "#1d4ed8",
                    fillColor: "#3b82f6",
                    fillOpacity: 0.05,
                    weight: 3,
                    dashArray: "8 4",
                  }}
                />

                {/* Incident markers */}
                {filteredMapData.map((inc) => {
                  const cfg = STATUS_CONFIG[inc.status];
                  return (
                    <CircleMarker
                      key={inc.id}
                      center={[inc.lat, inc.lng]}
                      radius={8}
                      pathOptions={{
                        color: "#fff",
                        fillColor: cfg.color,
                        fillOpacity: 1,
                        weight: 2,
                      }}
                    >
                      <Popup>
                        <div className="font-kumbh" style={{ minWidth: 180 }}>
                          <p className="font-bold text-sm mb-1">{inc.type}</p>
                          <p className="text-xs text-gray-600 mb-1">
                            {inc.details}
                          </p>
                          <p className="text-xs text-gray-500">
                            {inc.date} &middot;{" "}
                            <span
                              className="font-semibold"
                              style={{ color: cfg.color }}
                            >
                              {cfg.label}
                            </span>
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            ID: {inc.id}
                          </p>
                        </div>
                      </Popup>
                    </CircleMarker>
                  );
                })}
              </MapContainer>
            </div>
          </div>
        </div>
      </div>

      {/* ── Incident Detail Modal ───────────────────────────────────── */}
      <AdminReportDetailsModal
        incident={selectedIncident}
        onClose={() => setSelectedIncident(null)}
      />
    </div>
  );
};

export default AdminIncidentReports;
