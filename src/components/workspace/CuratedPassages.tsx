import type { FeatureRetrieval } from '../../retrieval/curatedRetrieve';
import { curatedCorpus } from '../../data/curatedCorpus';

interface CuratedPassagesProps {
  retrieval: FeatureRetrieval[];
}

export function CuratedPassages({ retrieval }: CuratedPassagesProps) {
  const publications = new Map(curatedCorpus.publications.map((publication) => [publication.id, publication]));

  return (
    <div className="space-y-4">
      {retrieval.map((row) =>
      <section key={row.featureId} className="rounded-xl border border-line bg-white px-4 py-4 sm:px-5" aria-label={`${row.featureId} curated matches`}>
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h3 className="font-mono text-xs font-medium text-ink-2">{row.featureId}</h3>
            <p className="text-[12px] text-ink-3">
              {row.noMatch ? 'No keyword overlap above the threshold' : `${row.matches.length} passage${row.matches.length === 1 ? '' : 's'}`}
            </p>
          </div>
          {row.noMatch ?
          <p className="mt-2 text-[13px] leading-relaxed text-ink-2">
              No curated passage matched this segment. Absence here is not evidence that the feature is new.
            </p> :

          <ul className="mt-3 space-y-3">
              {row.matches.map((match) => {
                const publication = publications.get(match.publicationId);
                return (
                  <li key={match.passageId} className="rounded-lg bg-canvas px-3 py-3">
                    <p className="text-[12px] font-medium text-ink">
                      {publication?.title ?? match.publicationId}
                    </p>
                    <p className="mt-0.5 font-mono text-[11px] text-ink-3">
                      {match.publicationId} · {match.reference} · overlap {match.score}
                    </p>
                    <blockquote className="mt-2 border-l-2 border-line-strong pl-3 text-[13px] leading-relaxed text-ink-2">
                      {match.text}
                    </blockquote>
                    <p className="mt-2 text-[11px] leading-snug text-ink-3">
                      Keyword overlap only. This is not a finding that the publication discloses the feature.
                    </p>
                    <a
                      href={match.sourceUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-1 inline-block text-[12px] font-medium text-accent hover:text-accent-hover">
                      Google Patents
                    </a>
                  </li>
                );
              })}
            </ul>
          }
        </section>
      )}
    </div>
  );
}
