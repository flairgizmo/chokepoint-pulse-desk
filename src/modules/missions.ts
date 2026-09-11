import { GevShareLink, type GevShareState, type GevStyleUrl } from './GevShareLink';

export type SensorLook = 'FLIR' | 'NVG' | 'CRT' | 'NORMAL' | 'NOIR';

export interface MissionCamera {
  lat: number;
  lon: number;
  alt: number;
  heading: number;
  pitch: number;
  style: GevStyleUrl;
}

export interface Mission {
  id: string;
  title: string;
  region: string;
  /** One-line “what moved / why it matters” for gallery cards */
  pulseLine: string;
  /** Longer static ops brief for detail view — honest, not invented live numbers */
  opsBrief: string;
  /** Why this chokepoint matters commercially / strategically (public knowledge) */
  whyItMatters: string;
  /** Recommended GEV sensor look */
  sensorLook: SensorLook;
  sensorRationale: string;
  /** Shot / camera notes for the globe handoff */
  shotNotes: string;
  ethicsNote: string;
  camera: MissionCamera;
  /** Primary GEV overlay layer for share-link handoff (`l` token). */
  primaryLayer: 'ais' | 'flights';
  /** commercial_ok for static editorial; live overlays may differ */
  commercialOk: boolean;
  /** If true, card metrics are EXAMPLE placeholders only */
  exampleBadge: boolean;
  /** ISO timestamp of last editorial refresh (static desk copy) */
  editorialUpdated: string;
  tags: string[];
}

const ETHICS =
  'Public OSINT only. No CCTV, no classified sources, no invented live counts. Pair with local God\'s Eye View for the globe; this desk owns briefing cards and routing.';

export const MISSIONS: Mission[] = [
  {
    id: 'hormuz',
    title: 'Strait of Hormuz',
    region: 'Persian Gulf · Gulf of Oman',
    pulseLine:
      'Energy chokepoint watch — ~20% of global petroleum liquids transit this corridor. Desk holds a FLIR look for tanker lanes.',
    opsBrief:
      'The Strait of Hormuz remains the primary maritime gate between Persian Gulf crude/LNG export terminals and open-ocean routes. Editorial posture: monitor publicly reported AIS density near Bandar Abbas–Fujairah approaches, note any open-source disruption reporting, and hand a low-angle FLIR camera into God\'s Eye View for lane geometry — not for classified targeting. This card is a routing + narrative companion; vessel counts are not invented here.',
    whyItMatters:
      'Disruption here immediately reprices energy risk globally. Public desks track transit risk, insurance signals, and open AIS clustering — never fabricate tonnage figures.',
    sensorLook: 'FLIR',
    sensorRationale:
      'Thermal/FLIR accent separates warm hulls and infrastructure heat signatures against dark water for cinematic corridor reads.',
    shotNotes:
      'Alt ~42 km, pitch −42°, heading ~215° looking SW along the inbound tanker lane. Bloom off; HUD tactical optional.',
    ethicsNote: ETHICS,
    camera: {
      lat: 26.5667,
      lon: 56.25,
      alt: 42000,
      heading: 215,
      pitch: -42,
      style: 'flir',
    },
    primaryLayer: 'ais',
    commercialOk: true,
    exampleBadge: false,
    editorialUpdated: '2026-09-10T12:00:00.000Z',
    tags: ['energy', 'tanker', 'gulf'],
  },
  {
    id: 'malacca',
    title: 'Strait of Malacca',
    region: 'Andaman Sea · South China Sea approach',
    pulseLine:
      'Asia’s densest commercial sea lane — twin-stamp with Singapore approaches. CRT look for high-contrast traffic corridors.',
    opsBrief:
      'Malacca is the shortest sea route between the Indian Ocean and Pacific-bound Asia trade. Editorial posture: frame the strait as a congestion and piracy-awareness corridor using public AIS/ADS-B where available, and open into GEV with a CRT (retro) style for high-contrast lane reads. Do not invent queue spikes; when live feeds degrade, keep EXAMPLE chips honest.',
    whyItMatters:
      'A large share of East Asia–Europe container and energy traffic threads Malacca. Delay here cascades into Singapore, Port Klang, and beyond.',
    sensorLook: 'CRT',
    sensorRationale:
      'CRT/retro scan aesthetic emphasizes linear channel geometry and traffic filaments without implying thermal authority.',
    shotNotes:
      'Alt ~55 km over mid-strait (~2.5°N, 101.7°E), heading 140°, pitch −38°. Prefer photoreal map stack with CRT style.',
    ethicsNote: ETHICS,
    camera: {
      lat: 2.5,
      lon: 101.7,
      alt: 55000,
      heading: 140,
      pitch: -38,
      style: 'crt',
    },
    primaryLayer: 'ais',
    commercialOk: true,
    exampleBadge: false,
    editorialUpdated: '2026-09-10T12:00:00.000Z',
    tags: ['trade', 'container', 'asia'],
  },
  {
    id: 'suez',
    title: 'Suez Canal',
    region: 'Egypt · Red Sea · Mediterranean',
    pulseLine:
      'Canal throughput is the signal — Ever Given-class blockage risk is structural. NVG look for night corridor briefings.',
    opsBrief:
      'The Suez Canal compresses Asia–Europe maritime trade into a single engineered cut. Editorial posture: narrate queue risk, Red Sea diversion context from public reporting, and Port Said / Suez approaches. Hand GEV a night-vision (NVG) style for canal-axis shots. Thermal fire overlays from FIRMS require keys — without them, leave EXAMPLE and cite the source path.',
    whyItMatters:
      'Blockage or prolonged diversion around the Cape adds weeks of transit and measurable freight inflation. Public desks care about queue honesty, not rumor.',
    sensorLook: 'NVG',
    sensorRationale:
      'NVG/surveillance green accent reads as night ops along the canal cut and Red Sea approaches.',
    shotNotes:
      'Center ~30.45°N, 32.35°E, alt 28 km, heading 0° (north up the canal), pitch −48°. Scope feather soft.',
    ethicsNote: ETHICS,
    camera: {
      lat: 30.45,
      lon: 32.35,
      alt: 28000,
      heading: 0,
      pitch: -48,
      style: 'nvg',
    },
    primaryLayer: 'ais',
    commercialOk: true,
    exampleBadge: false,
    editorialUpdated: '2026-09-10T12:00:00.000Z',
    tags: ['canal', 'red-sea', 'europe-asia'],
  },
  {
    id: 'panama',
    title: 'Panama Canal',
    region: 'Central America · Pacific ↔ Atlantic',
    pulseLine:
      'Queue is the signal — drought and lock capacity constrain neo-Panamax throughput. Normal photoreal for lock geometry.',
    opsBrief:
      'Panama links Pacific and Atlantic liner trades through locks with hard capacity and draft constraints. Editorial posture: emphasize dwell/queue as the honest public signal when AIS is available; otherwise keep the card commercial_ok with static capacity context and EXAMPLE for live vessel counts. Open GEV in normal style, slightly elevated over the Gaillard Cut / Pedro Miguel area.',
    whyItMatters:
      'Draft restrictions and booking slots reshape US East Coast vs West Coast landbridge economics. Invented queue numbers destroy desk credibility.',
    sensorLook: 'NORMAL',
    sensorRationale:
      'Photoreal + normal style preserves lock and cut geometry for ops briefings without theatrical filters.',
    shotNotes:
      'Alt ~18 km at 9.08°N, −79.68°W, heading 310°, pitch −45°. Sharpen lightly optional in GEV.',
    ethicsNote: ETHICS,
    camera: {
      lat: 9.08,
      lon: -79.68,
      alt: 18000,
      heading: 310,
      pitch: -45,
      style: 'normal',
    },
    primaryLayer: 'ais',
    commercialOk: true,
    exampleBadge: false,
    editorialUpdated: '2026-09-10T12:00:00.000Z',
    tags: ['canal', 'americas', 'locks'],
  },
  {
    id: 'taiwan',
    title: 'Taiwan Strait',
    region: 'East Asia · Taiwan · Fujian approaches',
    pulseLine:
      'Semiconductor + strait transit watch — dual commercial and security narrative. Noir look for tense daylight briefings.',
    opsBrief:
      'The Taiwan Strait is both a busy commercial waterway and a high-attention security theater in open-source reporting. Editorial posture: separate trade-lane geometry from speculative military claims; use public AIS/ADS-B only when feeds respond; never invent sortie counts. Hand GEV a noir style for restrained, high-contrast briefing stills over the mid-strait.',
    whyItMatters:
      'Semiconductor supply chains and regional shipping insurance price this corridor continuously. Desk language stays OSINT-disciplined.',
    sensorLook: 'NOIR',
    sensorRationale:
      'Noir grade (URL name noir) for tense daylight contrast on photoreal map stack — restrained briefing stills.',
    shotNotes:
      'Mid-strait ~24.5°N, 119.5°E, alt 65 km, heading 25°, pitch −40°. Style=noir for briefing stills.',
    ethicsNote: ETHICS,
    camera: {
      lat: 24.5,
      lon: 119.5,
      alt: 65000,
      heading: 25,
      pitch: -40,
      style: 'noir',
    },
    primaryLayer: 'flights',
    commercialOk: true,
    exampleBadge: false,
    editorialUpdated: '2026-09-10T12:00:00.000Z',
    tags: ['strait', 'semiconductors', 'east-asia'],
  },
];

export class MissionBook {
  static all(): Mission[] {
    return MISSIONS;
  }

  static byId(id: string): Mission | undefined {
    return MISSIONS.find((m) => m.id === id);
  }

  static toShareState(mission: Mission, overrides: Partial<GevShareState> = {}): GevShareState {
    const style =
      mission.sensorLook === 'FLIR'
        ? 'flir'
        : mission.sensorLook === 'NVG'
          ? 'nvg'
          : mission.sensorLook === 'CRT'
            ? 'crt'
            : mission.sensorLook === 'NOIR'
              ? 'noir'
              : mission.camera.style;

    return {
      lat: mission.camera.lat,
      lon: mission.camera.lon,
      alt: mission.camera.alt,
      heading: mission.camera.heading,
      pitch: mission.camera.pitch,
      style: overrides.style ?? style,
      bloom: false,
      sharpen: false,
      hud: 'tactical',
      hudVisible: true,
      detectionMode: 'OFF',
      map: 'photoreal',
      enabledLayers: [mission.primaryLayer],
      ...overrides,
    };
  }

  static gevUrl(mission: Mission, baseUrl?: string): string {
    return GevShareLink.buildUrl(MissionBook.toShareState(mission), { baseUrl });
  }
}
