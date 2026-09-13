import { answerFromDesk, type ChatTurn } from '../modules/assistant';
import { esc } from './html';

const PROMPTS = ['What is GBTD?', 'What is Overledger?', 'Why does QNT exist?', 'What is PayScript?'];
const STORE = 'qntdesk.grok.v2';

interface StoredCite {
  label: string;
  href: string;
}

interface StoredTurn {
  role: 'user' | 'assistant';
  text: string;
  cites?: StoredCite[];
}

interface ChatStore {
  open: boolean;
  turns: StoredTurn[];
}

function loadStore(): ChatStore {
  try {
    const raw = sessionStorage.getItem(STORE) ?? sessionStorage.getItem('qntdesk.grok.v1');
    if (!raw) return { open: false, turns: [] };
    const parsed = JSON.parse(raw) as ChatStore & { min?: boolean };
    return {
      open: Boolean(parsed.open) && !parsed.min,
      turns: Array.isArray(parsed.turns) ? parsed.turns.slice(-24) : [],
    };
  } catch {
    return { open: false, turns: [] };
  }
}

function saveStore(next: ChatStore): void {
  try {
    sessionStorage.setItem(STORE, JSON.stringify({ ...next, turns: next.turns.slice(-24) }));
  } catch {
    /* private mode */
  }
}

export function chatMarkup(): string {
  return `<aside class="grok" id="grok">
    <button type="button" class="grok-launch" data-grok-toggle aria-expanded="false" aria-controls="grok-panel" aria-label="Ask Grok">
      <img class="grok-mark" src="/brand/grok-mark.png" width="36" height="36" alt="" />
      <span class="grok-label sr-only">Ask Grok</span>
    </button>
    <div class="grok-panel" id="grok-panel" hidden>
      <header>
        <div class="grok-head">
          <img class="grok-mark" src="/brand/grok-mark.png" width="32" height="32" alt="" />
          <div>
            <p class="kicker">Ask Grok</p>
            <p class="subtle" data-grok-status>A research companion for Overledger, GBTD, QNT and the rooms around them. It remembers this visit.</p>
          </div>
        </div>
        <div class="grok-tools">
          <button type="button" class="icon-btn" data-grok-min aria-label="Minimise assistant">–</button>
          <button type="button" class="icon-btn" data-grok-toggle aria-label="Close assistant">×</button>
        </div>
      </header>
      <ol class="grok-log" id="grok-log">
        <li class="grok-assistant grok-welcome" data-grok-welcome>
          <p>Ask about Overledger, GBTD, QNT, SATP, Fusion, or the people who signed the papers. I keep the thread as you move through the desk.</p>
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
  const aside = root.querySelector<HTMLElement>('#grok');
  const panel = root.querySelector<HTMLElement>('#grok-panel');
  const log = root.querySelector<HTMLOListElement>('#grok-log');
  const form = root.querySelector<HTMLFormElement>('#grok-form');
  const input = root.querySelector<HTMLInputElement>('#grok-input');
  if (!aside || !panel || !log || !form || !input) return;
  if (aside.dataset.wired === '1') return;
  aside.dataset.wired = '1';

  const store = loadStore();
  const history: ChatTurn[] = store.turns.map((t) => ({ role: t.role, content: t.text }));
  const statusLine = root.querySelector('[data-grok-status]');

  const persist = (): void => {
    saveStore({
      open: !panel.hidden,
      turns: store.turns,
    });
  };

  const paint = (role: 'user' | 'assistant', text: string, cites: StoredCite[] = [], remember = true) => {
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
    if (remember) {
      store.turns.push({ role, text, cites });
      persist();
    }
  };

  if (store.turns.length) {
    log.querySelector('[data-grok-welcome]')?.remove();
    for (const turn of store.turns) paint(turn.role, turn.text, turn.cites ?? [], false);
  }

  const setOpen = (open: boolean): void => {
    panel.hidden = !open;
    aside.classList.remove('is-min');
    aside.classList.toggle('is-open', open);
    root.querySelectorAll('[data-grok-toggle]').forEach((b) => {
      b.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    persist();
    if (open) input.focus();
  };

  if (store.open) setOpen(true);

  void fetch('/api/chat')
    .then((r) => (r.ok ? r.json() : null))
    .then((s: { grok?: boolean } | null) => {
      if (!statusLine) return;
      statusLine.textContent = s?.grok
        ? 'Grok is live — grounded in the record, with the live QNT print and the official wire. It keeps this conversation as you change pages.'
        : 'Answers come from the record until a host key is set. I still remember what you asked on this visit.';
    })
    .catch(() => undefined);

  const minimise = (): void => {
    setOpen(false);
  };

  aside.dataset.idle = '1';

  root.querySelectorAll('[data-grok-toggle]').forEach((b) =>
    b.addEventListener('click', () => setOpen(panel.hidden)),
  );
  root.querySelector('[data-grok-min]')?.addEventListener('click', minimise);

  if (!document.body.dataset.grokKeys) {
    document.body.dataset.grokKeys = '1';
    document.addEventListener('keydown', (ev) => {
      const live = document.querySelector<HTMLElement>('#grok-panel');
      if (!live || live.hidden) return;
      if (ev.key === 'Escape') {
        ev.preventDefault();
        live.hidden = true;
        live.classList.remove('is-min');
        document.querySelector('#grok')?.classList.remove('is-open', 'is-min');
        document.querySelectorAll('[data-grok-toggle]').forEach((b) => b.setAttribute('aria-expanded', 'false'));
        try {
          const raw = sessionStorage.getItem(STORE);
          const prev = raw ? (JSON.parse(raw) as ChatStore) : { open: false, turns: [] };
          sessionStorage.setItem(STORE, JSON.stringify({ ...prev, open: false }));
        } catch {
          /* private mode */
        }
      }
    });
  }

  const ask = async (q: string) => {
    if (!q) return;
    input.value = '';
    setOpen(true);
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
        const data = (await res.json()) as { text?: string; cites?: StoredCite[]; mode?: string };
        if (data.text) {
          thinking.remove();
          paint('assistant', data.text, data.cites ?? local.cites);
          history.push({ role: 'assistant', content: data.text });
          if (statusLine && data.mode === 'live') {
            statusLine.textContent =
              'Grok is live — grounded in the record, names and titles attached. It remembers this thread.';
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
      setOpen(true);
      void ask(btn.dataset.grokPrompt ?? btn.textContent ?? '');
    });
  });
}

/** Force the launcher back to first-paint idle: mark only, no transcript peek. */
export function forceGrokIdle(): void {
  const panel = document.querySelector<HTMLElement>('#grok-panel');
  const grok = document.querySelector<HTMLElement>('#grok');
  if (!panel || !grok) return;
  panel.hidden = true;
  grok.classList.remove('is-open', 'is-min');
  grok.querySelectorAll('[data-grok-toggle]').forEach((b) => b.setAttribute('aria-expanded', 'false'));
  try {
    const raw = sessionStorage.getItem(STORE);
    const prev = raw ? (JSON.parse(raw) as ChatStore) : { open: false, turns: [] };
    sessionStorage.setItem(STORE, JSON.stringify({ ...prev, open: false }));
  } catch {
    /* private mode */
  }
}
