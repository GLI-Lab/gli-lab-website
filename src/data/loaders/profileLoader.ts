import yaml from 'js-yaml';
import path from 'path';
import fs from 'fs/promises';
import { ProfileYAML, ProfileData } from './types';

// YAML 프로필을 컴포넌트에서 사용하는 형태로 변환
function transformProfile(yamlProfile: ProfileYAML, isAlumni: boolean = false): ProfileData {
  const normalizeToArray = (value: string | string[] | null | undefined): string[] => {
    if (Array.isArray(value)) {
      return value.filter(v => typeof v === 'string' && v.trim() !== '');
    }
    if (typeof value === 'string') {
      const trimmed = value.trim();
      return trimmed ? [trimmed] : [];
    }
    return [];
  };
  // GitHub URL 정규화
  const githubUrls = (yamlProfile.contacts.github || []).map(github => {
    return github.startsWith('https://') ? github : `https://github.com/${github}`;
  });

  // LinkedIn URL 정규화
  const linkedinUrls = (yamlProfile.contacts.linkedin || []).map(linkedin => {
    return linkedin.startsWith('https://') ? linkedin : `https://www.linkedin.com/in/${linkedin}`;
  });

  // Photo 경로 정규화 - alumni인 경우 public/images/alumni에서 찾기
  const photoUrls = (yamlProfile.photos || []).map(photo => {
    return isAlumni ? `/images/profiles/alumni/${photo}.webp` : `/images/profiles/${photo}.webp`;
  });

  return {
    id: yamlProfile.id || "",
    type: yamlProfile.role.type || "",
    title: yamlProfile.role.title || "",
    name_en: yamlProfile.name.en || "",
    name_ko: yamlProfile.name.ko || "",
    bs: normalizeToArray(yamlProfile.education.bs),
    ms: normalizeToArray(yamlProfile.education.ms),
    phd: normalizeToArray(yamlProfile.education.phd),
    admission: yamlProfile.status.period.admission || "",
    graduation: yamlProfile.status.period.graduation || "",
    joined_start: yamlProfile.status.joined.start || "",
    joined_end: yamlProfile.status.joined.end || "",
    affiliation: yamlProfile.status.affiliation || "",
    interest: yamlProfile.interests || [],
    photo: photoUrls.length > 0 ? photoUrls : ["/images/profiles/ku_basic_1_down.png"],
    email: yamlProfile.contacts.emails || [],
    homepage: yamlProfile.contacts.homepage || [],
    github: githubUrls,
    linkedin: linkedinUrls,
  };
}

// 프로필 파일을 찾는 함수
async function findProfileFile(suffix: string): Promise<string> {
  const dataDir = path.join(process.cwd(), 'src', 'data', 'profiles');
  const files = await fs.readdir(dataDir);
  
  // 지정된 suffix로 끝나는 파일 찾기
  const profileFile = files.find(file => file.endsWith(suffix));
  
  if (!profileFile) {
    throw new Error(`No profile file found with suffix: ${suffix}`);
  }
  
  return path.join(dataDir, profileFile);
}

// 현재 프로필 데이터를 가져오는 함수
export async function getProfiles(): Promise<ProfileData[]> {
  try {
    const filePath = await findProfileFile('profiles.yaml');
    const yamlText = await fs.readFile(filePath, 'utf8');
    const rawData = yaml.load(yamlText) as ProfileYAML[];
    return rawData.map(profile => transformProfile(profile, false));
  } catch (error) {
    console.error('Error loading profiles data:', error);
    return [];
  }
}

// Alumni 프로필 데이터를 가져오는 함수
export async function getAlumniProfiles(): Promise<ProfileData[]> {
  try {
    const filePath = await findProfileFile('profiles-alumni.yaml');
    const yamlText = await fs.readFile(filePath, 'utf8');
    const rawData = yaml.load(yamlText) as ProfileYAML[];
    return rawData.map(profile => transformProfile(profile, true));
  } catch (error) {
    console.error('Error loading alumni data:', error);
    return [];
  }
} 