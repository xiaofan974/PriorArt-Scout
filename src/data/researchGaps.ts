import type { ResearchGaps } from '../types/investigation';

/** SYNTHETIC DEMONSTRATION DATA — illustrative research gaps for the helmet example. */
export const researchGaps: ResearchGaps = {
  featureNotes: [
  {
    featureId: 'F04',
    note: 'No single document describes an impact-triggered notification sent automatically to a designated personal contact. The evidence is split: DEMO-PAT-002 is automatic but alerts a monitoring service, and DEMO-PAT-003 alerts designated contacts but is triggered manually.'
  },
  {
    featureId: 'F05',
    note: 'Location data appears only as cellular-derived (DEMO-PAT-002) or from unspecified positioning services on the phone itself (DEMO-PAT-003). No document specifically discloses GPS coordinates relayed through a connected smartphone.'
  },
  {
    featureId: 'F06',
    note: 'Only DEMO-PAT-002 describes cancelling a pending alert, and its window is 30 seconds rather than 15. No document describes a 15-second cancellation window.'
  }],

  ambiguities: [
  '“Genuine accidents” is not defined. The criteria, metrics (linear or rotational), and thresholds used to separate accidents from normal movement are unspecified.',
  'It is unclear whether the helmet or the connected smartphone performs the accident classification.',
  '“Designated contact” could mean a personal contact, emergency services, or a monitoring service. This changes how F04 is compared.',
  'What happens after the 15-second window, such as retries or escalation, is not described.'],

  coverageLimitations: [
  'Only a fixed corpus of three synthetic demonstration documents was searched. No live patent databases were queried.',
  'Non-patent literature such as academic papers, product manuals, and standards was not searched.',
  'Only English-language text was considered.',
  'Synonyms such as “head-mounted”, “crash sensor”, “false alarm”, or “SOS” were not expanded into additional queries.'],

  nextSteps: [
  {
    title: 'Search for combined disclosures',
    detail: 'Look for documents that combine head-mounted inertial sensing with automatic alerts to personal contacts (addresses F04).'
  },
  {
    title: 'Clarify the location pathway',
    detail: 'Search specifically for GPS coordinates relayed from a wearable through a paired smartphone (addresses F05).'
  },
  {
    title: 'Investigate cancellation windows',
    detail: 'Search for user-cancellable emergency alerts and the timing windows they disclose (addresses F06).'
  },
  {
    title: 'Refine the invention description',
    detail: 'Define the accident classification criteria and which device performs it before running a broader search.'
  },
  {
    title: 'Consult a qualified professional',
    detail: 'Review these findings with a patent attorney or agent before making any filing decisions.'
  }]

};