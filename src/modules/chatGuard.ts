import type { ChatTurn } from './assistant';

export const MAX_QUESTION = 2_000;
export const MAX_HISTORY = 8;
export const MAX_TURN = 1_200;
export const MAX_BODY_BYTES = 24_000;

function stripControls(value: string): string {
  return value.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '');
}

export function sanitizeQuestion(raw: unknown): string {
  return stripControls(String(raw ?? '')).trim().slice(0, MAX_QUESTION);
}

export function sanitizeHistory(raw: unknown): ChatTurn[] {
  if (!Array.isArray(raw)) return [];
  const out: ChatTurn[] = [];
  for (const item of raw.slice(-MAX_HISTORY)) {
    if (!item || typeof item !== 'object') continue;
    const role = (item as { role?: string }).role;
    if (role !== 'user' && role !== 'assistant') continue;
    const content = stripControls(String((item as { content?: unknown }).content ?? ''))
      .trim()
      .slice(0, MAX_TURN);
    if (!content) continue;
    out.push({ role, content });
  }
  return out;
}
