import { answerFromDesk, type ChatReply, type ChatTurn } from './assistant';
import { answerWithGrok, grokConnected } from './grokLive';

export async function answerChat(question: string, history: ChatTurn[] = []): Promise<ChatReply> {
  const local = answerFromDesk(question);
  if (!grokConnected()) return local;
  try {
    const live = await answerWithGrok(question, history, local);
    return live ?? local;
  } catch {
    return { ...local, mode: 'sourced' };
  }
}

export function chatStatus(): { grok: boolean } {
  return { grok: grokConnected() };
}
