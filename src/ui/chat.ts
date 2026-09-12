import { answerFromDesk, type ChatTurn } from '../modules/assistant';
import { esc } from './html';

export function chatMarkup(): string {
  return `<aside class="grok" id="grok">
    <button type="button" class="grok-launch" data-grok-toggle aria-expanded="false" aria-controls="grok-panel">
      <span class="grok-mark" aria-hidden="true">G</span>
      <span class="grok-label">Ask Grok</span>
    </button>
    <div class="grok-panel" id="grok-panel" hidden>
      <header>
        <p class="kicker"><i class="section-dot" aria-hidden="true"></i>Ask Grok</p>
        <p class="subtle">Sourced encyclopedia assistant. Does not invent prices, headlines or faces.</p>
        <button type="button" class="icon-btn" data-grok-toggle aria-label="Close assistant">×</button>
      </header>
      <ol class="grok-log" id="grok-log"></ol>
      <form id="grok-form">
        <label class="sr-only" for="grok-input">Ask the desk</label>
        <input id="grok-input" type="text" autocomplete="off" placeholder="GBTD, SATP, Overledger, Verdian…" />
        <button type="submit" class="btn btn-primary">Ask</button>
      </form>
    </div>
  </aside>`;
}

export function wireChat(root: HTMLElement): void {
  const panel = root.querySelector<HTMLElement>('#grok-panel');
  const log = root.querySelector<HTMLOListElement>('#grok-log');
  const form = root.querySelector<HTMLFormElement>('#grok-form');
  const input = root.querySelector<HTMLInputElement>('#grok-input');
  if (!panel || !log || !form || !input) return;

  const history: ChatTurn[] = [];

  const toggle = () => {
    panel.hidden = !panel.hidden;
    root.querySelectorAll('[data-grok-toggle]').forEach((b) => {
      b.setAttribute('aria-expanded', panel.hidden ? 'false' : 'true');
    });
    if (!panel.hidden) input.focus();
  };
  root.querySelectorAll('[data-grok-toggle]').forEach((b) => b.addEventListener('click', toggle));

  const paint = (role: 'user' | 'assistant', text: string, cites: Array<{ label: string; href: string }> = []) => {
    const li = document.createElement('li');
    li.className = `grok-${role}`;
    li.innerHTML = `<p>${esc(text).replace(/\n/g, '<br>')}</p>${
      cites.length
        ? `<p class="grok-cites">${cites
            .map((c) => `<a href="${esc(c.href)}">${esc(c.label)}</a>`)
            .join(' · ')}</p>`
        : ''
    }`;
    log.appendChild(li);
    log.scrollTop = log.scrollHeight;
  };

  form.addEventListener('submit', async (ev) => {
    ev.preventDefault();
    const q = input.value.trim();
    if (!q) return;
    input.value = '';
    paint('user', q);
    history.push({ role: 'user', content: q });
    const local = answerFromDesk(q);
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: q, history, local }),
      });
      if (res.ok) {
        const data = (await res.json()) as { text?: string; cites?: typeof local.cites };
        if (data.text) {
          paint('assistant', data.text, data.cites ?? local.cites);
          history.push({ role: 'assistant', content: data.text });
          return;
        }
      }
    } catch {
      /* sourced fallback */
    }
    paint('assistant', local.text, local.cites);
    history.push({ role: 'assistant', content: local.text });
  });
}
