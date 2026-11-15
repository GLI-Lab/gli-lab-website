import type { ProjectData } from '@/data/loaders/types';
import { titleToId } from '@/lib/utils';

export interface ProjectPreview {
  href: string;
  title: string;
  /** 주관 기관 › 사업명. 없으면 상위 기관 › 사업명이 들어간다. */
  main: string;
  /** 상위 기관 › 사업명. main에 이미 썼거나 없으면 빈 문자열. */
  parent: string;
  /** 과제 유형 (개인연구, 집단연구 …) */
  type: string;
  /** 기간 (2026.09 ~ 2027.08) */
  period: string;
  /** 연구책임자·공동연구자·참여연구자일 때만 뱃지로 보여 준다. */
  role?: string;
  /** 연구책임자면 강조색 뱃지. */
  isLead?: boolean;
}

/** 키는 titleToId(프로젝트 제목) */
export type ProjectPreviews = Record<string, ProjectPreview>;

const PATH_SEPARATOR = '  ›  ';
const BADGE_ROLES = ['연구책임자', '공동연구자', '참여연구자'];

/** "연구책임자(학생)"처럼 괄호가 붙어도 기본 역할과 같은 뱃지를 쓴다 */
export function roleBadgeKey(role: string): string {
  const match = role.match(/^(연구책임자|공동연구자|참여연구자)(?:\([^)]*\))?$/);
  return match ? match[1] : role;
}

/** YYYY-MM, YYYY-MM -> YYYY.MM ~ YYYY.MM */
export function formatDateRange(start: string, end: string): string {
  const s = start?.replace(/-/g, '.') ?? '';
  const e = end?.replace(/-/g, '.') ?? '';
  return s && e ? `${s} ~ ${e}` : s || e;
}

function joinFunderPath(funder: string | null, program: string | null): string {
  return [funder, program].filter(Boolean).join(PATH_SEPARATOR);
}

export function projectToPreview(project: ProjectData): ProjectPreview {
  const mainPath = joinFunderPath(project.main.funder, project.main.program);
  const parentPath = joinFunderPath(project.parent.funder, project.parent.program);
  const roleKey = roleBadgeKey(project.role);
  const hasRole = BADGE_ROLES.includes(roleKey);

  return {
    href: `/research/projects#${encodeURIComponent(titleToId(project.title))}`,
    title: project.title,
    main: mainPath || parentPath,
    parent: mainPath ? parentPath : '',
    type: project.type,
    period: formatDateRange(project.start_date, project.end_date),
    role: hasRole ? project.role : undefined,
    isLead: hasRole && roleKey === '연구책임자' ? true : undefined,
  };
}

export function buildProjectPreviews(projects: ProjectData[]): ProjectPreviews {
  const previews: ProjectPreviews = {};
  for (const project of projects) {
    previews[titleToId(project.title)] = projectToPreview(project);
  }
  return previews;
}
