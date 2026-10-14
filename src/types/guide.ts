import type { MatchStatus, WorkflowView } from './investigation';

export interface GuideSectionLink {
  id: string;
  label: string;
}

export interface GuideWorkflowStep {
  number: string;
  title: string;
  text: string;
}

export interface GuideScreen {
  view: WorkflowView;
  name: string;
  text: string;
}

export interface GuideStatusDefinition {
  status: MatchStatus;
  definition: string;
  example: {
    feature: string;
    passageLabel: string;
    passage: string;
    /** True when `passage` is quoted text; false when it summarises what a passage covers. */
    passageIsQuote: boolean;
    note?: string;
  };
  caution?: string;
}

export interface GuideReportElement {
  key: number;
  title: string;
  text: string;
  note?: string;
}

export interface GuideFaqItem {
  question: string;
  answer: string;
}