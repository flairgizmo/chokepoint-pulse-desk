import { answerFromDesk, type ChatReply, type ChatTurn } from './assistant';
import { answerWithGrok, grokConnected } from './grokLive';
import { fetchMarketsDirect } from './markets';
import { fetchNewsRiver } from './news';

let briefAt = 0;
let briefText = '';

async function liveDeskBrief(): Promise<string> {
  if (Date.now() - briefAt < 45_000 && briefText) return briefText;
  const parts: string[] = [];
  try {
    const print = await fetchMarketsDirect();
    if (print.priceUsd != null) {
      parts.push(
        `Live QNT print on the desk (do not invent another price): ${print.venue} ${print.priceUsd} USD. Circulating from CoinGecko: ${print.circulating ?? 'unavailable'}. Status ${print.status}.`,
      );
    }
  } catch {
    /* keep chat answering from the record */
  }
  try {
    const river = await fetchNewsRiver();
    const official = river.items.filter((h) => h.lane === 'Official').slice(0, 4);
    if (official.length) {
      parts.push(
        `Latest official items on the desk wire (titles only, do not invent more):\n${official
          .map((h) => `• ${h.title} — ${h.source}`)
          .join('\n')}`,
      );
    }
  } catch {
    /* wire optional */
  }
  briefText = parts.join('\n\n');
  briefAt = Date.now();
  return briefText;
}

export async function answerChat(question: string, history: ChatTurn[] = []): Promise<ChatReply> {
  const local = answerFromDesk(question);
  if (!grokConnected()) return local;
  try {
    const extra = await liveDeskBrief();
    const briefing = extra ? { ...local, text: `${local.text}\n\n${extra}` } : local;
    const live = await answerWithGrok(question, history, briefing);
    return live ?? local;
  } catch {
    return { ...local, mode: 'sourced' };
  }
}

export function chatStatus(): { grok: boolean } {
  return { grok: grokConnected() };
}
