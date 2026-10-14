import { deriveTitle } from '../utils/deriveTitle';
import { curatedCorpus } from './curatedCorpus';
import { EMPTY_RESEARCH_GAPS } from './liveResult';
import { retrieveCuratedPassages, type FeatureRetrieval } from '../retrieval/curatedRetrieve';
import type {
  CandidateDocument,
  InvestigationResult,
  SearchQuery,
  SourcePassage,
  TechnicalFeature
} from '../types/investigation';

const MAX_QUERY_FEATURES = 6;

/** Split a description into exact substrings used as keyword-search features. Not model extraction. */
export function featuresFromDescription(description: string): TechnicalFeature[] {
  const features: TechnicalFeature[] = [];
  const pattern = /[^.!?]+[.!?]+|[^.!?]+$/g;
  for (const match of description.matchAll(pattern)) {
    const sourcePhrase = match[0].trim();
    if (sourcePhrase.length < 20) continue;
    if (!description.includes(sourcePhrase)) continue;
    const index = String(features.length + 1).padStart(2, '0');
    features.push({
      id: `F${index}`,
      label: 'Description segment',
      detail: 'Used only as a keyword query against the curated corpus.',
      sourcePhrase
    });
    if (features.length >= MAX_QUERY_FEATURES) break;
  }
  if (features.length === 0 && description.trim().length > 0) {
    features.push({
      id: 'F01',
      label: 'Description segment',
      detail: 'Used only as a keyword query against the curated corpus.',
      sourcePhrase: description.trim()
    });
  }
  return features;
}

export function createCuratedResearchResult(description: string): InvestigationResult {
  const features = featuresFromDescription(description);
  const retrieval = retrieveCuratedPassages(features);
  const matchedPassageIds = new Set(retrieval.flatMap((row) => row.matches.map((match) => match.passageId)));
  const publications = curatedCorpus.publications.filter((publication) =>
    curatedCorpus.passages.some(
      (passage) => passage.publicationId === publication.id && matchedPassageIds.has(passage.id)
    )
  );

  const documents: CandidateDocument[] = publications.map((publication, index) => {
    const passages: SourcePassage[] = curatedCorpus.passages
      .filter((passage) => passage.publicationId === publication.id && matchedPassageIds.has(passage.id))
      .map((passage) => ({
        id: passage.id,
        section: 'Description' as const,
        text: passage.text,
        reference: passage.reference
      }));
    return {
      id: publication.id,
      rank: index + 1,
      title: publication.title,
      abstract: `Publication date ${publication.publicationDate}. Limited curated corpus. Keyword overlap is not a disclosure finding.`,
      concepts: [...new Set(passages.map((passage) => passage.reference ?? 'Passage'))],
      relevance: 'low',
      summary: publication.sourceUrl,
      passages
    };
  });

  const searchQueries: SearchQuery[] = retrieval.map((row, index) => ({
    id: `Q${index + 1}`,
    concept: `Keyword overlap for ${row.featureId}`,
    terms: row.queryTerms,
    featureIds: [row.featureId],
    retrievedDocumentIds: [...new Set(row.matches.map((match) => match.publicationId))]
  }));

  const hitCount = retrieval.reduce((sum, row) => sum + row.matches.length, 0);
  const noMatchCount = retrieval.filter((row) => row.noMatch).length;

  return {
    invention: {
      id: 'curated-research',
      title: deriveTitle(description),
      description
    },
    mode: 'curated',
    features,
    searchQueries,
    documents,
    evidenceMatches: [],
    researchGaps: {
      ...EMPTY_RESEARCH_GAPS,
      coverageLimitations: [
        'Searches only the preselected curated patent passages. This is not comprehensive prior-art coverage.',
        'Keyword overlap is not proof that a publication discloses a technical feature.'
      ]
    },
    traceSteps: [
      {
        id: 'T1',
        label: 'Description segments prepared',
        tool: 'curated.segment',
        result: `${features.length} description segment${features.length === 1 ? '' : 's'} used as keyword queries. No model was called.`,
        simulatedMs: 0
      },
      {
        id: 'T2',
        label: 'Curated corpus searched',
        tool: 'curated.retrieve',
        result: `${hitCount} keyword overlap${hitCount === 1 ? '' : 's'} across ${documents.length} publication${documents.length === 1 ? '' : 's'}. ${noMatchCount} segment${noMatchCount === 1 ? '' : 's'} had no match.`,
        simulatedMs: 0
      }
    ],
    revealAfterStep: {
      features: 0,
      queries: 0,
      documents: 0,
      comparison: 99
    }
  };
}

export function curatedRetrievalForResult(description: string): FeatureRetrieval[] {
  return retrieveCuratedPassages(featuresFromDescription(description));
}
