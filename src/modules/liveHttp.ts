import { DESK_UA } from './liveSources';

export async function fetchLive(
  url: string,
  init: RequestInit & { timeoutMs?: number } = {},
): Promise<Response> {
  const { timeoutMs = 12_000, headers, signal, ...rest } = init;
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  const onAbort = (): void => ctrl.abort();
  signal?.addEventListener('abort', onAbort);
  try {
    return await fetch(url, {
      ...rest,
      signal: ctrl.signal,
      headers: {
        Accept: 'application/json, application/rss+xml, application/atom+xml, application/xml, text/xml, */*',
        'User-Agent': DESK_UA,
        ...headers,
      },
    });
  } finally {
    clearTimeout(timer);
    signal?.removeEventListener('abort', onAbort);
  }
}

export async function fetchJson(url: string, signal?: AbortSignal): Promise<unknown> {
  const res = await fetchLive(url, { signal, headers: { Accept: 'application/json' } });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export async function fetchText(url: string, signal?: AbortSignal): Promise<string> {
  const res = await fetchLive(url, {
    signal,
    headers: { Accept: 'application/rss+xml, application/atom+xml, application/xml, text/xml, */*' },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.text();
}
