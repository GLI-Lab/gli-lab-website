import yaml from 'js-yaml';
import path from 'path';
import fs from 'fs/promises';
import { ProjectYAML, ProjectData } from "./types";

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
