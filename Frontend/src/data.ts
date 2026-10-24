export type ViewId = 'ingest' | 'rx' | 'spatial' | 'profiler' | 'segment' | 'reports'

export interface NavItem {
  view: ViewId
  num: string
  label: string
}

export const NAV_ITEMS: NavItem[] = [
  { view: 'ingest', num: '01', label: 'Cube Studio' },
  { view: 'rx', num: '02', label: 'RX Radar' },
  { view: 'spatial', num: '03', label: 'Spatial Refinement' },
  { view: 'profiler', num: '04', label: 'Spectral Profiler' },
  { view: 'segment', num: '05', label: 'Scene Segmentation' },
  { view: 'reports', num: '06', label: 'Intelligence Reports' },
]

export const CARD_DETAILS: [string, string, string][] = [
  ['01 / CUBE STUDIO', 'Hyperspectral Ingestion & Calibration', 'Ingest 200+ channel airborne cubes (Indian Pines, Salinas, Pavia), synthesize false-color RGB composites, and inspect spectral band distributions.'],
  ['02 / RX RADAR', 'Reed-Xiaoli Anomaly Detection', 'Execute unsupervised Mahalanobis distance background modeling to isolate anomalous spectral signatures and tune percentile sensitivity in real time.'],
  ['03 / SPATIAL REFINEMENT', 'Morphology & Target Bounding Boxes', 'Apply OpenCV morphological opening/closing filters to remove sensor noise and delineate discrete candidate targets with geospatial coordinates.'],
  ['04 / SPECTRAL PROFILER', '200-Band Signature Analysis', 'Cross-examine full-spectrum reflectance curves across 0.4µm - 2.5µm wavelengths, comparing anomalous targets against background baseline spectra.'],
  ['05 / SCENE SEGMENTATION', 'Unsupervised K-Means Clustering', 'Partition high-dimensional spectral feature spaces into cohesive agricultural crop categories, soil types, and hydrological zones.'],
  ['06 / INTELLIGENCE REPORTS', 'Mission Dossier & Anomaly Export', 'Generate intelligence reports, export structured JSON/CSV catalogs of target coordinates, confidence scores, and spectral metrics.'],
]

export interface DatasetOption {
  id: string
  name: string
  sensor: string
  dimensions: string
  bands: number
  wavelengthRange: string
  description: string
  spatialResolution: string
}

export const DATASET_OPTIONS: DatasetOption[] = [
  {
    id: 'pines',
    name: 'Indian Pines Benchmark (Pines_Dataset.mat)',
    sensor: 'AVIRIS Sensor (Airborne)',
    dimensions: '145 × 145 × 200 bands',
    bands: 200,
    wavelengthRange: '0.4 – 2.5 µm',
    description: 'Agricultural scene in Indiana containing fields, crops, and infrastructure. Loaded directly from Pines_Dataset.mat.',
    spatialResolution: '20m GSD',
  },
  {
    id: 'cave_thread',
    name: 'CAVE Thread Spools Multispectral',
    sensor: 'CAVE Spectral Camera',
    dimensions: '512 × 512 × 31 bands',
    bands: 31,
    wavelengthRange: '400 – 700 nm (10nm steps)',
    description: 'Columbia University CAVE lab spectral calibration scene containing thread spools across 31 visible bands.',
    spatialResolution: 'Laboratory Imaging',
  },
  {
    id: 'salinas',
    name: 'Salinas Valley Scene',
    sensor: 'AVIRIS Sensor (High-Res)',
    dimensions: '512 × 217 × 224 bands',
    bands: 224,
    wavelengthRange: '0.4 – 2.5 µm',
    description: 'Agricultural area in Salinas Valley, California comprising vineyards, vegetables, and bare soil.',
    spatialResolution: '3.7m GSD',
  },
  {
    id: 'pavia',
    name: 'Pavia University',
    sensor: 'ROSIS Sensor',
    dimensions: '610 × 340 × 103 bands',
    bands: 103,
    wavelengthRange: '0.43 – 0.86 µm',
    description: 'Urban scene captured over the University of Pavia, Italy, showing buildings, asphalt, trees, and meadows.',
    spatialResolution: '1.3m GSD',
  },
]

export interface CandidateRegion {
  id: number
  x: number
  y: number
  width: number
  height: number
  area: number
  centroid: [number, number]
  meanScore: number
  maxScore: number
  confidence: number
  classification: string
  spectralSignature: number[]
  backgroundSignature: number[]
}

export interface ClusterInfo {
  clusterId: number
  name: string
  color: string
  pixelCount: number
  percentage: number
  description: string
}

export interface HyperspectralTelemetry {
  datasetName: string
  sensor: string
  dimensions: { height: number; width: number; bands: number }
  totalPixels: number
  activeThreshold: number
  anomalyPixels: number
  anomalyPercent: number
  meanRxScore: number
  peakRxScore: number
  processingTimeMs: number
  candidateCount: number
  clusters: ClusterInfo[]
  candidates: CandidateRegion[]
}

// Generate realistic 200-band spectral signatures
export function generateSpectralBands(length = 200): number[] {
  const bands: number[] = []
  for (let i = 0; i < length; i++) {
    const wavelength = 400 + (i * (2500 - 400)) / length
    // Typical vegetation reflectance: low in blue/red, green bump (550nm), steep red edge (700nm), high NIR plateau (750-1300nm), water absorption dips (1400nm, 1900nm)
    let ref = 0.05
    if (wavelength < 500) ref = 0.04 + Math.sin(i / 10) * 0.01
    else if (wavelength < 650) ref = 0.12 - Math.abs(wavelength - 550) * 0.0006
    else if (wavelength < 750) ref = 0.1 + (wavelength - 650) * 0.004
    else if (wavelength < 1300) ref = 0.52 + Math.sin(i / 15) * 0.03
    else if (wavelength < 1500) ref = 0.28 - Math.sin((wavelength - 1300) / 100) * 0.15
    else if (wavelength < 1850) ref = 0.42 + Math.cos(i / 12) * 0.04
    else if (wavelength < 2100) ref = 0.22 - Math.sin((wavelength - 1850) / 100) * 0.12
    else ref = 0.35 + Math.sin(i / 8) * 0.03
    bands.push(Math.max(0.01, Math.min(0.95, ref)))
  }
  return bands
}

export function generateAnomalySignature(baseSignature: number[], offset = 0.2): number[] {
  return baseSignature.map((val, idx) => {
    // Anomalous artificial/manmade or stressed vegetation exhibits deviation in SWIR & NIR
    const bump = Math.sin(idx / 7) * 0.18 + (idx > 100 ? 0.22 : -0.08)
    return Math.max(0.02, Math.min(0.98, val + bump * offset))
  })
}

const baseBgSignature = generateSpectralBands(200)

export const MOCK_CANDIDATE_REGIONS: CandidateRegion[] = [
  {
    id: 1,
    x: 42,
    y: 88,
    width: 14,
    height: 12,
    area: 128,
    centroid: [48.5, 94.2],
    meanScore: 14.8,
    maxScore: 23.4,
    confidence: 98.6,
    classification: 'Sub-Pixel Synthetic Anomaly',
    spectralSignature: generateAnomalySignature(baseBgSignature, 1.2),
    backgroundSignature: baseBgSignature,
  },
  {
    id: 2,
    x: 104,
    y: 32,
    width: 18,
    height: 16,
    area: 214,
    centroid: [112.4, 39.8],
    meanScore: 12.6,
    maxScore: 19.8,
    confidence: 96.2,
    classification: 'High-Reflectance Target',
    spectralSignature: generateAnomalySignature(baseBgSignature, 0.9),
    backgroundSignature: baseBgSignature,
  },
  {
    id: 3,
    x: 76,
    y: 118,
    width: 10,
    height: 11,
    area: 86,
    centroid: [81.0, 123.5],
    meanScore: 11.2,
    maxScore: 16.5,
    confidence: 92.4,
    classification: 'Thermal / Chemical Stress Outlier',
    spectralSignature: generateAnomalySignature(baseBgSignature, 0.75),
    backgroundSignature: baseBgSignature,
  },
  {
    id: 4,
    x: 22,
    y: 44,
    width: 8,
    height: 9,
    area: 54,
    centroid: [26.1, 48.3],
    meanScore: 9.7,
    maxScore: 14.1,
    confidence: 88.9,
    classification: 'Mineral / Surface Disruption',
    spectralSignature: generateAnomalySignature(baseBgSignature, 0.6),
    backgroundSignature: baseBgSignature,
  },
  {
    id: 5,
    x: 128,
    y: 92,
    width: 9,
    height: 10,
    area: 68,
    centroid: [132.3, 97.0],
    meanScore: 9.1,
    maxScore: 13.8,
    confidence: 87.5,
    classification: 'Soil Disturbance Anomaly',
    spectralSignature: generateAnomalySignature(baseBgSignature, 0.55),
    backgroundSignature: baseBgSignature,
  },
]

export const MOCK_CLUSTERS: ClusterInfo[] = [
  {
    clusterId: 1,
    name: 'Dense Crop Canopy (Corn / Soy)',
    color: '#34D399',
    pixelCount: 8420,
    percentage: 40.1,
    description: 'High chlorophyll absorption in blue/red, prominent green peak and sharp NIR reflection plateau.',
  },
  {
    clusterId: 2,
    name: 'Tillaged & Mineral Soil',
    color: '#F59E0B',
    pixelCount: 5610,
    percentage: 26.7,
    description: 'Steady monotonically increasing reflectance curve across visible into shortwave infrared.',
  },
  {
    clusterId: 3,
    name: 'Riparian & Hay-Windrowed Meadow',
    color: '#818CF8',
    pixelCount: 4215,
    percentage: 20.0,
    description: 'Moderate NIR amplitude with pronounced moisture absorption features at 1.4µm and 1.9µm.',
  },
  {
    clusterId: 4,
    name: 'Built Infrastructure & Roads',
    color: '#EC4899',
    pixelCount: 2780,
    percentage: 13.2,
    description: 'Flat, uniform spectral response characteristic of asphalt, compacted gravel, and synthetic surfaces.',
  },
]

export const INITIAL_TELEMETRY: HyperspectralTelemetry = {
  datasetName: 'Pines_Dataset.mat',
  sensor: 'AVIRIS Airborne Sensor',
  dimensions: { height: 145, width: 145, bands: 200 },
  totalPixels: 21025,
  activeThreshold: 5,
  anomalyPixels: 1051,
  anomalyPercent: 5.0,
  meanRxScore: 2.14,
  peakRxScore: 23.4,
  processingTimeMs: 38.6,
  candidateCount: 5,
  clusters: MOCK_CLUSTERS,
  candidates: MOCK_CANDIDATE_REGIONS,
}
