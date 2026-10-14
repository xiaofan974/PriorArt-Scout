import { curatedCorpus } from '../data/curatedCorpus';
import type { EvidenceAssessment, InvestigationResult } from '../types/investigation';

export interface AssessmentValidation {
  ok: boolean;
  issues: string[];
}

export function assessmentsFor(
  result: InvestigationResult,
  featureId: string,
  publicationId: string
): EvidenceAssessment[] {
  return (result.assessments ?? []).filter(
    (assessment) => assessment.featureId === featureId && assessment.publicationId === publicationId
  );
}

export function gapFor(result: InvestigationResult, featureId: string, publicationId: string) {
  return result.assessmentGaps?.find(
    (gap) => gap.featureId === featureId && gap.publicationId === publicationId
  );
}

/** Stored passage text for an assessment, or null when the citation cannot be traced. */
export function storedPassageText(result: InvestigationResult, assessment: EvidenceAssessment): string | null {
  const corpusPassage = curatedCorpus.passages.find((passage) => passage.id === assessment.passageId);
  const documentPassage = result.documents
    .find((document) => document.id === assessment.publicationId)
    ?.passages.find((passage) => passage.id === assessment.passageId);
  if (!corpusPassage || !documentPassage) return null;
  if (corpusPassage.publicationId !== assessment.publicationId) return null;
  if (documentPassage.text !== corpusPassage.text) return null;
  return corpusPassage.text;
}

export function validateCuratedAssessment(result: InvestigationResult): AssessmentValidation {
  const issues: string[] = [];
  const assessments = result.assessments ?? [];
  if (assessments.length === 0) issues.push('Assessment data is missing.');

  const featureIds = new Set(result.features.map((feature) => feature.id));
  const publicationIds = new Set(curatedCorpus.publications.map((publication) => publication.id));
  const seen = new Set<string>();

  for (const assessment of assessments) {
    const key = `${assessment.featureId}:${assessment.passageId}`;
    if (seen.has(key)) issues.push(`Duplicate assessment for ${key}.`);
    seen.add(key);

    if (!featureIds.has(assessment.featureId)) {
      issues.push(`Unknown feature ${assessment.featureId}.`);
    }
    if (!publicationIds.has(assessment.publicationId)) {
      issues.push(`Unknown publication ${assessment.publicationId}.`);
    }
    if (!assessment.explanation.trim()) issues.push(`Empty explanation for ${assessment.passageId}.`);
    if (!assessment.provenance.startsWith('curated-helmet-assessment-v1/')) {
      issues.push(`Unexpected provenance for ${assessment.passageId}.`);
    }
    if (storedPassageText(result, assessment) === null) {
      issues.push(`Citation ${assessment.featureId} / ${assessment.passageId} is missing or does not match the corpus.`);
    }
  }

  for (const feature of result.features) {
    for (const publication of curatedCorpus.publications) {
      const cited = assessments.some(
        (assessment) => assessment.featureId === feature.id && assessment.publicationId === publication.id
      );
      const gap = gapFor(result, feature.id, publication.id);
      if (!cited && !gap) {
        issues.push(`Missing research gap for ${feature.id} and ${publication.id}.`);
      }
      if (cited && gap) {
        issues.push(`Both a citation and a research gap are recorded for ${feature.id} and ${publication.id}.`);
      }
    }
  }

  for (const gap of result.assessmentGaps ?? []) {
    if (!featureIds.has(gap.featureId)) issues.push(`Gap cites unknown feature ${gap.featureId}.`);
    if (!publicationIds.has(gap.publicationId)) issues.push(`Gap cites unknown publication ${gap.publicationId}.`);
    if (!gap.note.trim()) issues.push(`Empty research gap for ${gap.featureId}.`);
  }

  return { ok: issues.length === 0, issues };
}
