import corpusFile from './curated/corpus.json';

export interface CuratedPublication {
  id: string;
  title: string;
  publicationDate: string;
  sourceUrl: string;
  sourceLanguage: string;
}

export interface CuratedPassage {
  id: string;
  publicationId: string;
  /** Exact text copied from the cited section. */
  text: string;
  reference: string;
  sourceUrl: string;
  sourceLanguage: string;
}

export interface CuratedCorpus {
  corpusId: string;
  source: string;
  note: string;
  publications: CuratedPublication[];
  passages: CuratedPassage[];
}

export const curatedCorpus = corpusFile as CuratedCorpus;

const REQUIRED_PUBLICATION = ['id', 'title', 'publicationDate', 'sourceUrl', 'sourceLanguage'] as const;
const REQUIRED_PASSAGE = ['id', 'publicationId', 'text', 'reference', 'sourceUrl', 'sourceLanguage'] as const;

export function validateCuratedCorpus(corpus: CuratedCorpus = curatedCorpus): string[] {
  const errors: string[] = [];
  const publicationIds = new Set<string>();
  for (const publication of corpus.publications) {
    for (const key of REQUIRED_PUBLICATION) {
      if (!publication[key]?.trim()) errors.push(`${publication.id || '(publication)'}: missing ${key}`);
    }
    if (publicationIds.has(publication.id)) errors.push(`duplicate publication ${publication.id}`);
    publicationIds.add(publication.id);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(publication.publicationDate)) {
      errors.push(`${publication.id}: publicationDate is not YYYY-MM-DD`);
    }
  }
  const passageIds = new Set<string>();
  for (const passage of corpus.passages) {
    for (const key of REQUIRED_PASSAGE) {
      if (!passage[key]?.trim()) errors.push(`${passage.id || '(passage)'}: missing ${key}`);
    }
    if (passageIds.has(passage.id)) errors.push(`duplicate passage ${passage.id}`);
    passageIds.add(passage.id);
    if (!publicationIds.has(passage.publicationId)) {
      errors.push(`${passage.id}: unknown publication ${passage.publicationId}`);
    }
  }
  return errors;
}
