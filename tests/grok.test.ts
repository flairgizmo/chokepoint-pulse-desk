import { describe, expect, it } from 'vitest';
import { answerFromDesk } from '../src/modules/assistant';
import { answerChat, chatStatus } from '../src/modules/chatServer';
import { grokConnected } from '../src/modules/grokLive';

describe('Ask Grok', () => {
  it('is disconnected until XAI_API_KEY is set', () => {
    expect(process.env.XAI_API_KEY ?? '').toBe('');
    expect(grokConnected()).toBe(false);
    expect(chatStatus()).toEqual({ grok: false });
  });

  it('answers GBTD from the record without a live key', async () => {
    const reply = await answerChat('What is GBTD?');
    expect(reply.mode).toBe('sourced');
    expect(reply.text).toMatch(/Barclays/);
    expect(reply.text).toMatch(/Overledger/);
    expect(reply.cites.some((c) => c.href.includes('programmes') || c.href.includes('cbdc'))).toBe(true);
  });

  it('keeps the desk answer and the live wrapper aligned', () => {
    const desk = answerFromDesk('What is Overledger?');
    expect(desk.text).toMatch(/gateway operating system/i);
    expect(desk.mode).toBe('sourced');
  });
});
