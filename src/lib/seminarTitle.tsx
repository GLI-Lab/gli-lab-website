import { Fragment, type ReactNode } from 'react';

type TitleToken =
  | { type: 'word'; text: string }
  | { type: 'underline-phrase'; text: string };

export type SeminarTitleBadge = 'none' | 'new' | 'todo';

/** "<br>phrase</br>" 구간은 한 덩어리로, 나머지는 단어 단위 토큰화 */
function tokenizeSeminarTitle(title: string): TitleToken[] {
  const tokens: TitleToken[] = [];
  const parts = title.split(/(<br>.*?<\/br>)/gi);

  for (const part of parts) {
    if (!part) continue;
    const underlineMatch = part.match(/^<br>(.*?)<\/br>$/i);
    if (underlineMatch) {
      tokens.push({ type: 'underline-phrase', text: underlineMatch[1] });
      continue;
    }
    const words = part.trim().split(/\s+/).filter(Boolean);
    for (const word of words) {
      tokens.push({ type: 'word', text: word });
    }
  }

  return tokens;
}

function getTitleTokenWordCount(token: TitleToken): number {
  if (token.type === 'underline-phrase') {
    return token.text
      .split(/\\+/)
      .flatMap((part) => part.trim().split(/\s+/).filter(Boolean))
      .length;
  }
  return 1;
}

function renderTitleToken(token: TitleToken, key: string | number): ReactNode {
  if (token.type === 'underline-phrase') {
    const parts = token.text.split(/\\+/).map((part) => part.trim()).filter(Boolean);
    return (
      <span key={key} className="underline underline-offset-4 decoration-1.5">
        {parts.map((part, index) => (
          <Fragment key={`${key}-part-${index}`}>
            {index > 0 && <br />}
            {part}
          </Fragment>
        ))}
      </span>
    );
  }
  return token.text;
}

function renderTitleBadge(badge: SeminarTitleBadge): ReactNode | null {
  if (badge === 'none') return null;

  const colorClass = badge === 'new' ? 'text-red-500' : 'text-blue-500';
  const letters = badge === 'new' ? ['N', 'e', 'w'] : ['T', 'O', 'D', 'O'];

  return (
    <span className={`ml-1.5 text-xs font-bold ${colorClass} inline-flex`}>
      {letters.map((letter, index) => (
        <span key={letter + index} className="animate-bounce" style={{ animationDelay: `${index * 100}ms` }}>
          {letter}
        </span>
      ))}
    </span>
  );
}

/** 타이틀을 \\ 기준으로 분리하되, <br>...</br> 블록 내부의 \\는 유지 */
export function splitTitleLines(title: string): string[] {
  if (!/\\/.test(title)) return [title];

  const brBlocks: string[] = [];
  const protectedTitle = title.replace(/<br>[\s\S]*?<\/br>/gi, (match) => {
    const index = brBlocks.length;
    brBlocks.push(match);
    return `\x00BR${index}\x00`;
  });

  const lines = protectedTitle.split(/\\+/).map((line) => line.trim()).filter(Boolean);
  if (lines.length <= 1) return [title];

  return lines.map((line) =>
    line.replace(/\x00BR(\d+)\x00/g, (_, index) => brBlocks[Number(index)] ?? '')
  );
}

function renderSeminarTitleLine(line: string, badge: SeminarTitleBadge): ReactNode {
  const tokens = tokenizeSeminarTitle(line);
  if (tokens.length === 0) return line;

  const titleBadge = renderTitleBadge(badge);

  const renderTokenGroup = (group: TitleToken[], keyPrefix: string) =>
    group.map((token, index) => (
      <Fragment key={`${keyPrefix}-${index}`}>
        {index > 0 ? ' ' : ''}
        {renderTitleToken(token, `${keyPrefix}-${index}`)}
      </Fragment>
    ));

  if (badge === 'none') {
    return <>{renderTokenGroup(tokens, 'title')}</>;
  }

  const totalWords = tokens.reduce((sum, token) => sum + getTitleTokenWordCount(token), 0);
  if (totalWords <= 2) {
    return (
      <span className="whitespace-nowrap">
        {renderTokenGroup(tokens, 'title')}
        {titleBadge}
      </span>
    );
  }

  let wordsBeforeLastTwo = totalWords - 2;
  const restTokens: TitleToken[] = [];
  const lastTwoTokens: TitleToken[] = [];

  for (const token of tokens) {
    const wordCount = getTitleTokenWordCount(token);
    if (wordsBeforeLastTwo > 0) {
      if (wordsBeforeLastTwo >= wordCount) {
        restTokens.push(token);
        wordsBeforeLastTwo -= wordCount;
      } else if (token.type === 'underline-phrase') {
        lastTwoTokens.push(token);
      } else {
        restTokens.push(token);
        wordsBeforeLastTwo -= wordCount;
      }
    } else {
      lastTwoTokens.push(token);
    }
  }

  return (
    <>
      {restTokens.length > 0 && <>{renderTokenGroup(restTokens, 'rest')}{' '}</>}
      <span className="whitespace-nowrap">
        {renderTokenGroup(lastTwoTokens, 'last')}
        {titleBadge}
      </span>
    </>
  );
}

export function renderSeminarTitle(title: string, badge: SeminarTitleBadge = 'none'): ReactNode {
  const lines = splitTitleLines(title);
  if (lines.length === 0) return title;

  if (lines.length === 1) {
    return renderSeminarTitleLine(lines[0], badge);
  }

  return (
    <>
      {lines.map((line, index) => (
        <Fragment key={`line-${index}`}>
          {index > 0 && <br />}
          {renderSeminarTitleLine(line, index === lines.length - 1 ? badge : 'none')}
        </Fragment>
      ))}
    </>
  );
}

export function renderSeminarDescription(description: string): ReactNode {
  const lines = splitTitleLines(description);
  if (lines.length === 0) return description;
  if (lines.length === 1) return lines[0];

  return (
    <>
      {lines.map((line, index) => (
        <Fragment key={`desc-${index}`}>
          {index > 0 && <br />}
          {line}
        </Fragment>
      ))}
    </>
  );
}

/** 프로필 등 plain text 표시용 — <br>...</br>, \\ 마크업 제거 */
export function formatSeminarTitlePlain(title: string): string {
  return title
    .replace(/<br>(.*?)<\/br>/gi, '$1')
    .replace(/\\+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}
