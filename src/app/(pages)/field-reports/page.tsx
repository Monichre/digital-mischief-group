import { FieldReports } from "@/components/reports/field-report/field-reports"


// Mock data - replace with actual database query or API fetch
const mockCampaigns = [
  {
    id: 'aar-47-redline',
    title: 'Operation Nightfall',
    fileRef: 'AAR-47/Θ-REDLINE',
    ref: 'SIGINT-Δ / IMG-SEC-12',
    documentType: 'EXPERIMENTAL',
    logEntry: '#47-ALPHA',
    operation: 'NIGHTFALL',
    date: '1972-11-03Z',
    status: 'REDACTED',
    clearance: 'TS/SCI',
    location: '35.6895° N / 139.6917° E',
    altitude: '0.15km',
    variant: 'recon' as const,
    plates: [
      {
        label: 'PLATE I',
        code: 'OBS-SCN/014-FO',
        imageSrc: '/images/footballs.jpg',
        alt: 'Floating oval, football-shaped unidentified objects above horizon',
      },
      {
        label: 'PLATE II',
        code: 'AAR/SECT-III/EXP-Σ',
        imageSrc: null, // Empty state
        alt: 'After-action report section III experimental',
      },
      {
        label: 'PLATE III',
        code: 'NOC/THERM-TRACE/009',
        imageSrc: '/images/night-fire.jpg',
        alt: 'Nighttime fire with industrial silhouettes',
      },
    ],
  },
  {
    id: 'contact-sigma',
    title: 'Contact Report Sigma',
    fileRef: 'CR-89/Δ-SIGMA',
    ref: 'SIGINT-Σ / CONTACT-22',
    documentType: 'CONTACT',
    logEntry: '#89-DELTA',
    operation: 'CONTACT SIGMA',
    date: '1973-04-22Z',
    status: 'ACTIVE',
    clearance: 'SECRET',
    location: '40.7128° N / 74.0060° W',
    altitude: '0.08km',
    variant: 'impact' as const,
    trafficStatus: 'SATURATED',
    plates: [
      {
        label: 'PLATE I',
        code: 'OBS-SCN/089-FO',
        imageSrc: '/images/footballs.jpg',
        alt: 'Contact observation scan',
      },
      {
        label: 'PLATE II',
        code: 'CONTACT/SIGMA/EXP-Δ',
        imageSrc: '/images/explosion.jpg',
        alt: 'Expansive smoke plumes and debris from explosive combat scene',
      },
    ],
  },
  {
    id: 'blackout-12',
    title: 'Operation Blackout',
    fileRef: 'OP-12/Ω-BLACKOUT',
    ref: 'NOC-TRACE / BLACKOUT-12',
    documentType: 'BLACKOUT',
    logEntry: '#12-OMEGA',
    operation: 'BLACKOUT',
    date: '1974-08-15Z',
    status: 'TERMINATED',
    clearance: 'TOP SECRET',
    location: '51.5074° N / 0.1278° W',
    altitude: '0.22km',
    variant: 'blackout' as const,
    plates: [
      {
        label: 'PLATE I',
        code: 'BLACKOUT/SECT-I',
        imageSrc: '/images/night-fire.jpg',
        alt: 'Nighttime fire with industrial silhouettes',
      },
    ],
  },
]

export default function FieldReportsPage() {
  return <FieldReports campaigns={mockCampaigns} />
}
