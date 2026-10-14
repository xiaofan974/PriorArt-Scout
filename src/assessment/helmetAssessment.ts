import { curatedCorpus } from '../data/curatedCorpus';
import { exampleInvention, features as helmetFeatures } from '../data/demoInvestigation';
import type {
  AssessmentGap,
  CandidateDocument,
  EvidenceAssessment,
  InvestigationResult,
  ResearchGaps,
  SearchQuery,
  SourcePassage,
  TraceStep
} from '../types/investigation';
import { retrieveCuratedPassages } from '../retrieval/curatedRetrieve';

export const ASSESSMENT_FIXTURE_ID = 'curated-helmet-assessment-v1';

function provenance(passageId: string): string {
  return `${ASSESSMENT_FIXTURE_ID}/${passageId}`;
}

/**
 * Human-reviewed relationship between the helmet features and stored corpus passages.
 * Explanations use only what the cited passage states. Keyword overlap is not treated as disclosure.
 */
export const helmetAssessments: EvidenceAssessment[] = [
  {
    featureId: 'F01',
    publicationId: 'US10897947B2',
    passageId: 'US10897947B2-C1',
    assessment: 'partial_overlap',
    explanation:
      'Claim 1 is a smart helmet falling-detection method. The stored claim does not state that the helmet is a bicycle helmet or a protective shell.',
    unresolvedDifferences: ['Bicycle use is not stated.', 'A protective shell is not stated.'],
    provenance: provenance('US10897947B2-C1')
  },
  {
    featureId: 'F01',
    publicationId: 'US11406152B2',
    passageId: 'US11406152B2-C1',
    assessment: 'partial_overlap',
    explanation:
      'Claim 1 describes an integrated smart helmet worn by a user. The stored claim does not state bicycle use or a protective shell.',
    unresolvedDifferences: ['Bicycle use is not stated.', 'A protective shell is not stated.'],
    provenance: provenance('US11406152B2-C1')
  },
  {
    featureId: 'F02',
    publicationId: 'US8860570B2',
    passageId: 'US8860570B2-C1',
    assessment: 'partial_overlap',
    explanation:
      'Claim 1 senses angular velocity during collision events and compares it with threshold values indicative of collision severity. The stored claim does not mention an accelerometer or a gyroscope.',
    unresolvedDifferences: [
      'An accelerometer is not named.',
      'A gyroscope is not named.',
      'The claim does not state that collision detection uses both accelerometer and gyroscope data.'
    ],
    provenance: provenance('US8860570B2-C1')
  },
  {
    featureId: 'F02',
    publicationId: 'US8860570B2',
    passageId: 'US8860570B2-C2',
    assessment: 'partial_overlap',
    explanation:
      'Claim 2 lists gyroscopes and 3-axis accelerometers among elements the sensor module may comprise. They are members of a group, and the claim does not state that collision detection uses accelerometer and gyroscope data together.',
    unresolvedDifferences: [
      'Combined use of an accelerometer and a gyroscope for collision detection is not stated.'
    ],
    provenance: provenance('US8860570B2-C2')
  },
  {
    featureId: 'F02',
    publicationId: 'US10897947B2',
    passageId: 'US10897947B2-C1',
    assessment: 'partial_overlap',
    explanation:
      'Claim 1 monitors acceleration of three axes and determines whether a collision condition occurs. The stored claim does not mention a gyroscope.',
    unresolvedDifferences: ['A gyroscope is not named.'],
    provenance: provenance('US10897947B2-C1')
  },
  {
    featureId: 'F03',
    publicationId: 'US8860570B2',
    passageId: 'US8860570B2-C1',
    assessment: 'insufficient_evidence',
    explanation:
      'Claim 1 compares angular-velocity information with threshold values indicative of collision severity. It does not state a distinction between genuine accidents, normal movements, and accidental drops.',
    unresolvedDifferences: [
      'Normal movements are not mentioned.',
      'Accidental drops are not mentioned.',
      'No method for separating those events from a collision is stated.'
    ],
    provenance: provenance('US8860570B2-C1')
  },
  {
    featureId: 'F03',
    publicationId: 'US10897947B2',
    passageId: 'US10897947B2-C1',
    assessment: 'insufficient_evidence',
    explanation:
      'Claim 1 determines a free-fall event, a collision condition, and a motionlessness event before generating an emergency signal. It does not state that those conditions distinguish genuine accidents from normal movements or accidental drops.',
    unresolvedDifferences: [
      'Normal movements are not mentioned.',
      'Accidental drops are not mentioned.',
      'The claim does not state that the conditions reject ordinary movement or a dropped helmet.'
    ],
    provenance: provenance('US10897947B2-C1')
  },
  {
    featureId: 'F03',
    publicationId: 'US11406152B2',
    passageId: 'US11406152B2-D-DROP',
    assessment: 'partial_overlap',
    explanation:
      'The stored sentence says the smart helmet may know when the helmet was accidentally dropped or when the user is involved in a fatal crash. It does not describe how that is determined, and it does not mention normal movements or accidents other than a fatal crash.',
    unresolvedDifferences: [
      'The method of distinguishing a drop from a crash is not stated.',
      'Normal movements are not mentioned.',
      'The sentence refers to a fatal crash, not every genuine accident.'
    ],
    provenance: provenance('US11406152B2-D-DROP')
  },
  {
    featureId: 'F04',
    publicationId: 'US8860570B2',
    passageId: 'US8860570B2-C1',
    assessment: 'partial_overlap',
    explanation:
      'Claim 1 says a separate communication device is programmed to provide a notification of a severe collision in response to a transmitted signal. It does not say the notification is sent automatically or to a designated contact.',
    unresolvedDifferences: [
      'Automatic sending without user action is not stated.',
      'A designated contact is not stated.'
    ],
    provenance: provenance('US8860570B2-C1')
  },
  {
    featureId: 'F04',
    publicationId: 'US10897947B2',
    passageId: 'US10897947B2-C1',
    assessment: 'partial_overlap',
    explanation:
      'Claim 1 generates an emergency signal according to whether a motionlessness event meets a condition. The stored claim does not describe notifying a designated contact.',
    unresolvedDifferences: ['A designated contact is not stated.', 'Automatic notification to a person is not stated.'],
    provenance: provenance('US10897947B2-C1')
  },
  {
    featureId: 'F04',
    publicationId: 'US10897947B2',
    passageId: 'US10897947B2-D-GPS',
    assessment: 'partial_overlap',
    explanation:
      'The description says a wireless communication module sends emergency information to a predetermined number via a mobile terminal associated with the smart helmet. It does not say the send happens automatically or identify the number as a designated emergency contact.',
    unresolvedDifferences: [
      'Automatic sending without user action is not stated.',
      'The predetermined number is not identified as a designated contact.'
    ],
    provenance: provenance('US10897947B2-D-GPS')
  },
  {
    featureId: 'F04',
    publicationId: 'US11406152B2',
    passageId: 'US11406152B2-C1',
    assessment: 'partial_overlap',
    explanation:
      'Claim 1 says the control unit notifies detected crash information to a computing device. It does not describe an emergency notification to a designated contact.',
    unresolvedDifferences: ['A designated contact is not stated.', 'An emergency notification to a person is not stated.'],
    provenance: provenance('US11406152B2-C1')
  },
  {
    featureId: 'F05',
    publicationId: 'US10897947B2',
    passageId: 'US10897947B2-D-GPS',
    assessment: 'partial_overlap',
    explanation:
      'The description says a GPS positioning module sends current geographical position information to the controller, and that emergency information carrying that position is sent via a mobile terminal associated with the smart helmet. It does not say GPS coordinates or a smartphone.',
    unresolvedDifferences: [
      'The words GPS coordinates are not used.',
      'A smartphone is not named.',
      'The passage does not state that the mobile terminal is a smartphone connected to the helmet.'
    ],
    provenance: provenance('US10897947B2-D-GPS')
  },
  {
    featureId: 'F06',
    publicationId: 'US10897947B2',
    passageId: 'US10897947B2-C6',
    assessment: 'partial_overlap',
    explanation:
      'Claim 6 generates an alarm cancellation signal that stops the emergency signal if a motionlessness event is not detected continuously three times. It does not describe a user cancellation or a 15-second window.',
    unresolvedDifferences: ['User cancellation is not stated.', 'A 15-second window is not stated.'],
    provenance: provenance('US10897947B2-C6')
  },
  {
    featureId: 'F06',
    publicationId: 'US11406152B2',
    passageId: 'US11406152B2-D-CANCEL',
    assessment: 'partial_overlap',
    explanation:
      'The stored sentence says the user may select the timer to cancel the SOS at step 1004. It does not state a duration, and it does not state 15 seconds.',
    unresolvedDifferences: [
      'A 15-second window is not stated.',
      'The stored sentence does not state how long the timer runs.'
    ],
    provenance: provenance('US11406152B2-D-CANCEL')
  }
];

export const helmetAssessmentGaps: AssessmentGap[] = [
  {
    featureId: 'F01',
    publicationId: 'US8860570B2',
    note: 'None of the stored passages call the system a helmet or a bicycle helmet.'
  },
  {
    featureId: 'F02',
    publicationId: 'US11406152B2',
    note: 'None of the stored passages mention an accelerometer or a gyroscope.'
  },
  {
    featureId: 'F05',
    publicationId: 'US8860570B2',
    note: 'None of the stored passages mention GPS, geographical position, or a smartphone.'
  },
  {
    featureId: 'F05',
    publicationId: 'US11406152B2',
    note: 'None of the stored passages mention GPS, geographical position, or a smartphone. The computing device in Claim 1 is not described as providing position.'
  },
  {
    featureId: 'F06',
    publicationId: 'US8860570B2',
    note: 'None of the stored passages describe cancelling a notification or an emergency signal.'
  }
];

const researchGaps: ResearchGaps = {
  featureNotes: [
    {
      featureId: 'F01',
      note: 'No stored passage states a protective bicycle helmet. Two claims use the words smart helmet and do not state bicycle use.'
    },
    {
      featureId: 'F02',
      note: 'No stored passage states collision detection that uses accelerometer data and gyroscope data together.'
    },
    {
      featureId: 'F03',
      note: 'No stored passage states a method that separates genuine accidents from normal movements and accidental drops.'
    },
    {
      featureId: 'F04',
      note: 'Stored passages describe a collision notification, an emergency signal, emergency information sent to a predetermined number, or crash information sent to a computing device. None states an automatic notification to a designated contact.'
    },
    {
      featureId: 'F05',
      note: 'One description sentence includes a GPS positioning module and a mobile terminal. It does not state GPS coordinates transmitted through a connected smartphone. The other two publications have no stored GPS passage.'
    },
    {
      featureId: 'F06',
      note: 'No stored passage states that a user can cancel an emergency alert within 15 seconds. Claim 6 cancels an emergency signal after repeated motionlessness checks. The other stored sentence lets a user select a timer to cancel an SOS and does not state the duration.'
    }
  ],
  ambiguities: [
    'The invention description does not define how accelerometer and gyroscope data are combined, or what counts as a genuine accident.'
  ],
  coverageLimitations: [
    'Curated evidence assessment — limited patent corpus. Three English-language publications and eight stored passages.',
    'This is not a comprehensive prior-art search or a legal opinion.',
    'Passages are Google Patents text with markup removed and whitespace collapsed. They are not a full-text reading of each publication.',
    'No assessment in this fixture is explicit overlap. Shared words were not treated as disclosure of the feature.'
  ],
  nextSteps: [
    {
      title: 'Read the publications beyond the stored passages',
      detail: 'The fixture cannot speak to claims or description paragraphs that are not in the curated corpus.'
    },
    {
      title: 'Search for the 15-second cancellation window',
      detail: 'That duration does not appear in any stored passage of this corpus.'
    }
  ]
};

function sectionFor(reference: string): SourcePassage['section'] {
  return reference.startsWith('Claim') ? 'Claim' : 'Description';
}

export function createHelmetAssessmentResult(): InvestigationResult {
  const documents: CandidateDocument[] = curatedCorpus.publications.map((publication, index) => {
    const passages: SourcePassage[] = curatedCorpus.passages
      .filter((passage) => passage.publicationId === publication.id)
      .map((passage) => ({
        id: passage.id,
        section: sectionFor(passage.reference),
        text: passage.text,
        reference: passage.reference
      }));
    return {
      id: publication.id,
      rank: index + 1,
      title: publication.title,
      abstract: `Publication date ${publication.publicationDate}. Included because it is in the curated corpus, not because of a relevance score.`,
      concepts: [...new Set(passages.map((passage) => passage.reference ?? 'Passage'))],
      relevance: 'low',
      summary: publication.sourceUrl,
      passages
    };
  });

  const retrieval = retrieveCuratedPassages(helmetFeatures);
  const searchQueries: SearchQuery[] = retrieval.map((row, index) => ({
    id: `Q${index + 1}`,
    concept: `Keyword retrieval for ${row.featureId}`,
    terms: row.queryTerms,
    featureIds: [row.featureId],
    retrievedDocumentIds: [...new Set(row.matches.map((match) => match.publicationId))]
  }));

  const traceSteps: TraceStep[] = [
    {
      id: 'features',
      label: 'Helmet features loaded from the reviewed fixture',
      tool: 'curated.features',
      result: 'Six technical features from the smart bicycle helmet description. No model extraction.',
      simulatedMs: 0
    },
    {
      id: 'retrieve',
      label: 'Curated corpus retrieved',
      tool: 'curated.retrieve',
      result: 'Keyword retrieval recorded separately from the assessment. Overlap is not a disclosure finding.',
      simulatedMs: 0
    },
    {
      id: 'assess',
      label: 'Reviewed assessment applied',
      tool: 'curated.assess',
      result: `${helmetAssessments.length} passage assessments and ${helmetAssessmentGaps.length} research gaps from ${ASSESSMENT_FIXTURE_ID}.`,
      simulatedMs: 0
    }
  ];

  return {
    invention: {
      ...exampleInvention,
      id: 'curated-inv-helmet'
    },
    mode: 'curated',
    features: helmetFeatures,
    searchQueries,
    documents,
    evidenceMatches: [],
    assessments: helmetAssessments,
    assessmentGaps: helmetAssessmentGaps,
    researchGaps,
    traceSteps,
    revealAfterStep: {
      features: 1,
      queries: 2,
      documents: 2,
      comparison: 3
    }
  };
}
