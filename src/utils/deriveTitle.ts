/** Short title from the first words of an invention description. */
export function deriveTitle(text: string): string {
  const words = text.replace(/\s+/g, ' ').split(' ');
  const head = words.slice(0, 7).join(' ').replace(/[.,;:]$/, '');
  return words.length > 7 ? `${head}…` : head;
}
