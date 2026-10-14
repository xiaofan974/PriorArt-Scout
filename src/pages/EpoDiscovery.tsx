import { ArrowRightIcon, ExternalLinkIcon, RotateCcwIcon } from 'lucide-react';
import type { EpoSearchPayload } from '../epo/contract';

interface EpoDiscoveryProps {
  query: string;
  status: 'epo_searching' | 'epo_ready' | 'epo_failed';
  result: EpoSearchPayload | null;
  error: string | null;
  onStartNew: () => void;
}

export function EpoDiscovery({ query, status, result, error, onStartNew }: EpoDiscoveryProps) {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <p className="font-mono text-[11px] text-ink-3">EPO Open Patent Services</p>
      <h1 className="mt-1.5 text-2xl font-semibold tracking-[-0.01em] text-ink">
        Live patent discovery — no evidence assessment performed
      </h1>
      <p className="mt-2 text-sm leading-relaxed text-ink-2">
        Retrieved publication records are not compared with the invention, and they are not added to the synthetic
        demonstration or the curated corpus. The evidence report stays unavailable.
      </p>

      <dl className="mt-6 rounded-xl border border-line bg-white px-4 py-3">
        <div className="grid gap-1 sm:grid-cols-[140px_minmax(0,1fr)]">
          <dt className="text-xs font-medium text-ink-3">Source</dt>
          <dd className="text-[13px] text-ink">EPO OPS</dd>
          <dt className="mt-2 text-xs font-medium text-ink-3 sm:mt-0">Search query</dt>
          <dd className="font-mono text-[13px] text-ink">{query}</dd>
        </div>
      </dl>

      {status === 'epo_searching' &&
      <p className="mt-4 text-[13px] text-ink-2" aria-live="polite">Searching EPO OPS…</p>}

      {status === 'epo_failed' &&
      <p className="mt-4 rounded-lg border border-partial-line bg-partial-soft px-4 py-3 text-[13px] text-ink-2" role="alert">
          {error ?? 'EPO OPS search could not be completed.'}
        </p>}

      {result &&
      <section className="mt-6" aria-labelledby="epo-records-heading">
          <h2 id="epo-records-heading" className="text-sm font-semibold text-ink">
            Retrieved patent records
            <span className="ml-2 font-mono text-xs font-normal text-ink-3">
              {result.resultCount} returned
              {result.totalResultCount !== null ? ` · ${result.totalResultCount} reported` : ''}
            </span>
          </h2>
          {result.records.length === 0 ?
          <p className="mt-3 text-[13px] text-ink-2">EPO OPS returned no publication records for this query.</p> :
          <ul className="mt-3 divide-y divide-line rounded-xl border border-line bg-white">
              {result.records.map((record) =>
              <li key={record.publicationId} className="px-4 py-3">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <p className="font-mono text-[13px] font-medium text-ink">{record.publicationId}</p>
                    <a
                      href={record.sourceUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-[13px] font-medium text-accent hover:text-accent-hover">
                      Inspect on Espacenet
                      <ExternalLinkIcon className="h-3.5 w-3.5" aria-hidden="true" />
                    </a>
                  </div>
                  <p className="mt-1 text-[13px] text-ink">{record.title ?? 'Title not returned by OPS'}</p>
                  <p className="mt-1 text-[12px] text-ink-3">
                    {record.publicationDate ?? 'Date not returned'}
                    {record.applicants.length > 0 ? ` · ${record.applicants.join('; ')}` : ' · Applicant not returned'}
                  </p>
                  {record.abstract &&
                  <p className="mt-2 text-[13px] leading-relaxed text-ink-2">{record.abstract}</p>}
                </li>
              )}
            </ul>}
          <ul className="mt-4 space-y-1.5">
            {result.limitations.map((limitation) =>
            <li key={limitation} className="text-[12px] leading-relaxed text-ink-3">{limitation}</li>
            )}
          </ul>
        </section>}

      <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-6">
        <button
          type="button"
          onClick={onStartNew}
          className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-[13px] font-medium text-ink-2 transition-colors duration-150 hover:bg-subtle hover:text-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-accent">
          <RotateCcwIcon className="h-3.5 w-3.5" aria-hidden="true" />
          Start new investigation
        </button>
        <span className="inline-flex items-center gap-2 rounded-lg bg-ink-4 px-4 py-2 text-[13px] font-medium text-white">
          Evidence report unavailable
          <ArrowRightIcon className="h-3.5 w-3.5" aria-hidden="true" />
        </span>
      </div>
    </div>
  );
}
