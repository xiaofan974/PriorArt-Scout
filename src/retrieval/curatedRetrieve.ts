import { curatedCorpus, type CuratedCorpus, type CuratedPassage } from '../data/curatedCorpus';
import type { TechnicalFeature } from '../types/investigation';

/** Minimum distinct keyword overlap before a passage is returned. Overlap is not disclosure. */
export const MIN_KEYWORD_OVERLAP = 2;
export const MAX_MATCHES_PER_FEATURE = 3;

const STOP_WORDS = new Set([
  'the', 'and', 'for', 'with', 'that', 'this', 'from', 'are', 'was', 'were', 'has', 'have',
  'not', 'but', 'its', 'into', 'over', 'than', 'then', 'also', 'such', 'using', 'used',
  'via', 'each', 'when', 'which', 'while', 'within', 'without', 'about', 'after', 'before',
  'said', 'one', 'more', 'other'
]);

export interface CuratedPassageMatch {
  featureId: string;
  passageId: string;
  publicationId: string;
  score: number;
  matchedTerms: string[];
  /** Identical to the stored passage text. */
  text: string;
  reference: string;
  sourceUrl: string;
  basis: 'keyword_overlap';
}

export interface FeatureRetrieval {
  featureId: string;
  queryTerms: string[];
  matches: CuratedPassageMatch[];
  /** True when no passage met the overlap threshold. */
  noMatch: boolean;
}

export function normalizeTerms(text: string): string[] {
  const tokens = text.toLowerCase().match(/[a-z0-9]+/g) ?? [];
  const terms: string[] = [];
  const seen = new Set<string>();
  for (const token of tokens) {
    if (token.length < 3 || STOP_WORDS.has(token) || seen.has(token)) continue;
    seen.add(token);
    terms.push(token);
  }
  return terms;
}

function featureQuery(feature: TechnicalFeature): string {
  return feature.sourcePhrase.trim() || `${feature.label} ${feature.detail}`;
}

function scorePassage(queryTerms: string[], passage: CuratedPassage): string[] {
  const passageTerms = new Set(normalizeTerms(passage.text));
  return queryTerms.filter((term) => passageTerms.has(term));
}

export function retrieveCuratedPassages(
  features: TechnicalFeature[],
  corpus: CuratedCorpus = curatedCorpus
): FeatureRetrieval[] {
  return features.map((feature) => {
    const queryTerms = normalizeTerms(featureQuery(feature));
    const ranked = corpus.passages
      .map((passage) => {
        const matchedTerms = scorePassage(queryTerms, passage);
        return { passage, matchedTerms, score: matchedTerms.length };
      })
      .filter((hit) => hit.score >= MIN_KEYWORD_OVERLAP)
      .sort((a, b) => b.score - a.score || a.passage.id.localeCompare(b.passage.id));

    const seen = new Set<string>();
    const matches: CuratedPassageMatch[] = [];
    for (const hit of ranked) {
      if (seen.has(hit.passage.id)) continue;
      seen.add(hit.passage.id);
      matches.push({
        featureId: feature.id,
        passageId: hit.passage.id,
        publicationId: hit.passage.publicationId,
        score: hit.score,
        matchedTerms: hit.matchedTerms,
        text: hit.passage.text,
        reference: hit.passage.reference,
        sourceUrl: hit.passage.sourceUrl,
        basis: 'keyword_overlap'
      });
      if (matches.length >= MAX_MATCHES_PER_FEATURE) break;
    }

    return {
      featureId: feature.id,
      queryTerms,
      matches,
      noMatch: matches.length === 0
    };
  });
}
