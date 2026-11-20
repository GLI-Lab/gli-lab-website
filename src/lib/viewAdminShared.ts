/**
 * 관리자 조회수 화면(/admin/views)의 서버 코드와 브라우저 코드가 함께 쓰는 타입과 상수.
 * 브라우저 쪽 컴포넌트가 가져다 쓰므로, 서버 전용 모듈(Redis, next/headers 등)을 여기서 import하면 안 된다.
 * (`import type`은 괜찮다. 타입만 가져오고 코드는 딸려 오지 않는다.)
 */

import type { ViewDataset } from '@/lib/viewStore';

export type { ViewDataset };

/** 주소의 ?data= 값으로도 쓴다 */
export const VIEW_DATASETS: readonly ViewDataset[] = ['production', 'development'];

export function isViewDataset(value: unknown): value is ViewDataset {
  return value === 'production' || value === 'development';
}

/** 직접 입력할 수 있는 조회수의 상한 (오타로 터무니없는 값이 들어가는 것을 막는다) */
export const VIEW_COUNT_MAX = 100_000_000;

/** 전체 초기화를 실행하려면 확인 창에 이 문구를 직접 입력해야 한다 */
export const RESET_ALL_CONFIRM_TEXT = '전체 초기화';

/** 확인 문구 비교용: 앞뒤 공백과 대소문자, 연속된 공백의 차이는 무시한다 */
export function normalizeConfirmText(text: string): string {
  return text.trim().replace(/\s+/g, ' ').toLowerCase();
}

export function matchesConfirmText(typed: string, accepted: readonly string[]): boolean {
  const value = normalizeConfirmText(typed);
  return value !== '' && accepted.some((text) => normalizeConfirmText(text) === value);
}

export type ViewLogAction = 'edit' | 'reset' | 'reset-all' | 'undo';

export interface ViewLogEntry {
  /** 기록을 가리키는 값 (되돌리기 요청에 쓴다) */
  key: string;
  /** 바꾼 시각 (ms) */
  at: number;
  action: ViewLogAction;
  /** action이 'undo'일 때, 무엇을 되돌렸는지 */
  undoOf?: ViewLogAction;
  /** 항목 id → [바꾸기 전 값, 바꾼 뒤 값] */
  changes: Record<string, [before: number, after: number]>;
}

export interface ViewAdminData {
  /** 항목 id → 조회수. 한 번도 열리지 않은 항목은 들어 있지 않다 */
  counts: Record<string, number>;
  log: ViewLogEntry[];
  /** 이 숫자가 운영 데이터인지 개발용 데이터인지 */
  dataset: ViewDataset;
}

export type ViewAdminResult = { ok: true; message: string } | { ok: false; message: string };

export type ViewAdminSection = 'members' | 'alumni';

/**
 * 표의 한 줄 = 사람 한 명(id 하나).
 * 멤버 목록과 졸업생 목록에 모두 있는 사람(인턴을 마치고 대학원생으로 다시 들어온 경우 등)은 id와 조회수가 하나이므로
 * 한 줄로 합치고 sections에 둘 다 넣는다.
 * 프로필 목록에 없는 항목(주소가 바뀌어 짝을 잃은 조회수)은 sections가 비어 있고 이름도 비어 있다.
 */
export interface ViewAdminRow {
  id: string;
  nameEn: string;
  nameKo: string;
  sections: ViewAdminSection[];
  title: string;
  count: number;
}
