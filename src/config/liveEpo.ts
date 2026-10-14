/** Public UI flag only — not a secret. The API also requires LIVE_EPO_ENABLED. */
export function isLiveEpoAdvertised(): boolean {
  return import.meta.env.VITE_LIVE_EPO_ENABLED === 'true';
}
