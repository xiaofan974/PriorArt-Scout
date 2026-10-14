import { createElement, createRef } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { curatedCorpus } from '../data/curatedCorpus';
import { createCuratedResearchResult } from '../data/curatedResult';
import { documents, features } from '../data/demoInvestigation';
import { createDemoInvestigationResult } from '../data/demoResult';
import { investigationAvailability } from '../hooks/investigationAvailability';
import { CuratedInspectorBody } from '../components/report/CuratedInspector';
import {
  ASSESSMENT_FIXTURE_ID,
  createHelmetAssessmentResult,
  helmetAssessmentGaps,
  helmetAssessments
} from './helmetAssessment';
import { storedPassageText, validateCuratedAssessment } from './validateAssessment';

const result = createHelmetAssessmentResult();

describe('curated helmet assessment fixture', () => {
  it('cites only existing features, publications, and passages', () => {
    const validation = validateCuratedAssessment(result);
    expect(validation.issues).toEqual([]);
    expect(validation.ok).toBe(true);
    for (const assessment of helmetAssessments) {
      expect(features.map((feature) => feature.id)).toContain(assessment.featureId);
      const passage = curatedCorpus.passages.find((item) => item.id === assessment.passageId);
      expect(passage?.publicationId).toBe(assessment.publicationId);
      expect(curatedCorpus.publications.map((publication) => publication.id)).toContain(assessment.publicationId);
    }
  });

  it('keeps stored passage text identical to the corpus', () => {
    for (const assessment of helmetAssessments) {
      const corpus = curatedCorpus.passages.find((passage) => passage.id === assessment.passageId);
      expect(storedPassageText(result, assessment)).toBe(corpus?.text);
    }
  });

  it('records a research gap when a publication has no relevant passage', () => {
    expect(helmetAssessmentGaps.length).toBeGreaterThan(0);
    for (const gap of helmetAssessmentGaps) {
      expect(helmetAssessments.some(
        (assessment) => assessment.featureId === gap.featureId && assessment.publicationId === gap.publicationId
      )).toBe(false);
    }
    const f01 = helmetAssessmentGaps.find((gap) => gap.featureId === 'F01' && gap.publicationId === 'US8860570B2');
    expect(f01?.note).toMatch(/helmet/i);
  });

  it('does not treat the 15-second window as stated by a passage', () => {
    const cancel = helmetAssessments.filter((assessment) => assessment.featureId === 'F06');
    expect(cancel.length).toBeGreaterThan(0);
    for (const assessment of cancel) {
      expect(assessment.unresolvedDifferences.join(' ')).toMatch(/15/);
      expect(assessment.explanation.toLowerCase()).not.toMatch(/states a 15|within 15 seconds/);
    }
  });

  it('is deterministic', () => {
    expect(createHelmetAssessmentResult()).toEqual(createHelmetAssessmentResult());
    expect(helmetAssessments.every((assessment) => assessment.provenance.startsWith(`${ASSESSMENT_FIXTURE_ID}/`))).toBe(true);
  });

  it('rejects a citation whose stored text was replaced', () => {
    const tampered = createHelmetAssessmentResult();
    tampered.documents[0].passages[0] = { ...tampered.documents[0].passages[0], text: 'Generated substitute text.' };
    expect(validateCuratedAssessment(tampered).ok).toBe(false);
  });
});

describe('evidence report availability', () => {
  it('stays locked for curated retrieval and unlocks only a validated assessment', () => {
    const retrieved = createCuratedResearchResult(
      'A smart bicycle helmet that detects collisions using accelerometer and gyroscope data and sends an alert.'
    );
    expect(retrieved.assessments).toBeUndefined();
    expect(investigationAvailability('retrieved', retrieved).report).toBe(false);
    expect(investigationAvailability('assessed', result).report).toBe(true);
    expect(investigationAvailability('assessed', { ...result, assessments: [] }).report).toBe(false);
    expect(investigationAvailability('complete').report).toBe(true);
  });
});

describe('evidence inspector source text', () => {
  it('quotes the stored passage and not the assessment explanation', () => {
    const markup = renderToStaticMarkup(
      createElement(CuratedInspectorBody, {
        result,
        selection: { featureId: 'F02', documentId: 'US10897947B2' },
        onSelect: () => undefined,
        onClose: () => undefined,
        closeRef: createRef<HTMLButtonElement>()
      })
    );
    const passage = curatedCorpus.passages.find((item) => item.id === 'US10897947B2-C1');
    expect(passage).toBeTruthy();
    expect(markup).toContain(`“${passage?.text}”`);
    expect(markup).toContain('collision even');
    const blockquote = markup.match(/<blockquote[^>]*>(.*?)<\/blockquote>/)?.[1] ?? '';
    expect(blockquote).toBe(`“${passage?.text}”`);
    expect(blockquote).not.toContain('does not mention a gyroscope');
  });

  it('shows a research gap without a fabricated excerpt', () => {
    const markup = renderToStaticMarkup(
      createElement(CuratedInspectorBody, {
        result,
        selection: { featureId: 'F01', documentId: 'US8860570B2' },
        onSelect: () => undefined,
        onClose: () => undefined,
        closeRef: createRef<HTMLButtonElement>()
      })
    );
    expect(markup).toContain('None of the stored passages call the system a helmet');
    expect(markup).not.toContain('<blockquote');
  });
});

describe('synthetic demonstration', () => {
  it('keeps the demonstration corpus unchanged', () => {
    const demo = createDemoInvestigationResult();
    expect(demo.mode).toBe('demonstration');
    expect(demo.assessments).toBeUndefined();
    expect(demo.documents.map((document) => document.id)).toEqual(documents.map((document) => document.id));
    expect(demo.features).toEqual(features);
    expect(demo.invention.id).toBe('demo-inv-helmet');
  });
});
