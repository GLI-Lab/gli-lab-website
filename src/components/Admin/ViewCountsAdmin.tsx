'use client';

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState, useTransition } from 'react';

import {
  editViewCountAction,
  resetAllViewCountsAction,
  resetViewCountAction,
  undoViewChangeAction,
} from '@/app/admin/views/actions';
import {
  matchesConfirmText,
  RESET_ALL_CONFIRM_TEXT,
  VIEW_COUNT_MAX,
  VIEW_DATASETS,
  type ViewAdminResult,
  type ViewAdminRow,
  type ViewDataset,
  type ViewLogAction,
  type ViewLogEntry,
} from '@/lib/viewAdminShared';

/**
 * 관리자 조회수 화면의 본문 (/admin/views). 표를 정렬·필터하고, 숫자를 수정·초기화·되돌린다.
 * 데이터는 page(서버)가 넘겨 주고, 바꾸는 일은 서버 액션(`app/admin/views/actions.ts`)이 한다.
 * 액션이 성공하면 page가 다시 그려져 새 숫자가 props로 들어온다.
 *
 * 운영 데이터와 개발용 데이터 중 하나를 골라 본다 (주소의 ?data=). 수정·초기화·되돌리기는 지금 고른 쪽에만 적용된다.
 *
 * 초기화는 두 단계로 확인한다: 확인 창을 띄워 무엇이 지워지는지 보여 주고, 확인 문구를 직접 입력해야 실행된다.
 * (한 사람은 그 사람의 이름, 전체는 "전체 초기화". 같은 문구를 서버에서도 다시 확인한다.)
 */

type Filter = 'all' | 'members' | 'alumni';
type SortKey = 'count' | 'name' | 'section' | 'title';
type Sort = { key: SortKey; direction: 'asc' | 'desc' };

type Dialog =
  | { type: 'reset'; row: ViewAdminRow }
  | { type: 'reset-all' }
  | { type: 'undo'; entry: ViewLogEntry };

interface ViewCountsAdminProps {
  rows: ViewAdminRow[];
  /** 프로필 목록에 없는 id의 조회수 */
  orphans: ViewAdminRow[];
  log: ViewLogEntry[];
  /** 지금 보고 있는(그리고 바꾸게 되는) 데이터 */
  dataset: ViewDataset;
  /** 이 서버가 방문을 기록하는 데이터. 배포된 사이트는 운영, 로컬 개발 서버는 개발용 */
  currentDataset: ViewDataset;
}

const DATASET_LABEL: Record<ViewDataset, string> = { production: '운영', development: '개발용' };

const DATASET_DESCRIPTION: Record<ViewDataset, string> = {
  production: '배포된 사이트가 쌓는 숫자입니다. 여기서 바꾸면 실제 사이트에 표시되는 숫자가 바뀝니다.',
  development: '로컬 개발 서버(next dev)가 쌓는 숫자입니다. 실제 사이트에는 표시되지 않습니다.',
};

const FILTERS: { value: Filter; label: string }[] = [
  { value: 'all', label: '전체' },
  { value: 'members', label: '멤버' },
  { value: 'alumni', label: '졸업생' },
];

const SECTION_LABEL = { members: '멤버', alumni: '졸업생' } as const;

const ACTION_LABEL: Record<ViewLogAction, string> = {
  edit: '수정',
  reset: '초기화',
  'reset-all': '전체 초기화',
  undo: '되돌림',
};

const formatCount = (count: number) => count.toLocaleString('en-US');

/**
 * 시각을 한국 시간으로 "2026.11.20 08:59"처럼 적는다.
 * Intl이나 toLocaleString을 쓰지 않는다. 서버(Node)와 브라우저의 표기가 조금만 달라도 hydration 경고가 나기 때문이다.
 */
function formatTime(at: number): string {
  const kst = new Date(at + 9 * 60 * 60 * 1000);
  const pad = (value: number) => String(value).padStart(2, '0');
  return `${kst.getUTCFullYear()}.${pad(kst.getUTCMonth() + 1)}.${pad(kst.getUTCDate())} ${pad(kst.getUTCHours())}:${pad(kst.getUTCMinutes())}`;
}

/** 프로필 목록에 있는 사람인지 (없으면 이름 대신 id로 표시한다) */
const isKnown = (row: ViewAdminRow) => row.sections.length > 0;
const displayName = (row: ViewAdminRow) => (isKnown(row) ? `${row.nameKo} (${row.nameEn})` : row.id);
const sectionLabel = (row: ViewAdminRow) => row.sections.map((section) => SECTION_LABEL[section]).join(' · ');

const BUTTON = 'px-2.5 py-1 rounded-md border text-[14px] transition-colors disabled:opacity-40 disabled:cursor-not-allowed';
const BUTTON_PLAIN = `${BUTTON} border-gray-300 text-gray-700 hover:bg-gray-100`;
const BUTTON_PRIMARY = `${BUTTON} border-interactive-primary bg-interactive-primary text-white hover:opacity-90`;
const BUTTON_DANGER = `${BUTTON} border-red-300 text-red-700 hover:bg-red-50`;
const BUTTON_DANGER_SOLID = `${BUTTON} border-red-600 bg-red-600 text-white hover:bg-red-700`;

export function ViewCountsAdmin({ rows, orphans, log, dataset, currentDataset }: ViewCountsAdminProps) {
  const [filter, setFilter] = useState<Filter>('all');
  const [sort, setSort] = useState<Sort>({ key: 'count', direction: 'desc' });
  const [editing, setEditing] = useState<{ id: string; value: string } | null>(null);
  const [dialog, setDialog] = useState<Dialog | null>(null);
  const [notice, setNotice] = useState<ViewAdminResult | null>(null);
  const [isPending, startTransition] = useTransition();

  const visibleRows = useMemo(() => {
    const filtered = filter === 'all' ? rows : rows.filter((row) => row.sections.includes(filter));
    // 순위는 지금 보이는 범위 안에서 조회수가 더 많은 사람 수 + 1 (같은 조회수는 같은 순위)
    const ranked = filtered.map((row) => ({
      ...row,
      rank: 1 + filtered.filter((other) => other.count > row.count).length,
    }));
    const compare = (a: (typeof ranked)[number], b: (typeof ranked)[number]) => {
      switch (sort.key) {
        case 'count':
          return a.count - b.count;
        case 'name':
          return a.nameEn.localeCompare(b.nameEn);
        case 'section':
          return sectionLabel(a).localeCompare(sectionLabel(b));
        case 'title':
          return a.title.localeCompare(b.title);
      }
    };
    const sign = sort.direction === 'asc' ? 1 : -1;
    // 값이 같으면 조회수 많은 순, 그다음 이름순으로 둔다 (정렬할 때마다 순서가 흔들리지 않게)
    return ranked.sort((a, b) => sign * compare(a, b) || b.count - a.count || a.nameEn.localeCompare(b.nameEn));
  }, [rows, filter, sort]);

  const total = useMemo(() => visibleRows.reduce((sum, row) => sum + row.count, 0), [visibleRows]);
  const grandTotal = useMemo(
    () => [...rows, ...orphans].reduce((sum, row) => sum + row.count, 0),
    [rows, orphans]
  );
  const nameById = useMemo(() => {
    const names = new Map<string, string>();
    for (const row of [...rows, ...orphans]) names.set(row.id, displayName(row));
    return names;
  }, [rows, orphans]);

  /** 서버 액션을 실행하고 결과를 알린다. 성공하면 열려 있던 입력칸·확인 창을 닫는다 */
  const run = (action: () => Promise<ViewAdminResult>) => {
    startTransition(async () => {
      try {
        const result = await action();
        setNotice(result);
        if (result.ok) {
          setEditing(null);
          setDialog(null);
        }
      } catch {
        setNotice({ ok: false, message: '요청이 거부되었거나 실패했습니다. 페이지를 새로 고쳐 다시 로그인한 뒤 시도하세요.' });
      }
    });
  };

  const changeSort = (key: SortKey) => {
    setSort((current) =>
      current.key === key
        ? { key, direction: current.direction === 'asc' ? 'desc' : 'asc' }
        : { key, direction: key === 'count' ? 'desc' : 'asc' }
    );
  };

  const parseEditValue = (text: string): number | null => {
    if (!/^\d+$/.test(text.trim())) return null;
    const value = Number(text.trim());
    return Number.isSafeInteger(value) && value <= VIEW_COUNT_MAX ? value : null;
  };

  const saveEdit = () => {
    if (!editing) return;
    const value = parseEditValue(editing.value);
    if (value == null) return;
    run(() => editViewCountAction(dataset, editing.id, value));
  };

  const sortableHeader = (key: SortKey, label: string, className = '') => {
    const active = sort.key === key;
    return (
      <th
        scope="col"
        aria-sort={active ? (sort.direction === 'asc' ? 'ascending' : 'descending') : 'none'}
        className={`px-3 py-2 font-medium ${className}`}
      >
        <button
          type="button"
          onClick={() => changeSort(key)}
          className={`inline-flex items-center gap-1 hover:text-interactive-primary ${active ? 'text-interactive-primary' : ''}`}
        >
          {label}
          <span aria-hidden className="text-[11px] w-3">
            {active ? (sort.direction === 'asc' ? '▲' : '▼') : ''}
          </span>
        </button>
      </th>
    );
  };

  /** 조회수 칸과 작업 칸. 표 본문과 "목록에 없는 항목" 표가 함께 쓴다 */
  const countAndActions = (row: ViewAdminRow) => {
    const isEditing = editing?.id === row.id;
    const editValue = isEditing ? parseEditValue(editing.value) : null;
    return (
      <>
        <td className="px-3 py-2 text-right tabular-nums">
          {isEditing ? (
            <div className="flex flex-col items-end gap-1">
              <input
                type="text"
                inputMode="numeric"
                autoFocus
                aria-label={`${displayName(row)} 조회수`}
                value={editing.value}
                onChange={(event) => setEditing({ id: row.id, value: event.target.value })}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') saveEdit();
                  if (event.key === 'Escape') setEditing(null);
                }}
                className="w-28 px-2 py-1 border border-gray-400 rounded-md text-right focus:outline-none focus:border-interactive-primary"
              />
              <span className={`text-[13px] ${editValue == null ? 'text-red-600' : 'text-gray-500'}`}>
                {editValue == null
                  ? `0 ~ ${formatCount(VIEW_COUNT_MAX)}의 정수`
                  : `${formatCount(row.count)} → ${formatCount(editValue)}`}
              </span>
            </div>
          ) : (
            formatCount(row.count)
          )}
        </td>
        <td className="px-3 py-2">
          <div className="flex justify-end gap-1.5 whitespace-nowrap">
            {isEditing ? (
              <>
                <button
                  type="button"
                  className={BUTTON_PRIMARY}
                  disabled={isPending || editValue == null || editValue === row.count}
                  onClick={saveEdit}
                >
                  저장
                </button>
                <button type="button" className={BUTTON_PLAIN} disabled={isPending} onClick={() => setEditing(null)}>
                  취소
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  className={BUTTON_PLAIN}
                  disabled={isPending}
                  onClick={() => setEditing({ id: row.id, value: String(row.count) })}
                >
                  수정
                </button>
                <button
                  type="button"
                  className={BUTTON_DANGER}
                  disabled={isPending || row.count === 0}
                  onClick={() => setDialog({ type: 'reset', row })}
                >
                  초기화
                </button>
              </>
            )}
          </div>
        </td>
      </>
    );
  };

  const describeLog = (entry: ViewLogEntry) => {
    const ids = Object.keys(entry.changes);
    const label = entry.action === 'undo' && entry.undoOf ? `되돌림 (${ACTION_LABEL[entry.undoOf]})` : ACTION_LABEL[entry.action];
    if (ids.length === 1) {
      const [before, after] = entry.changes[ids[0]];
      return `${label}: ${nameById.get(ids[0]) ?? ids[0]}  ${formatCount(before)} → ${formatCount(after)}`;
    }
    const before = ids.reduce((sum, id) => sum + entry.changes[id][0], 0);
    const after = ids.reduce((sum, id) => sum + entry.changes[id][1], 0);
    return `${label}: ${ids.length}개 항목, 합계 ${formatCount(before)} → ${formatCount(after)}`;
  };

  return (
    <div className="max-w-screen-xl mx-auto px-4 pt-10 text-[15px]">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-2">
        <h1 className="text-[26px] font-medium tracking-tight">조회수 관리</h1>
        {/* 볼 데이터 고르기. 주소(?data=)가 바뀌면 page가 그쪽 숫자를 읽어 다시 그린다. 운영은 빨간색으로 구분한다 */}
        <nav aria-label="데이터 선택" className="inline-flex border border-gray-300 rounded-lg overflow-hidden text-[14px]">
          {VIEW_DATASETS.map((value) => {
            const active = value === dataset;
            const activeStyle = value === 'production' ? 'bg-red-600 text-white' : 'bg-gray-700 text-white';
            return (
              <Link
                key={value}
                href={`/admin/views/?data=${value}`}
                replace
                scroll={false}
                prefetch={false}
                aria-current={active ? 'page' : undefined}
                className={`px-3 py-1.5 ${active ? activeStyle : 'bg-white text-gray-700 hover:bg-gray-100'}`}
              >
                {DATASET_LABEL[value]} 데이터
              </Link>
            );
          })}
        </nav>
      </div>
      <p className="text-gray-600 mb-6">
        {DATASET_DESCRIPTION[dataset]}
        {dataset !== currentDataset && (
          <span className="block mt-1">
            지금 접속한 서버가 기록하는 쪽은 <strong>{DATASET_LABEL[currentDataset]} 데이터</strong>입니다. 여기서는 다른 쪽을
            보고 있습니다.
          </span>
        )}
      </p>

      <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-3">
          <div className="inline-flex border border-gray-300 rounded-lg overflow-hidden" role="group" aria-label="보기 범위">
            {FILTERS.map(({ value, label }) => (
              <button
                key={value}
                type="button"
                aria-pressed={filter === value}
                onClick={() => setFilter(value)}
                className={`px-3 py-1.5 text-[14px] ${filter === value ? 'bg-interactive-primary text-white' : 'bg-white text-gray-700 hover:bg-gray-100'}`}
              >
                {label}
              </button>
            ))}
          </div>
          <span className="text-gray-600">
            {visibleRows.length}명 · 조회수 합계 <span className="font-medium text-gray-900">{formatCount(total)}</span>
          </span>
        </div>
        <button
          type="button"
          className={BUTTON_DANGER}
          disabled={isPending || grandTotal === 0}
          onClick={() => setDialog({ type: 'reset-all' })}
        >
          전체 초기화
        </button>
      </div>

      {/* 실행 결과. 화면 읽기 프로그램에도 알린다 */}
      <div aria-live="polite" className="min-h-[28px] mb-2">
        {notice && (
          <p className={notice.ok ? 'text-interactive-primary' : 'text-red-700'}>{notice.message}</p>
        )}
      </div>

      <div className="overflow-x-auto border border-gray-200 rounded-lg">
        <table className="w-full min-w-[720px] border-collapse">
          <thead className="bg-gray-50 text-left text-gray-700 border-b border-gray-200">
            <tr>
              {sortableHeader('count', '순위', 'w-20')}
              {sortableHeader('name', '이름')}
              {sortableHeader('section', '구분', 'w-32')}
              {sortableHeader('title', '직위·학기')}
              {sortableHeader('count', '조회수', 'w-32 text-right')}
              <th scope="col" className="px-3 py-2 font-medium text-right w-40">
                작업
              </th>
            </tr>
          </thead>
          <tbody>
            {visibleRows.map((row) => (
              <tr key={row.id} className="border-b border-gray-100 last:border-b-0 hover:bg-gray-50">
                <td className="px-3 py-2 tabular-nums text-gray-600">{row.rank}</td>
                <td className="px-3 py-2">
                  <span className="font-medium">{row.nameEn}</span>
                  <span className="text-gray-600"> ({row.nameKo})</span>
                </td>
                <td className="px-3 py-2 whitespace-nowrap">{sectionLabel(row)}</td>
                <td className="px-3 py-2 text-gray-700">{row.title}</td>
                {countAndActions(row)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {orphans.length > 0 && (
        <section className="mt-10">
          <h2 className="text-[19px] font-medium mb-1">프로필 목록에 없는 항목</h2>
          <p className="text-gray-600 mb-3">
            저장소에는 조회수가 있지만 지금의 멤버·졸업생 목록에는 없는 주소(id)입니다. 주소가 바뀌었거나 프로필이 삭제된 경우입니다.
          </p>
          <div className="overflow-x-auto border border-gray-200 rounded-lg">
            <table className="w-full min-w-[480px] border-collapse">
              <thead className="bg-gray-50 text-left text-gray-700 border-b border-gray-200">
                <tr>
                  <th scope="col" className="px-3 py-2 font-medium">id</th>
                  <th scope="col" className="px-3 py-2 font-medium text-right w-32">조회수</th>
                  <th scope="col" className="px-3 py-2 font-medium text-right w-40">작업</th>
                </tr>
              </thead>
              <tbody>
                {orphans.map((row) => (
                  <tr key={row.id} className="border-b border-gray-100 last:border-b-0">
                    <td className="px-3 py-2 font-mono text-[14px] break-all">{row.id}</td>
                    {countAndActions(row)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <section className="mt-10">
        <h2 className="text-[19px] font-medium mb-1">최근 변경 기록</h2>
        <p className="text-gray-600 mb-3">
          이 화면에서 바꾼 내용입니다. 최근 20건까지, 마지막 변경 뒤 30일 동안 보관합니다. 되돌리면 그때 바뀐 만큼만 반대로
          적용되어, 그 사이에 쌓인 조회수는 유지됩니다.
        </p>
        {log.length === 0 ? (
          <p className="text-gray-500">기록이 없습니다.</p>
        ) : (
          <ul className="border border-gray-200 rounded-lg divide-y divide-gray-100">
            {log.map((entry) => (
              <li key={entry.key} className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 px-3 py-2">
                <span className="min-w-0">
                  <time dateTime={new Date(entry.at).toISOString()} className="text-gray-500 tabular-nums mr-3">
                    {formatTime(entry.at)}
                  </time>
                  <span className="whitespace-pre-wrap">{describeLog(entry)}</span>
                </span>
                <button
                  type="button"
                  className={BUTTON_PLAIN}
                  disabled={isPending}
                  onClick={() => setDialog({ type: 'undo', entry })}
                >
                  되돌리기
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      {dialog?.type === 'reset' && (
        <ConfirmDialog
          title="조회수 초기화"
          confirmLabel="초기화"
          danger
          pending={isPending}
          acceptedTexts={isKnown(dialog.row) ? [dialog.row.nameKo, dialog.row.nameEn] : [dialog.row.id]}
          promptText={isKnown(dialog.row) ? dialog.row.nameKo : dialog.row.id}
          onClose={() => setDialog(null)}
          onConfirm={(typed) => run(() => resetViewCountAction(dataset, dialog.row.id, typed))}
        >
          <p>
            <strong>{displayName(dialog.row)}</strong>의 조회수{' '}
            <strong className="tabular-nums">{formatCount(dialog.row.count)}</strong>을(를) 0으로 만듭니다.
          </p>
          <p className={`mt-2 ${dataset === 'production' ? 'text-red-700' : 'text-gray-600'}`}>
            {DATASET_LABEL[dataset]} 데이터의 숫자가 바뀝니다.
          </p>
        </ConfirmDialog>
      )}

      {dialog?.type === 'reset-all' && (
        <ConfirmDialog
          title="전체 초기화"
          confirmLabel="전체 초기화"
          danger
          pending={isPending}
          acceptedTexts={[RESET_ALL_CONFIRM_TEXT]}
          promptText={RESET_ALL_CONFIRM_TEXT}
          onClose={() => setDialog(null)}
          onConfirm={(typed) => run(() => resetAllViewCountsAction(dataset, typed))}
        >
          <p>
            멤버·졸업생 <strong>전체</strong>의 조회수를 0으로 만듭니다. 지금 보기 범위(필터)와 상관없이 모두 지워집니다.
          </p>
          <p className="mt-2">
            대상: 조회수가 있는 <strong>{[...rows, ...orphans].filter((row) => row.count > 0).length}개 항목</strong>, 합계{' '}
            <strong className="tabular-nums">{formatCount(grandTotal)}</strong>
          </p>
          <p className={`mt-2 ${dataset === 'production' ? 'text-red-700' : 'text-gray-600'}`}>
            {dataset === 'production'
              ? '운영 데이터입니다. 실제 사이트의 숫자가 지워집니다.'
              : '개발용 데이터입니다. 실제 사이트의 숫자는 그대로입니다.'}
          </p>
        </ConfirmDialog>
      )}

      {dialog?.type === 'undo' && (
        <ConfirmDialog
          title="변경 되돌리기"
          confirmLabel="되돌리기"
          pending={isPending}
          onClose={() => setDialog(null)}
          onConfirm={() => run(() => undoViewChangeAction(dataset, dialog.entry.key))}
        >
          <p className="whitespace-pre-wrap">{describeLog(dialog.entry)}</p>
          <p className="mt-2 text-gray-600">이 변경을 반대로 적용합니다. 그 뒤에 쌓인 조회수는 유지됩니다.</p>
        </ConfirmDialog>
      )}
    </div>
  );
}

interface ConfirmDialogProps {
  title: string;
  confirmLabel: string;
  danger?: boolean;
  pending: boolean;
  /** 주어지면, 이 중 하나를 직접 입력해야 실행 버튼이 켜진다 */
  acceptedTexts?: string[];
  /** 입력하라고 보여 줄 문구 */
  promptText?: string;
  onClose: () => void;
  onConfirm: (typed: string) => void;
  children: React.ReactNode;
}

function ConfirmDialog({
  title,
  confirmLabel,
  danger = false,
  pending,
  acceptedTexts,
  promptText,
  onClose,
  onConfirm,
  children,
}: ConfirmDialogProps) {
  const [typed, setTyped] = useState('');
  const cancelRef = useRef<HTMLButtonElement>(null);
  const needsText = acceptedTexts != null;
  const canConfirm = !pending && (!needsText || matchesConfirmText(typed, acceptedTexts));

  useEffect(() => {
    // 문구를 입력하지 않는 창은 "취소"에 초점을 둔다 (Enter를 눌러도 실행되지 않게)
    if (!needsText) cancelRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [needsText, onClose]);

  return (
    <div
      className="fixed inset-0 z-modal flex items-center justify-center bg-black/50 px-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div role="dialog" aria-modal="true" aria-label={title} className="w-full max-w-md bg-white rounded-xl shadow-xl p-5 text-[15px]">
        <h2 className="text-[19px] font-medium mb-3">{title}</h2>
        <div className="leading-relaxed">{children}</div>
        <form
          className="mt-4"
          onSubmit={(event) => {
            event.preventDefault();
            if (canConfirm) onConfirm(typed);
          }}
        >
          {needsText && (
            <label className="block mb-4">
              <span className="block mb-1 text-gray-700">
                계속하려면 <strong className="select-all">{promptText}</strong>을(를) 입력하세요.
              </span>
              <input
                type="text"
                autoFocus
                autoComplete="off"
                value={typed}
                onChange={(event) => setTyped(event.target.value)}
                className="w-full px-3 py-2 border border-gray-400 rounded-md focus:outline-none focus:border-interactive-primary"
              />
            </label>
          )}
          <div className="flex justify-end gap-2">
            <button ref={cancelRef} type="button" className={BUTTON_PLAIN} disabled={pending} onClick={onClose}>
              취소
            </button>
            <button type="submit" className={danger ? BUTTON_DANGER_SOLID : BUTTON_PRIMARY} disabled={!canConfirm}>
              {pending ? '처리 중…' : confirmLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
