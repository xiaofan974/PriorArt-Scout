import type {
  CandidateDocument,
  Invention,
  SearchQuery,
  TechnicalFeature,
  TraceStep } from
'../types/investigation';

/**
 * SYNTHETIC DEMONSTRATION DATA.
 * Documents below are fictional and exist only to demonstrate the workflow.
 * They are not real patents and carry no official identifiers.
 */

export const exampleInvention: Invention = {
  id: 'demo-inv-helmet',
  title: 'Smart bicycle helmet with automatic collision alert',
  description:
  'A smart bicycle helmet that detects collisions using accelerometer and gyroscope data, distinguishes genuine accidents from normal movements or accidental drops, and automatically sends an emergency notification to a designated contact. The notification includes GPS coordinates transmitted through a connected smartphone. The rider can cancel the emergency alert within 15 seconds if no assistance is needed.'
};

/**
 * Every `sourcePhrase` MUST be an exact, verbatim substring of `exampleInvention.description`.
 * This is checked at runtime by `utils/sourcePhrase.ts` (see `validateSourcePhrases`).
 */
export const features: TechnicalFeature[] = [
{
  id: 'F01',
  label: 'Wearable protective bicycle helmet',
  detail: 'A head-worn protective shell intended for cyclists.',
  sourcePhrase: 'smart bicycle helmet'
},
{
  id: 'F02',
  label: 'Collision detection using accelerometer and gyroscope data',
  detail: 'Inertial sensing of linear and rotational motion to detect a collision event.',
  sourcePhrase: 'detects collisions using accelerometer and gyroscope data'
},
{
  id: 'F03',
  label: 'Distinguishing genuine accidents from normal movements or accidental drops',
  detail: 'Separating real crash events from everyday head movement or a dropped helmet.',
  sourcePhrase: 'distinguishes genuine accidents from normal movements or accidental drops'
},
{
  id: 'F04',
  label: 'Automatic emergency notification',
  detail: 'A notification sent without user action to a designated contact.',
  sourcePhrase: 'automatically sends an emergency notification to a designated contact'
},
{
  id: 'F05',
  label: 'GPS coordinates transmitted through a connected smartphone',
  detail: 'Satellite-derived position relayed to the contact via a paired phone.',
  sourcePhrase: 'GPS coordinates transmitted through a connected smartphone'
},
{
  id: 'F06',
  label: 'User cancellation of emergency alert within 15 seconds',
  detail: 'The rider can stop a pending alert during a 15-second window.',
  sourcePhrase: 'cancel the emergency alert within 15 seconds'
}];


export const searchQueries: SearchQuery[] = [
{
  id: 'Q1',
  concept: 'Smart helmet collision detection using inertial sensors',
  terms: ['helmet', 'accelerometer', 'gyroscope', 'impact detection'],
  featureIds: ['F01', 'F02', 'F03'],
  retrievedDocumentIds: ['DEMO-PAT-001', 'DEMO-PAT-002']
},
{
  id: 'Q2',
  concept: 'Wearable impact detection with automatic emergency alerts',
  terms: ['wearable', 'false-positive rejection', 'automatic alert', 'cancel window'],
  featureIds: ['F02', 'F03', 'F04', 'F06'],
  retrievedDocumentIds: ['DEMO-PAT-002', 'DEMO-PAT-001']
},
{
  id: 'Q3',
  concept: 'Protective headgear with GPS-enabled emergency notification',
  terms: ['headgear', 'GPS', 'paired smartphone', 'emergency notification'],
  featureIds: ['F01', 'F04', 'F05'],
  retrievedDocumentIds: ['DEMO-PAT-003', 'DEMO-PAT-001']
}];


export const documents: CandidateDocument[] = [
{
  id: 'DEMO-PAT-001',
  rank: 1,
  title: 'Sensor-Based Protective Headgear Monitoring System',
  abstract:
  'Protective headgear with an embedded inertial sensor module records linear and rotational head motion. An onboard processor compares peak values against thresholds to classify impact severity, and event records are transmitted to a paired device for review.',
  concepts: ['Protective headgear', 'Accelerometer', 'Gyroscope', 'Impact severity'],
  relevance: 'high',
  summary:
  'Strongest overlap with the sensing side of the invention. Discloses a helmet with accelerometer and gyroscope and severity classification, but event data is sent for later review rather than as an emergency notification, and no location data or cancellation is described.',
  passages: [
  {
    id: 'P1',
    section: 'Summary',
    text: 'The protective headgear comprises an outer shell, an energy-absorbing liner, and a sensor module mounted within the liner.'
  },
  {
    id: 'P2',
    section: 'Description',
    text: "The sensor module includes a three-axis accelerometer and a three-axis gyroscope configured to sample linear and rotational acceleration of the wearer's head at a rate of at least 1 kHz."
  },
  {
    id: 'P3',
    section: 'Description',
    text: 'The processor compares peak linear acceleration and peak rotational velocity against configurable thresholds and assigns each recorded event a severity category of low, moderate, or high.'
  },
  {
    id: 'P4',
    section: 'Description',
    text: 'Event records, including the assigned severity category, are transmitted to a paired mobile device for later review by the wearer or a supervising coach.'
  },
  {
    id: 'P5',
    section: 'Description',
    text: 'Accumulated event records may be displayed as a cumulative impact history to support return-to-activity decisions.'
  }]

},
{
  id: 'DEMO-PAT-002',
  rank: 2,
  title: 'Wearable Impact Detection and Emergency Alert Device',
  abstract:
  'A compact wearable device detects falls and impacts from accelerometer signals and rejects brief signals caused by drops or bumps. Events exceeding a higher threshold are flagged as potential injuries, and an alert is sent to a monitoring service unless the wearer cancels it within a countdown period.',
  concepts: ['Wearable device', 'Fall detection', 'Drop rejection', 'Cancellable alert'],
  relevance: 'medium',
  summary:
  'Closest match on separating real falls from drops, automatic alerting, and alert cancellation, but the device is not a helmet, uses accelerometer data only, allows 30 seconds rather than 15 to cancel, and alerts a monitoring service with cellular-derived location.',
  passages: [
  {
    id: 'P1',
    section: 'Summary',
    text: 'The device is housed in a compact enclosure that may be attached to a belt, worn on the wrist, or clipped to clothing.'
  },
  {
    id: 'P2',
    section: 'Description',
    text: 'An accelerometer generates a motion signal, and a fall is detected when the magnitude of the signal exceeds a first threshold followed by a period of low motion.'
  },
  {
    id: 'P3',
    section: 'Description',
    text: 'When the detected impact exceeds a second, higher threshold, the event is flagged as a potential injury event.'
  },
  {
    id: 'P4',
    section: 'Description',
    text: 'If the wearer does not cancel the alert within 30 seconds, the device transmits an alert message to a monitoring service via a paired smartphone.'
  },
  {
    id: 'P5',
    section: 'Description',
    text: 'The alert message may further include an approximate location derived from the cellular network.'
  },
  {
    id: 'P6',
    section: 'Description',
    text: 'Brief high-magnitude signals that are not followed by a period of low motion, such as those produced when the device is dropped or bumped, are not treated as falls.'
  }]

},
{
  id: 'DEMO-PAT-003',
  rank: 3,
  title: 'Location-Aware Safety Notification System',
  abstract:
  'A mobile safety application lets users register designated contacts. Notifications containing the device’s last reported location are sent upon a manual trigger or when a check-in timer expires without being reset.',
  concepts: ['Designated contacts', 'Safety notification', 'Device location', 'Check-in timer'],
  relevance: 'low',
  summary:
  'Relevant only to the notification side. Sends location-bearing notifications from a smartphone to designated contacts, but triggering is manual or timer-based rather than impact-based, and GPS is one of several possible location sources.',
  passages: [
  {
    id: 'P1',
    section: 'Summary',
    text: 'A safety application executing on a mobile device allows the user to register one or more designated contacts to receive safety notifications.'
  },
  {
    id: 'P2',
    section: 'Description',
    text: 'A notification is sent to each designated contact upon a manual trigger by the user or upon expiry of a check-in timer that the user has not reset.'
  },
  {
    id: 'P3',
    section: 'Description',
    text: "Each notification includes the device's last reported location, determined by the positioning services available on the device, which may include satellite, Wi-Fi, or cellular sources."
  }]

}];


const featureRange = `${features[0].id}–${features[features.length - 1].id}`;
const queryRange = `${searchQueries[0].id}–${searchQueries[searchQueries.length - 1].id}`;

export const traceSteps: TraceStep[] = [
{
  id: 'T1',
  label: 'Invention description received',
  tool: 'intake.receive',
  result: 'Plain-language description accepted for analysis.',
  simulatedMs: 600
},
{
  id: 'T2',
  label: 'Six technical features extracted',
  tool: 'features.extract',
  result: `${featureRange} identified, each linked to an exact source phrase.`,
  simulatedMs: 1100
},
{
  id: 'T3',
  label: 'Three search queries generated',
  tool: 'search.plan',
  result: `${queryRange} cover ${features.length} of ${features.length} features.`,
  simulatedMs: 900
},
{
  id: 'T4',
  label: 'Patent corpus searched',
  tool: 'corpus.search',
  result: `Demonstration corpus · ${searchQueries.length} queries executed.`,
  simulatedMs: 1300
},
{
  id: 'T5',
  label: 'Three candidate documents retrieved',
  tool: 'corpus.retrieve',
  result: 'DEMO-PAT-001, -002, -003 ranked by feature overlap.',
  simulatedMs: 800
},
{
  id: 'T6',
  label: 'Feature comparison completed',
  tool: 'evidence.compare',
  result: `${features.length * documents.length} feature–document pairs assessed.`,
  simulatedMs: 1200
},
{
  id: 'T7',
  label: 'Evidence validation completed',
  tool: 'evidence.validate',
  result: 'Cited excerpts and source phrases checked against stored text.',
  simulatedMs: 900
}];


/** Trace step counts after which each workspace section becomes available. */
export const revealAfterStep = {
  features: 2,
  queries: 3,
  documents: 5,
  comparison: 6
} as const;