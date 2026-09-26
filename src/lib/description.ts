/**
 * Listing descriptions are written in light Markdown from the admin panel: an all-caps title
 * line, **bold** phrases, "###" section headings and emoji bullet lists (🔹 Land Extent: …).
 * This turns them into blocks the listing page can lay out, and plain-text excerpts for cards.
 */

export type DescriptionBlock =
  | { kind: 'heading'; text: string }
  | { kind: 'lead'; text: string }
  | { kind: 'para'; lines: string[] }
  | { kind: 'list'; items: string[] };

// Leading emoji (pictographs live in surrogate pairs D83C–D83E; symbols in 2190–2BFF)
const LEADING_EMOJI = /^(?:[\uD83C-\uD83E][\uDC00-\uDFFF]|[\u2190-\u2BFF\u2600-\u27BF])\uFE0F?\s*/;
const BULLET = /^(?:[-*•▪►➤✔✓]|🔹|🔸|✅|☑)\uFE0F?\s*/;

export function hasLeadingEmoji(text: string): boolean {
  return LEADING_EMOJI.test(text);
}

function stripLeadingEmoji(text: string): string {
  let out = text;
  while (LEADING_EMOJI.test(out)) out = out.replace(LEADING_EMOJI, '');
  return out;
}

/** Text without Markdown emphasis markers */
export function plain(text: string): string {
  return text.replace(/\*\*|__/g, '').trim();
}

function isUpperCaseLine(text: string): boolean {
  const letters = plain(text).replace(/[^A-Za-z]/g, '');
  return letters.length >= 6 && letters.replace(/[^A-Z]/g, '').length / letters.length > 0.8;
}

function isFullyBold(text: string): boolean {
  return /^\*\*[^*]+\*\*[.!:]?$/.test(stripLeadingEmoji(text));
}

function startsLikeBullet(line: string): boolean {
  return BULLET.test(line) || LEADING_EMOJI.test(line);
}

export function parseDescription(source: string | null | undefined): DescriptionBlock[] {
  if (!source) return [];
  const blocks: DescriptionBlock[] = [];
  const chunks = source.replace(/\r\n?/g, '\n').split(/\n\s*\n/);

  chunks.forEach((chunk, index) => {
    const lines = chunk
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean);
    if (lines.length === 0) return;

    if (lines.length === 1) {
      const line = lines[0];
      if (/^#{1,6}\s/.test(line)) {
        blocks.push({ kind: 'heading', text: plain(stripLeadingEmoji(line.replace(/^#{1,6}\s*/, ''))) });
      } else if (isFullyBold(line) && isUpperCaseLine(line)) {
        // The opening all-caps line repeats the listing title, which the page already shows
        if (index > 0) blocks.push({ kind: 'heading', text: plain(stripLeadingEmoji(line)) });
      } else if (isFullyBold(line)) {
        blocks.push({ kind: 'lead', text: line });
      } else {
        blocks.push({ kind: 'para', lines });
      }
      return;
    }

    // "✨ Ground Floor:" followed by its own bullets: a small heading over a list
    const label = plain(stripLeadingEmoji(lines[0]));
    const rest = lines.slice(1);
    if (/:$/.test(label) && label.length <= 60 && rest.every(startsLikeBullet)) {
      blocks.push({ kind: 'heading', text: label.replace(/:$/, '') });
      blocks.push({ kind: 'list', items: rest.map((l) => l.replace(BULLET, '')) });
      return;
    }

    const bulletLines = lines.filter(startsLikeBullet).length;
    if (bulletLines >= 2 && bulletLines >= lines.length - 1) {
      blocks.push({ kind: 'list', items: lines.map((l) => l.replace(BULLET, '')) });
    } else {
      blocks.push({ kind: 'para', lines });
    }
  });

  return blocks;
}

/** First descriptive paragraph as plain text, trimmed to `max` characters at a word break */
export function descriptionExcerpt(source: string | null | undefined, max = 200): string {
  const blocks = parseDescription(source);
  const paras = blocks.filter((b): b is Extract<DescriptionBlock, { kind: 'para' }> => b.kind === 'para');
  // Prefer real prose over one-line facts like "📍 **Prime Location:** No. 326…"
  const isFact = (lines: string[]) => lines.length === 1 && /^\*\*[^*]+:\*\*/.test(stripLeadingEmoji(lines[0]));
  const para = paras.find((p) => !isFact(p.lines) && plain(p.lines.join(' ')).length >= 60) || paras[0];
  const lead = blocks.find((b) => b.kind === 'lead') as { text: string } | undefined;
  const text = plain(stripLeadingEmoji(para ? para.lines.join(' ') : lead?.text || ''))
    .replace(/\s+/g, ' ')
    .trim();
  if (text.length <= max) return text;
  const cut = text.slice(0, max);
  return `${cut.slice(0, Math.max(cut.lastIndexOf(' '), max - 20)).replace(/[\s,.;:–-]+$/, '')}…`;
}
