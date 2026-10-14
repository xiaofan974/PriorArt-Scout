import OpenAI from 'openai';
import { zodResponseFormat } from 'openai/helpers/zod';
import { z } from 'zod';
import {
  DEFAULT_OPENAI_MODEL,
  MAX_FEATURES,
  MAX_OUTPUT_TOKENS } from
'./extractionConstants.js';
import type { RawFeature } from './normalizeFeatures.js';

const rawFeatureSchema = z.object({
  label: z.string(),
  detail: z.string(),
  sourcePhrase: z.string()
});

export const extractionOutputSchema = z.object({
  features: z.array(rawFeatureSchema).max(MAX_FEATURES)
});

const SYSTEM_PROMPT = `You extract discrete technical features from a plain-language invention description.

Rules:
- Identify only components, mechanisms, and functional constraints that the text explicitly supports.
- Separate distinct technical elements. Return at most ${MAX_FEATURES} features, and fewer when the text does not support more.
- Do not invent specifications, materials, numerical values, or capabilities that are not in the text.
- Preserve meaningful numerical constraints, timing requirements, and conditions when they appear.
- Ignore marketing claims that are not technical.
- Each sourcePhrase MUST be an exact, contiguous substring copied from the user's description. Never paraphrase it.
- Do not assess novelty, patentability, infringement, or freedom to operate.
- label: short technical name. detail: one-sentence technical restatement without adding facts.`;

function userPrompt(description: string, invalidPhrases?: string[]): string {
  if (invalidPhrases && invalidPhrases.length > 0) {
    return `The previous extraction used sourcePhrase values that do not appear verbatim in the description. Those phrases were: ${JSON.stringify(invalidPhrases)}.
Copy each sourcePhrase exactly from the description below. Do not paraphrase.

Invention description:
${description}`;
  }
  return `Invention description:\n${description}`;
}

export interface ExtractFromModelOptions {
  apiKey: string;
  model?: string;
  signal: AbortSignal;
  timeoutMs: number;
  invalidPhrases?: string[];
}

export async function extractFeaturesFromModel(
  description: string,
  options: ExtractFromModelOptions
): Promise<RawFeature[]> {
  const client = new OpenAI({
    apiKey: options.apiKey,
    timeout: options.timeoutMs,
    maxRetries: 1
  });
  const completion = await client.beta.chat.completions.parse({
    model: options.model || DEFAULT_OPENAI_MODEL,
    max_tokens: MAX_OUTPUT_TOKENS,
    messages: [
    { role: 'system', content: SYSTEM_PROMPT },
    { role: 'user', content: userPrompt(description, options.invalidPhrases) }],

    response_format: zodResponseFormat(extractionOutputSchema, 'feature_extraction')
  },
  { signal: options.signal });

  const parsed = completion.choices[0]?.message.parsed;
  if (!parsed) {
    throw new Error('empty_structured_output');
  }
  return parsed.features;
}
