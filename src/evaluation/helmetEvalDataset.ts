/**
 * Draft relevance labels for the six helmet features against curated-helmet-v1.
 * Prepared in Cursor from the stored passages and the curated assessment fixture.
 * They are not an independent human review. Overlap is not relevance, and a
 * relevant passage is not a finding that the feature is disclosed.
 *
 * Difficult case 6 covers passages that share technical vocabulary with a feature
 * without stating the feature. Those passage IDs are listed as irrelevant.
 */
export const EVAL_LABEL_STATUS =
  'Draft labels prepared in Cursor from the stored corpus and the curated assessment fixture. They have not had an independent human review.';
export interface FeatureEvalCase {
  featureId: string;
  description: string;
  /** Passages a reviewer expects retrieval to surface for this feature. */
  relevantPassageIds: string[];
  /** Passages that are not evidence for this feature, including keyword traps. */
  irrelevantPassageIds: string[];
  /** Exact substrings of the cited passage. They are the details the passage does state. */
  expectedDetails: { passageId: string; quotes: string[] }[];
  /** Caveats that must appear in the assessment's unresolved differences. */
  missingDetails: string[];
  /** Publications with no relevant stored passage. */
  expectedGapPublicationIds: string[];
  rationale: string;
}

export const HELMET_EVAL_DATASET_ID = 'curated-helmet-eval-v1';

export const helmetEvalCases: FeatureEvalCase[] = [
  {
    featureId: 'F01',
    description: 'Wearable protective bicycle helmet. A head-worn protective shell intended for cyclists.',
    relevantPassageIds: [
      'US10897947B2-C1',
      'US10897947B2-C6',
      'US10897947B2-D-GPS',
      'US11406152B2-C1',
      'US11406152B2-D-DROP'
    ],
    irrelevantPassageIds: ['US8860570B2-C1', 'US8860570B2-C2'],
    expectedDetails: [
      { passageId: 'US10897947B2-C1', quotes: ['smart helmet'] },
      { passageId: 'US11406152B2-C1', quotes: ['smart helmet'] }
    ],
    missingDetails: ['Bicycle use is not stated.', 'A protective shell is not stated.'],
    expectedGapPublicationIds: ['US8860570B2'],
    rationale:
      'Five stored passages say smart helmet. None states a bicycle helmet or a protective shell. The assessment cites one claim from each helmet publication. The head-impact system never calls the apparatus a helmet, so collision vocabulary alone is not relevance.'
  },
  {
    featureId: 'F02',
    description:
      'Collision detection using accelerometer and gyroscope data. Inertial sensing of linear and rotational motion to detect a collision event.',
    relevantPassageIds: ['US8860570B2-C1', 'US8860570B2-C2', 'US10897947B2-C1'],
    irrelevantPassageIds: ['US11406152B2-C1', 'US11406152B2-D-DROP'],
    expectedDetails: [
      { passageId: 'US8860570B2-C1', quotes: ['angular velocity', 'collision events'] },
      { passageId: 'US8860570B2-C2', quotes: ['gyroscopes', '3-axis accelerometers'] },
      { passageId: 'US10897947B2-C1', quotes: ['acceleration of three axes', 'collision even'] }
    ],
    missingDetails: [
      'An accelerometer is not named.',
      'A gyroscope is not named.',
      'Combined use of an accelerometer and a gyroscope for collision detection is not stated.'
    ],
    expectedGapPublicationIds: ['US11406152B2'],
    rationale:
      'Claim 2 lists gyroscopes and accelerometers as optional group members. Claim 1 of the same patent senses angular velocity and does not name either sensor. The smart-helmet claim monitors three-axis acceleration and a collision condition, and does not name a gyroscope. Crash-detection text that names neither sensor is irrelevant.'
  },
  {
    featureId: 'F03',
    description:
      'Distinguishing genuine accidents from normal movements or accidental drops. Separating real crash events from everyday head movement or a dropped helmet.',
    relevantPassageIds: ['US11406152B2-D-DROP'],
    irrelevantPassageIds: ['US8860570B2-C1', 'US10897947B2-C1'],
    expectedDetails: [
      {
        passageId: 'US11406152B2-D-DROP',
        quotes: ['accidentally dropped your helmet', 'fatal crash']
      }
    ],
    missingDetails: [
      'The method of distinguishing a drop from a crash is not stated.',
      'Normal movements are not mentioned.',
      'The sentence refers to a fatal crash, not every genuine accident.'
    ],
    expectedGapPublicationIds: [],
    rationale:
      'Only one stored sentence mentions an accidental drop and a fatal crash. Severity thresholds and free-fall, collision, and motionlessness conditions use related words and do not state that distinction. Those passages are irrelevant for this feature even though the assessment records them as insufficient evidence.'
  },
  {
    featureId: 'F04',
    description:
      'Automatic emergency notification. A notification sent without user action to a designated contact.',
    relevantPassageIds: ['US8860570B2-C1', 'US10897947B2-C1', 'US10897947B2-D-GPS', 'US11406152B2-C1'],
    irrelevantPassageIds: ['US8860570B2-C2', 'US10897947B2-C6', 'US11406152B2-D-CANCEL'],
    expectedDetails: [
      { passageId: 'US8860570B2-C1', quotes: ['notification of a severe collision'] },
      { passageId: 'US10897947B2-C1', quotes: ['generating an emergency signal'] },
      { passageId: 'US10897947B2-D-GPS', quotes: ['emergency information', 'predetermined number'] },
      { passageId: 'US11406152B2-C1', quotes: ['notify the crash detected information'] }
    ],
    missingDetails: [
      'Automatic sending without user action is not stated.',
      'A designated contact is not stated.'
    ],
    expectedGapPublicationIds: [],
    rationale:
      'Each publication has a stored notification or emergency signal. None states an automatic notification to a designated contact. Sensor lists and cancellation sentences are not notification evidence. Four relevant passages exceed the retrieval cap of three, so recall cannot be complete.'
  },
  {
    featureId: 'F05',
    description:
      'GPS coordinates transmitted through a connected smartphone. Satellite-derived position relayed to the contact via a paired phone.',
    relevantPassageIds: ['US10897947B2-D-GPS'],
    irrelevantPassageIds: ['US8860570B2-C1', 'US11406152B2-C1'],
    expectedDetails: [
      {
        passageId: 'US10897947B2-D-GPS',
        quotes: ['GPS positioning module', 'geographical position information', 'mobile terminal']
      }
    ],
    missingDetails: [
      'The words GPS coordinates are not used.',
      'A smartphone is not named.',
      'The passage does not state that the mobile terminal is a smartphone connected to the helmet.'
    ],
    expectedGapPublicationIds: ['US8860570B2', 'US11406152B2'],
    rationale:
      'One description sentence has a GPS positioning module and a mobile terminal. It does not say GPS coordinates or a smartphone. A communication device and a computing device share the idea of another device and do not disclose this transmission path.'
  },
  {
    featureId: 'F06',
    description:
      'User cancellation of emergency alert within 15 seconds. The rider can stop a pending alert during a 15-second window.',
    relevantPassageIds: ['US10897947B2-C6', 'US11406152B2-D-CANCEL'],
    irrelevantPassageIds: ['US8860570B2-C1', 'US10897947B2-C1'],
    expectedDetails: [
      { passageId: 'US10897947B2-C6', quotes: ['alarm cancellation signal'] },
      { passageId: 'US11406152B2-D-CANCEL', quotes: ['cancel the SOS'] }
    ],
    missingDetails: ['User cancellation is not stated.', 'A 15-second window is not stated.'],
    expectedGapPublicationIds: ['US8860570B2'],
    rationale:
      'Claim 6 cancels an emergency signal after three motionlessness checks and does not describe a user or a duration. The other sentence lets a user select a timer to cancel an SOS and does not state 15 seconds. Generating or notifying an emergency signal is not cancellation.'
  }
];
