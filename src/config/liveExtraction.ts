/** Public UI flag only — not a secret. The API also requires LIVE_EXTRACTION_ENABLED. */
export function isLiveExtractionAdvertised(): boolean {
  return import.meta.env.VITE_LIVE_EXTRACTION_ENABLED === 'true';
}
