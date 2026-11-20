'use server';

import { refresh } from 'next/cache';
import { headers } from 'next/headers';

import { getAlumniProfiles, getProfiles } from '@/data/loaders';
import { isAdminAuthorization } from '@/lib/adminAuth';
import {
  editViewCount,
  readViewAdminData,
  resetAllViewCounts,
  resetViewCount,
  undoViewChange,
} from '@/lib/viewAdmin';
import {
  isViewDataset,
  matchesConfirmText,
  RESET_ALL_CONFIRM_TEXT,
  VIEW_COUNT_MAX,
  type ViewAdminResult,
  type ViewDataset,
} from '@/lib/viewAdminShared';

/**
 * 관리자 조회수 화면(/admin/views)의 수정·초기화·되돌리기.
 *
 * 서버 액션은 화면을 거치지 않고 요청만 보내도 실행되므로, 액션마다 다음을 직접 확인한다.
 *   - 권한: 요청에 관리자 비밀번호가 실려 있는지 (없으면 예외를 던져 크게 실패시킨다)
 *   - 입력값: 데이터 종류, id와 숫자의 형식, 초기화의 확인 문구 (브라우저에서 확인했더라도 서버에서 다시 본다)
 * 모든 액션의 첫 인자 dataset은 화면에서 고른 데이터(운영 또는 개발용)다. 그쪽 숫자만 바뀐다.
 * 성공하면 refresh()로 이 화면을 다시 그려, 같은 응답에 바뀐 숫자가 실려 오게 한다.
 */

const KIND = 'profile';

async function assertAdmin(): Promise<void> {
  const requestHeaders = await headers();
  if (!isAdminAuthorization(requestHeaders.get('authorization'))) {
    throw new Error('Unauthorized');
  }
}

function isValidId(id: unknown): id is string {
  return typeof id === 'string' && id.length > 0 && id.length <= 200;
}

/** id가 프로필 목록에 있으면 그 사람의 이름들을, 없으면 null을 돌려준다 */
async function findProfileNames(id: string): Promise<string[] | null> {
  const [members, alumni] = await Promise.all([getProfiles(), getAlumniProfiles()]);
  const profile = [...members, ...alumni].find((item) => item.id === id);
  return profile ? [profile.name_ko, profile.name_en] : null;
}

const INVALID_DATASET: ViewAdminResult = { ok: false, message: '잘못된 데이터 종류입니다.' };

/** 프로필 목록에는 없지만 저장소에 조회수가 남아 있는 id인지 */
async function isStoredId(dataset: ViewDataset, id: string): Promise<boolean> {
  const data = await readViewAdminData(dataset, KIND);
  return data != null && id in data.counts;
}

function finish(result: ViewAdminResult): ViewAdminResult {
  if (result.ok) refresh();
  return result;
}

export async function editViewCountAction(dataset: ViewDataset, id: string, value: number): Promise<ViewAdminResult> {
  await assertAdmin();
  if (!isViewDataset(dataset)) return INVALID_DATASET;
  if (!isValidId(id)) return { ok: false, message: '잘못된 항목입니다.' };
  if (!Number.isInteger(value) || value < 0 || value > VIEW_COUNT_MAX) {
    return { ok: false, message: `조회수는 0 이상 ${VIEW_COUNT_MAX.toLocaleString('en-US')} 이하의 정수여야 합니다.` };
  }
  if (!(await findProfileNames(id)) && !(await isStoredId(dataset, id))) {
    return { ok: false, message: '프로필 목록에도 저장소에도 없는 항목입니다.' };
  }
  return finish(await editViewCount(dataset, KIND, id, value));
}

/** typed: 확인 창에 입력한 문구. 그 사람의 이름(한글 또는 영문)이어야 한다. 프로필 목록에 없는 항목은 id */
export async function resetViewCountAction(dataset: ViewDataset, id: string, typed: string): Promise<ViewAdminResult> {
  await assertAdmin();
  if (!isViewDataset(dataset)) return INVALID_DATASET;
  if (!isValidId(id) || typeof typed !== 'string') return { ok: false, message: '잘못된 요청입니다.' };
  const accepted = (await findProfileNames(id)) ?? [id];
  if (!matchesConfirmText(typed, accepted)) return { ok: false, message: '확인 문구가 일치하지 않습니다.' };
  return finish(await resetViewCount(dataset, KIND, id));
}

/** typed: 확인 창에 입력한 문구. RESET_ALL_CONFIRM_TEXT여야 한다 */
export async function resetAllViewCountsAction(dataset: ViewDataset, typed: string): Promise<ViewAdminResult> {
  await assertAdmin();
  if (!isViewDataset(dataset)) return INVALID_DATASET;
  if (typeof typed !== 'string' || !matchesConfirmText(typed, [RESET_ALL_CONFIRM_TEXT])) {
    return { ok: false, message: '확인 문구가 일치하지 않습니다.' };
  }
  return finish(await resetAllViewCounts(dataset, KIND));
}

export async function undoViewChangeAction(dataset: ViewDataset, entryKey: string): Promise<ViewAdminResult> {
  await assertAdmin();
  if (!isViewDataset(dataset)) return INVALID_DATASET;
  if (typeof entryKey !== 'string' || entryKey.length === 0 || entryKey.length > 100) {
    return { ok: false, message: '잘못된 요청입니다.' };
  }
  return finish(await undoViewChange(dataset, KIND, entryKey));
}
