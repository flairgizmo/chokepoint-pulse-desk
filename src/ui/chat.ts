import { answerFromDesk, type ChatTurn } from '../modules/assistant';
import { esc } from './html';

const PROMPTS = ['What is GBTD?', 'What is Overledger?', 'Why does QNT exist?', 'What is PayScript?'];

export function chatMarkup(): string {
  return `<aside class="grok" id="grok">
    <button type="button" class="grok-launch" data-grok-toggle aria-expanded="false" aria-controls="grok-panel">
      <img class="grok-mark" src="/brand/grok-mark.png" width="36" height="36" alt="" />
      <span class="grok-label">Ask Grok</span>
    </button>
    <div class="grok-panel" id="grok-panel" hidden>
      <header>
        <div class="grok-head">
          <img class="grok-mark" src="/brand/grok-mark.png" width="32" height="32" alt="" />
          <div>
            <p class="kicker">Ask Grok</p>
            <p class="subtle" data-grok-status>Research assistant. Add XAI_API_KEY to speak with live Grok. Until then, answers come from the record.</p>
          </div>
        </div>
        <button type="button" class="icon-btn" data-grok-toggle aria-label="Close assistant">×</button>
      </header>
      <ol class="grok-log" id="grok-log">
        <li class="grok-assistant grok-welcome">
          <p>Ask about Overledger, GBTD, QNT, SATP, Fusion, or the people who signed the papers.</p>
          <div class="grok-chips">
            ${PROMPTS.map((p) => `<button type="button" class="grok-chip" data-grok-prompt="${esc(p)}">${esc(p)}</button>`).join('')}
          </div>
        </li>
      </ol>
      <form id="grok-form">
        <label class="sr-only" for="grok-input">Ask Grok</label>
        <input id="grok-input" type="text" autocomplete="off" maxlength="2000" placeholder="What is GBTD?" />
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
  const statusLine = root.querySelector('[data-grok-status]');

  void fetch('/api/chat')
    .then((r) => (r.ok ? r.json() : null))
    .then((s: { grok?: boolean } | null) => {
      if (!statusLine) return;
      statusLine.textContent = s?.grok
        ? 'Grok live. Grounded in the QntDesk record, names and titles attached, plus the live QNT print and official wire.'
        : 'From the record. Add XAI_API_KEY on the host to connect live Grok.';
    })
    .catch(() => undefined);

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

  const ask = async (q: string) => {
    if (!q) return;
    input.value = '';
    paint('user', q);
    history.push({ role: 'user', content: q });
    const local = answerFromDesk(q);
    const thinking = document.createElement('li');
    thinking.className = 'grok-assistant grok-thinking';
    thinking.innerHTML = '<p>Reading the record…</p>';
    log.appendChild(thinking);
    log.scrollTop = log.scrollHeight;
    form.setAttribute('aria-busy', 'true');
    const askBtn = form.querySelector('button');
    if (askBtn) askBtn.setAttribute('disabled', 'true');
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: q.slice(0, 2000), history: history.slice(-8) }),
        signal: AbortSignal.timeout(22_000),
      });
      if (res.ok) {
        const data = (await res.json()) as { text?: string; cites?: typeof local.cites; mode?: string };
        if (data.text) {
          thinking.remove();
          paint('assistant', data.text, data.cites ?? local.cites);
          history.push({ role: 'assistant', content: data.text });
          if (statusLine && data.mode === 'live') {
            statusLine.textContent =
              'Grok live. Grounded in the QntDesk record, names and titles attached, plus the live QNT print and official wire.';
          }
          return;
        }
      }
    } catch {
      /* sourced fallback */
    } finally {
      thinking.remove();
      form.removeAttribute('aria-busy');
      if (askBtn) askBtn.removeAttribute('disabled');
    }
    paint('assistant', local.text, local.cites);
    history.push({ role: 'assistant', content: local.text });
  };

  form.addEventListener('submit', (ev) => {
    ev.preventDefault();
    void ask(input.value.trim());
  });

  root.querySelectorAll<HTMLButtonElement>('[data-grok-prompt]').forEach((btn) => {
    btn.addEventListener('click', () => {
      if (panel.hidden) toggle();
      void ask(btn.dataset.grokPrompt ?? btn.textContent ?? '');
    });
  });
}
