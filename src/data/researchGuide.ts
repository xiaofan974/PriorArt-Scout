import type {
  GuideFaqItem,
  GuideReportElement,
  GuideScreen,
  GuideSectionLink,
  GuideStatusDefinition,
  GuideWorkflowStep } from
'../types/guide';

export const guideSections: GuideSectionLink[] = [
{ id: 'guide-overview', label: 'What is PriorArt Scout?' },
{ id: 'guide-workflow', label: 'How an investigation works' },
{ id: 'guide-statuses', label: 'Evidence statuses' },
{ id: 'guide-report', label: 'Reading the report' },
{ id: 'guide-limitations', label: 'Reliability & limitations' }];


export const demoModeNote =
'Current prototype: Demonstration mode. Patent-like documents, comparison results, and investigation traces use synthetic sample data. No live AI or patent database requests are performed.';

export const overviewParagraphs: string[] = [
'PriorArt Scout is an evidence-first AI research concept designed to help inventors and R&D professionals investigate potentially relevant prior art.',
'It transforms an invention description into structured technical features, searches patent literature, and maps retrieved evidence to individual features.',
'The goal is to support preliminary research and help users identify questions worth investigating further—not to replace a patent professional.'];


export const workflowSteps: GuideWorkflowStep[] = [
{
  number: '01',
  title: 'Describe',
  text: 'The user enters a plain-language invention description in the New Investigation screen.'
},
{
  number: '02',
  title: 'Extract',
  text: 'The system identifies technical features and links each feature to the original description.'
},
{
  number: '03',
  title: 'Search',
  text: 'The research workflow generates technical search queries and retrieves potentially relevant documents.'
},
{
  number: '04',
  title: 'Compare',
  text: 'Each extracted feature is compared with retrieved source passages. The system records supporting evidence, partial overlap, and unresolved questions.'
},
{
  number: '05',
  title: 'Review',
  text: 'The Evidence Report presents the feature-to-document matrix, supporting passages, comparison explanations, and research limitations.'
}];


export const screenGuides: GuideScreen[] = [
{ view: 'new', name: 'New Investigation', text: 'Describe the invention and start research.' },
{
  view: 'workspace',
  name: 'Investigation Workspace',
  text: "Review extracted features, search results, and the agent's execution trace."
},
{
  view: 'report',
  name: 'Evidence Report',
  text: 'Inspect feature-level comparisons, cited passages, and unresolved questions.'
}];


/** Illustrative examples written for this guide. They are not taken from the demonstration dataset. */
export const statusDefinitions: GuideStatusDefinition[] = [
{
  status: 'supported',
  definition:
  'The available source passage directly supports the technical feature being compared, within the stated scope.',
  example: {
    feature: 'A protective helmet with an integrated sensor module.',
    passageLabel: 'Source passage',
    passage: 'The protective headgear comprises an outer shell and a sensor module mounted within the liner.',
    passageIsQuote: true
  },
  caution: 'This does not mean the entire invention is already patented or lacks novelty.'
},
{
  status: 'partial',
  definition:
  'The available passage supports some aspects of the feature, but a material element is missing, different, or insufficiently described.',
  example: {
    feature: 'A bicycle helmet with embedded impact detection.',
    passageLabel: 'Source passage',
    passage: 'A wearable impact detection device may be attached to clothing.',
    passageIsQuote: true,
    note: 'The document describes wearable impact detection, but not an integrated bicycle helmet.'
  }
},
{
  status: 'not_established',
  definition: 'The available evidence does not establish that the feature is disclosed.',
  example: {
    feature: 'The rider can cancel an emergency alert within 15 seconds.',
    passageLabel: 'Available passage',
    passage: 'Describes automatic emergency notification but does not mention a cancellation mechanism.',
    passageIsQuote: false
  },
  caution: 'This is not proof that the feature is absent from the full patent or from other prior art.'
}];


export const reportElements: GuideReportElement[] = [
{
  key: 1,
  title: 'Feature-to-evidence matrix',
  text: 'Rows represent extracted invention features. Columns represent candidate patent documents. Each cell describes the evidence status for that feature-document pair.'
},
{
  key: 2,
  title: 'Evidence Inspector',
  text: 'Click a matrix cell to open the side panel and inspect the comparison.'
},
{
  key: 3,
  title: 'Source excerpt',
  text: 'The exact passage stored in the retrieved evidence dataset.',
  note: 'A source-text match indicates that the displayed excerpt corresponds to stored text; it does not independently establish the truth of the interpretation.'
},
{
  key: 4,
  title: 'Comparison rationale',
  text: 'A concise explanation of why the available passage supports, partially supports, or does not establish the feature.'
},
{
  key: 5,
  title: 'Evidence limitations',
  text: 'Specific gaps, ambiguities, and restrictions affecting the comparison.'
},
{
  key: 6,
  title: 'Investigation trace',
  text: 'An observable record of workflow steps, such as feature extraction, search execution, retrieval, comparison, and validation.',
  note: 'The trace records actions and outcomes, not hidden model reasoning.'
}];


export const faqs: GuideFaqItem[] = [
{
  question: 'Does Supported mean my invention is not novel?',
  answer:
  'No. A supported feature-level comparison is not a novelty determination. Patentability analysis requires consideration of the relevant claims, combinations of features, applicable law, and broader prior art.'
},
{
  question: 'Does Not established mean no relevant patent exists?',
  answer:
  'No. It means the available evidence did not establish the feature. The search may be incomplete, and other documents or passages may exist.'
},
{
  question: 'What does evidence validation mean?',
  answer:
  'Evidence validation checks that a cited document and passage exist in the retrieved dataset and that the displayed excerpt matches stored source text. This does not, by itself, prove that the comparison interpretation is correct.'
},
{
  question: 'Can I use the report as a legal opinion?',
  answer:
  'No. PriorArt Scout is intended for preliminary research and should not replace a qualified patent professional.'
}];