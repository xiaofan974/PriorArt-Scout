import { MIN_DESCRIPTION_LENGTH } from '../config/limits';

export type StartAction = 'too_short' | 'demo' | 'live' | 'curated' | 'unavailable';

export function resolveStartAction(
  description: string,
  exampleDescription: string,
  liveEnabled: boolean
): StartAction {
  const trimmed = description.trim();
  if (trimmed.length < MIN_DESCRIPTION_LENGTH) return 'too_short';
  if (trimmed === exampleDescription) return 'demo';
  return liveEnabled ? 'live' : 'curated';
}
