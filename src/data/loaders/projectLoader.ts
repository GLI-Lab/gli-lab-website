import yaml from 'js-yaml';
import path from 'path';
import fs from 'fs/promises';
import {
  ProjectYAML,
  ProjectData,
  ProjectMember,
  ProjectManager,
} from "./types";

function normalizeImage(
  image: ProjectYAML["image"]
): ProjectData["image"] {
  if (image == null || image === "") return null;
  if (typeof image === "string") {
    return { url: image };
  }
  const w = image.width;
  return {
    url: image.url,
    width: typeof w === "string" ? parseInt(w, 10) : w,
  };
}

function normalizeParent(raw: ProjectYAML["parent"]): ProjectData["parent"] {
  if (!raw || typeof raw !== "object") {
    return { funder: "", program: null };
  }
  return {
    funder: raw.funder ?? "",
    program: raw.program?.trim() ? raw.program : null,
  };
}

function normalizeMain(raw: ProjectYAML["main"]): ProjectData["main"] {
  if (!raw || typeof raw !== "object") {
    return { funder: null, program: null };
  }
  return {
    funder: raw.funder?.trim() ? raw.funder : null,
    program: raw.program?.trim() ? raw.program : null,
  };
}

function normalizeMember(raw: ProjectMember | null | undefined): ProjectMember | null {
  if (!raw || typeof raw !== "object") return null;
  const name = raw.name?.trim();
  if (!name) return null;
  return {
    name,
    ID: raw.ID?.trim() ? raw.ID : undefined,
  };
}

function normalizeManager(raw: ProjectManager | null | undefined): ProjectManager | null {
  const base = normalizeMember(raw);
  if (!base) return null;
  return {
    ...base,
    since: raw?.since?.trim() ? raw.since : undefined,
    until: raw?.until?.trim() ? raw.until : undefined,
  };
}

function normalizeParticipants(
  raw: ProjectMember[] | null | undefined
): ProjectMember[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map(normalizeMember)
    .filter((member): member is ProjectMember => member !== null);
}

/** managers(또는 단수 manager)를 정규화. YAML 순서를 유지하며 until 유무로 현재/이전 구분 */
function normalizeManagers(raw: ProjectYAML): ProjectManager[] {
  const list: ProjectManager[] = [];
  if (Array.isArray(raw.managers)) {
    for (const m of raw.managers) {
      const normalized = normalizeManager(m);
      if (normalized) list.push(normalized);
    }
  }
  // 단수 manager 하위 호환
  const single = normalizeManager(raw.manager);
  if (single) list.push(single);
  return list;
}

function transformProjectData(raw: ProjectYAML): ProjectData {
  return {
    title: raw.title,
    type: raw.type,
    role: raw.role,
    parent: normalizeParent(raw.parent),
    main: normalizeMain(raw.main),
    start_date: raw.start_date,
    end_date: raw.end_date,
    image: normalizeImage(raw.image),
    managers: normalizeManagers(raw),
    participants: normalizeParticipants(raw.participants),
  };
}

export async function getProjects(): Promise<ProjectData[]> {
  try {
    const filePath = path.join(process.cwd(), 'src', 'data', 'project.yaml');
    const yamlText = await fs.readFile(filePath, 'utf8');
    const rawData = yaml.load(yamlText) as ProjectYAML[];
    return (rawData ?? []).map(transformProjectData);
  } catch (error) {
    console.error('Error loading projects data:', error);
    return [];
  }
}
