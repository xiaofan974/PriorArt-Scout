import type { EvidenceMatch } from '../types/investigation';

/**
 * SYNTHETIC DEMONSTRATION DATA.
 * Every supported / partial match references a passage stored in data/demoInvestigation.ts.
 * Excerpts are resolved from those passages at render time, never duplicated here.
 */

const absenceCaveat = 'Absence in this demonstration document does not indicate absence in the wider literature.';

export const evidenceMatches: EvidenceMatch[] = [
// F01 — Wearable protective bicycle helmet
{
  featureId: 'F01',
  documentId: 'DEMO-PAT-001',
  status: 'supported',
  passageId: 'P1',
  explanation:
  'The document describes headgear with an outer shell and an energy-absorbing liner, which corresponds to a wearable protective helmet.',
  limitations: ['The document refers to protective headgear generally and does not specify bicycle use.']
},
{
  featureId: 'F01',
  documentId: 'DEMO-PAT-002',
  status: 'partial',
  passageId: 'P1',
  explanation:
  'The device is wearable, but it attaches to a belt, wrist, or clothing rather than being integrated into protective headgear.',
  limitations: ['No stored passage describes head protection or a helmet form factor.']
},
{
  featureId: 'F01',
  documentId: 'DEMO-PAT-003',
  status: 'not_established',
  explanation: 'The document describes a mobile application and does not describe a wearable protective device.',
  limitations: [absenceCaveat]
},

// F02 — Collision detection using accelerometer and gyroscope data
{
  featureId: 'F02',
  documentId: 'DEMO-PAT-001',
  status: 'supported',
  passageId: 'P2',
  explanation:
  'The passage explicitly discloses a three-axis accelerometer and a three-axis gyroscope sampling linear and rotational head acceleration.',
  limitations: ['This passage covers sensing; the event-detection logic is described separately in passage P3.']
},
{
  featureId: 'F02',
  documentId: 'DEMO-PAT-002',
  status: 'partial',
  passageId: 'P2',
  explanation:
  'Impact detection relies on an accelerometer signal. No gyroscope or rotational sensing is described.',
  limitations: ['The full document may describe additional sensors outside the stored demonstration passages.']
},
{
  featureId: 'F02',
  documentId: 'DEMO-PAT-003',
  status: 'not_established',
  explanation: 'No stored passage describes collision detection from inertial sensor data.',
  limitations: [absenceCaveat]
},

// F03 — Distinguishing genuine accidents from normal movements or accidental drops
{
  featureId: 'F03',
  documentId: 'DEMO-PAT-001',
  status: 'partial',
  passageId: 'P3',
  explanation:
  'Events are graded by severity using acceleration thresholds, which separates large impacts from small ones. The passage does not describe rejecting normal movements or a dropped helmet.',
  limitations: ['Severity grading is not the same as classifying an event as a genuine accident.']
},
{
  featureId: 'F03',
  documentId: 'DEMO-PAT-002',
  status: 'supported',
  passageId: 'P6',
  explanation:
  'Brief signals caused by the device being dropped or bumped are explicitly excluded from fall detection, which corresponds to distinguishing genuine accidents from accidental drops.',
  limitations: ['The rejection logic is described for a body-worn device, not for a helmet.']
},
{
  featureId: 'F03',
  documentId: 'DEMO-PAT-003',
  status: 'not_established',
  explanation: 'The document does not describe detecting or classifying impacts.',
  limitations: [absenceCaveat]
},

// F04 — Automatic emergency notification
{
  featureId: 'F04',
  documentId: 'DEMO-PAT-001',
  status: 'partial',
  passageId: 'P4',
  explanation:
  'Event records are transmitted to a paired device, but for later review rather than as an emergency notification to a contact.',
  limitations: ['No automatic alerting or emergency recipient is described.']
},
{
  featureId: 'F04',
  documentId: 'DEMO-PAT-002',
  status: 'partial',
  passageId: 'P4',
  explanation:
  'An alert is sent automatically if not cancelled, but it goes to a monitoring service rather than a designated personal contact.',
  limitations: ['Whether a monitoring service is equivalent to a designated contact requires interpretation.']
},
{
  featureId: 'F04',
  documentId: 'DEMO-PAT-003',
  status: 'partial',
  passageId: 'P2',
  explanation:
  'Notifications are sent to designated contacts, but they are triggered manually or by a check-in timer rather than by a detected impact.',
  limitations: ['The trigger mechanism differs from the invention; it would need to be read together with an impact-detection document.']
},

// F05 — GPS coordinates transmitted through a connected smartphone
{
  featureId: 'F05',
  documentId: 'DEMO-PAT-001',
  status: 'not_established',
  explanation: 'No stored passage describes location data of any kind.',
  limitations: [absenceCaveat]
},
{
  featureId: 'F05',
  documentId: 'DEMO-PAT-002',
  status: 'partial',
  passageId: 'P5',
  explanation:
  'The alert may include an approximate location, but it is derived from the cellular network rather than GPS. Passage P4 separately states that alerts are sent via a paired smartphone.',
  limitations: ['Location is described as optional (“may further include”).']
},
{
  featureId: 'F05',
  documentId: 'DEMO-PAT-003',
  status: 'partial',
  passageId: 'P3',
  explanation:
  'Each notification sent from the mobile device includes its location. Satellite positioning is listed as one possible source, but GPS is not specifically required, and the phone is the primary device rather than a connected relay.',
  limitations: ['The location source depends on what is available on the device at the time.']
},

// F06 — User cancellation of emergency alert within 15 seconds
{
  featureId: 'F06',
  documentId: 'DEMO-PAT-001',
  status: 'not_established',
  explanation: 'No stored passage describes a pending alert or a way to cancel one.',
  limitations: [absenceCaveat]
},
{
  featureId: 'F06',
  documentId: 'DEMO-PAT-002',
  status: 'partial',
  passageId: 'P4',
  explanation:
  'The wearer can cancel the alert before it is transmitted, but the cancellation window is 30 seconds rather than 15 seconds.',
  limitations: ['Whether the window length is a meaningful technical difference requires further analysis.']
},
{
  featureId: 'F06',
  documentId: 'DEMO-PAT-003',
  status: 'not_established',
  explanation:
  'The check-in timer requires the user to reset it to prevent a notification, which is not described as cancelling an alert that has already been triggered.',
  limitations: [absenceCaveat]
}];