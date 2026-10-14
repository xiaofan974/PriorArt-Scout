import { curatedCorpus, type CuratedCorpus } from '../data/curatedCorpus';
import {
  MAX_MATCHES_PER_FEATURE,
  normalizeTerms,
  type CuratedPassageMatch,
  type FeatureRetrieval
} from '../retrieval/curatedRetrieve';
import type { TechnicalFeature } from '../types/investigation';

/** Experimental threshold. The production retriever remains at two shared terms. */
export const EXPERIMENT_MIN_KEYWORD_OVERLAP = 1;

/**
 * Same tokenizer, ranking, and three-hit cap as production retrieval.
 * A passage is kept when it shares at least one query term.
 */
export function retrieveWithOneKeywordOverlap(
  features: TechnicalFeature[],
  corpus: CuratedCorpus = curatedCorpus
): FeatureRetrieval[] {
  return features.map((feature) => {
    const queryTerms = normalizeTerms(feature.sourcePhrase.trim() || `${feature.label} ${feature.detail}`);
    const ranked = corpus.passages
      .map((passage) => {
        const passageTerms = new Set(normalizeTerms(passage.text));
        const matchedTerms = queryTerms.filter((term) => passageTerms.has(term));
        return { passage, matchedTerms, score: matchedTerms.length };
      })
      .filter((hit) => hit.score >= EXPERIMENT_MIN_KEYWORD_OVERLAP)
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
