export function esc(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function fmtMoney(n: number, digits = 2): string {
  if (!Number.isFinite(n)) return '—';
  if (Math.abs(n) >= 1_000_000_000) return `$${(n / 1_000_000_000).toFixed(2)}B`;
  if (Math.abs(n) >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  return `$${n.toLocaleString('en-US', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  })}`;
}

export function fmtQty(n: number): string {
  if (!Number.isFinite(n)) return '—';
  return n.toLocaleString('en-US', { maximumFractionDigits: 0 });
}

export function fmtPct(n: number): string {
  if (!Number.isFinite(n)) return '—';
  const sign = n > 0 ? '+' : '';
  return `${sign}${n.toFixed(2)}%`;
}

export function extLink(href: string, label: string, extraClass = ''): string {
  return `<a class="ext ${extraClass}" href="${esc(href)}" target="_blank" rel="noopener noreferrer">${esc(label)} <span aria-hidden="true">↗</span></a>`;
}

export function sourceChip(href: string, label: string): string {
  return `<a class="chip source" href="${esc(href)}" target="_blank" rel="noopener noreferrer">${esc(label)}</a>`;
}
