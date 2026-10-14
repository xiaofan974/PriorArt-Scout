import { createHelmetAssessmentResult } from '../assessment/helmetAssessment';
import { storedPassageText, validateCuratedAssessment } from '../assessment/validateAssessment';
import { curatedCorpus } from '../data/curatedCorpus';
import { features as helmetFeatures } from '../data/demoInvestigation';
import { retrieveCuratedPassages, type FeatureRetrieval } from '../retrieval/curatedRetrieve';
import { EVAL_LABEL_STATUS, helmetEvalCases, type FeatureEvalCase } from './helmetEvalDataset';
import type { TechnicalFeature } from '../types/investigation';

export type PassageRetriever = (features: TechnicalFeature[]) => FeatureRetrieval[];

export interface FeatureRetrievalScore {
  featureId: string;
  retrievedPassageIds: string[];
  truePositiveIds: string[];
  falsePositiveIds: string[];
  missedRelevantIds: string[];
  retrievedIrrelevantIds: string[];
  precision: number | null;
  recall: number | null;
}

export interface HelmetEvalReport {
  labelStatus: string;
  retrieval: {
    perFeature: FeatureRetrievalScore[];
    /** True positives divided by retrieved pairs. Features with no hits add nothing to either side. */
    microPrecision: number | null;
    /** True positives divided by all labeled relevant pairs. */
    microRecall: number | null;
    /** Unweighted mean of per-feature precision. Features with no hits are excluded. */
    macroPrecision: number | null;
    /** Unweighted mean of per-feature recall. A feature with no hits and a non-empty relevant set contributes 0. */
    macroRecall: number | null;
    featuresWithDefinedPrecision: string[];
    featuresWithNoHits: string[];
  };
  /** Passage exists, belongs to the publication, and the stored text matches. Not a retrieval score. */
  structuralCitation: {
    ok: boolean;
    issues: string[];
  };
  /** Exact substring checks against stored passage text and unresolved-difference strings. */
  exactQuoteChecks: {
    ok: boolean;
    issues: string[];
  };
  /** Agreement between draft labels and the assessment fixture. Not a retrieval score. */
  fixtureAgreement: {
    ok: boolean;
    issues: string[];
  };
  /** Semantic adequacy of explanations is not scored by this suite. */
  semanticGrounding: {
    independentlyReviewed: false;
  };
}

function ratio(numerator: number, denominator: number): number | null {
  if (denominator === 0) return null;
  return numerator / denominator;
}

function sameIds(left: string[], right: string[]): boolean {
  return left.length === right.length && left.every((id) => right.includes(id));
}

function scoreRetrieval(evalCase: FeatureEvalCase, retrievedPassageIds: string[]): FeatureRetrievalScore {
  const relevant = new Set(evalCase.relevantPassageIds);
  const irrelevant = new Set(evalCase.irrelevantPassageIds);
  const truePositiveIds = retrievedPassageIds.filter((id) => relevant.has(id));
  const falsePositiveIds = retrievedPassageIds.filter((id) => !relevant.has(id));
  const missedRelevantIds = evalCase.relevantPassageIds.filter((id) => !retrievedPassageIds.includes(id));
  return {
    featureId: evalCase.featureId,
    retrievedPassageIds,
    truePositiveIds,
    falsePositiveIds,
    missedRelevantIds,
    retrievedIrrelevantIds: retrievedPassageIds.filter((id) => irrelevant.has(id)),
    precision: ratio(truePositiveIds.length, retrievedPassageIds.length),
    recall: ratio(truePositiveIds.length, evalCase.relevantPassageIds.length)
  };
}

/** Scores draft labels against a retriever and the curated assessment fixture. */
export function scoreHelmetEvaluation(retrieve: PassageRetriever = retrieveCuratedPassages): HelmetEvalReport {
  const retrievalRows = retrieve(helmetFeatures);
  const perFeature = helmetEvalCases.map((evalCase) => {
    const row = retrievalRows.find((item) => item.featureId === evalCase.featureId);
    return scoreRetrieval(evalCase, row?.matches.map((match) => match.passageId) ?? []);
  });
  const truePositives = perFeature.reduce((sum, row) => sum + row.truePositiveIds.length, 0);
  const retrieved = perFeature.reduce((sum, row) => sum + row.retrievedPassageIds.length, 0);
  const relevant = helmetEvalCases.reduce((sum, evalCase) => sum + evalCase.relevantPassageIds.length, 0);
  const definedPrecision = perFeature.filter((row) => row.precision !== null);
  const macroPrecision = definedPrecision.length
    ? definedPrecision.reduce((sum, row) => sum + (row.precision ?? 0), 0) / definedPrecision.length
    : null;
  const macroRecall = perFeature.length
    ? perFeature.reduce((sum, row) => sum + (row.recall ?? 0), 0) / perFeature.length
    : null;

  const result = createHelmetAssessmentResult();
  const validation = validateCuratedAssessment(result);
  const quoteIssues: string[] = [];
  const agreementIssues: string[] = [];

  for (const evalCase of helmetEvalCases) {
    const feature = helmetFeatures.find((item) => item.id === evalCase.featureId);
    if (!feature) agreementIssues.push(`Dataset feature ${evalCase.featureId} is not in the helmet feature list.`);
    else if (evalCase.description !== `${feature.label}. ${feature.detail}`) {
      agreementIssues.push(`Dataset description for ${evalCase.featureId} does not match the feature label and detail.`);
    }

    const assessments = (result.assessments ?? []).filter((item) => item.featureId === evalCase.featureId);
    const unresolved = assessments.flatMap((item) => item.unresolvedDifferences);
    for (const detail of evalCase.missingDetails) {
      if (!unresolved.includes(detail)) quoteIssues.push(`${evalCase.featureId}: missing recorded absence “${detail}”.`);
    }

    for (const detail of evalCase.expectedDetails) {
      const passage = curatedCorpus.passages.find((item) => item.id === detail.passageId);
      const assessment = assessments.find((item) => item.passageId === detail.passageId);
      if (!passage || !assessment || storedPassageText(result, assessment) !== passage.text) {
        quoteIssues.push(`${evalCase.featureId}: ${detail.passageId} is not a traced citation.`);
        continue;
      }
      for (const quote of detail.quotes) {
        if (!passage.text.includes(quote)) {
          quoteIssues.push(`${evalCase.featureId}: “${quote}” is not in ${detail.passageId}.`);
        }
      }
    }

    for (const assessment of assessments) {
      if (
        evalCase.irrelevantPassageIds.includes(assessment.passageId) &&
        assessment.assessment !== 'insufficient_evidence'
      ) {
        agreementIssues.push(`${evalCase.featureId}: ${assessment.passageId} is ${assessment.assessment}.`);
      }
    }

    const coveredPublications = new Set(
      assessments
        .filter((item) => evalCase.relevantPassageIds.includes(item.passageId))
        .map((item) => item.publicationId)
    );
    for (const passageId of evalCase.relevantPassageIds) {
      const publicationId = curatedCorpus.passages.find((item) => item.id === passageId)?.publicationId;
      if (!publicationId || !coveredPublications.has(publicationId)) {
        agreementIssues.push(`${evalCase.featureId}: relevant passage ${passageId} has no citation in its publication.`);
      }
    }

    const gapIds = (result.assessmentGaps ?? [])
      .filter((gap) => gap.featureId === evalCase.featureId)
      .map((gap) => gap.publicationId);
    if (!sameIds(gapIds, evalCase.expectedGapPublicationIds)) {
      agreementIssues.push(
        `${evalCase.featureId}: gaps ${gapIds.join(', ') || '(none)'} vs expected ${evalCase.expectedGapPublicationIds.join(', ') || '(none)'}.`
      );
    }
  }

  return {
    labelStatus: EVAL_LABEL_STATUS,
    retrieval: {
      perFeature,
      microPrecision: ratio(truePositives, retrieved),
      microRecall: ratio(truePositives, relevant),
      macroPrecision,
      macroRecall,
      featuresWithDefinedPrecision: definedPrecision.map((row) => row.featureId),
      featuresWithNoHits: perFeature.filter((row) => row.retrievedPassageIds.length === 0).map((row) => row.featureId)
    },
    structuralCitation: { ok: validation.ok, issues: validation.issues },
    exactQuoteChecks: { ok: quoteIssues.length === 0, issues: quoteIssues },
    fixtureAgreement: { ok: agreementIssues.length === 0, issues: agreementIssues },
    semanticGrounding: { independentlyReviewed: false }
  };
}
