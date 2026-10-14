import { documents, features } from '../data/demoInvestigation';
import { researchGaps } from '../data/researchGaps';
import { featuresNeedingInvestigation, resolveEvidence } from './evidence';
import { statusStyles } from './matchStatus';

export const LIMITATIONS_NOTICE =
'This report is generated from a limited demonstration corpus. It is preliminary research, not an exhaustive prior-art search or a legal opinion. No conclusion about novelty, patentability, infringement, or freedom to operate is provided.';

export function buildReportMarkdown(description: string): string {
  const lines: string[] = [];
  lines.push('# Preliminary Prior Art Investigation');
  lines.push('');
  lines.push('_PriorArt Scout · Demo mode · Synthetic demonstration data_');
  lines.push('');
  lines.push(`> ${LIMITATIONS_NOTICE}`);
  lines.push('');
  lines.push('## Invention description');
  lines.push('');
  lines.push(description);
  lines.push('');
  lines.push('## Extracted technical features');
  lines.push('');
  for (const f of features) {
    lines.push(`- **${f.id} ${f.label}**: source phrase "${f.sourcePhrase}"`);
  }
  lines.push('');
  lines.push('## Feature-to-evidence matrix');
  lines.push('');
  lines.push(`| Feature | ${documents.map((d) => d.id).join(' | ')} |`);
  lines.push(`| --- | ${documents.map(() => '---').join(' | ')} |`);
  for (const f of features) {
    const cells = documents.map((d) => {
      const r = resolveEvidence(f.id, d.id);
      return r ? statusStyles[r.status].label : '—';
    });
    lines.push(`| ${f.id} ${f.label} | ${cells.join(' | ')} |`);
  }
  lines.push('');
  lines.push('## Cited evidence');
  for (const f of features) {
    lines.push('');
    lines.push(`### ${f.id} — ${f.label}`);
    for (const d of documents) {
      const r = resolveEvidence(f.id, d.id);
      if (!r) continue;
      lines.push('');
      lines.push(`**${d.id}: ${statusStyles[r.status].label}**`);
      if (r.passage) lines.push(`> "${r.passage.text}" (${d.id}, passage ${r.passage.id})`);
      lines.push(r.match.explanation);
    }
  }
  lines.push('');
  lines.push('## Research gaps');
  lines.push('');
  lines.push('### Features requiring further investigation');
  for (const f of featuresNeedingInvestigation()) {
    const note = researchGaps.featureNotes.find((n) => n.featureId === f.id)?.note;
    lines.push(`- **${f.id} ${f.label}**${note ? `: ${note}` : ''}`);
  }
  lines.push('');
  lines.push('### Ambiguities in the description');
  researchGaps.ambiguities.forEach((a) => lines.push(`- ${a}`));
  lines.push('');
  lines.push('### Search coverage limitations');
  researchGaps.coverageLimitations.forEach((c) => lines.push(`- ${c}`));
  lines.push('');
  lines.push('### Recommended next steps');
  researchGaps.nextSteps.forEach((s, i) => lines.push(`${i + 1}. **${s.title}**: ${s.detail}`));
  lines.push('');
  return lines.join('\n');
}

export function downloadReport(description: string): void {
  const blob = new Blob([buildReportMarkdown(description)], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = 'priorart-scout-demo-report.md';
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  // Revoking synchronously can cancel the download in some browsers (Safari, Firefox).
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}