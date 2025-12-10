import yaml from 'js-yaml';
import path from 'path';
import fs from 'fs/promises';
import { ProfileYAML, ProfileData } from './types';

// YAML 파일을 읽어서 프로필 데이터 반환
async function loadProfilesYAML(isAlumni: boolean = false): Promise<ProfileYAML[]> {
  try {
    const filePath = await findProfileFile(isAlumni ? 'profiles-alumni.yaml' : 'profiles.yaml');
    const yamlText = await fs.readFile(filePath, 'utf8');
    const rawData = yaml.load(yamlText) as ProfileYAML[];
    return rawData;
  } catch (error) {
    console.error(`Error loading ${isAlumni ? 'alumni' : 'profiles'} YAML:`, error);
    return [];
  }
}

// CV 파일명에서 버전 정보 추출 (예: "v251114" -> "2025-11-14")
function extractCVVersion(filename: string): string | undefined {
  const versionMatch = filename.match(/\(v(\d{6})\)/);
  if (!versionMatch) return undefined;
  
  const versionStr = versionMatch[1];
  const year = `20${versionStr.slice(0, 2)}`;
  const month = versionStr.slice(2, 4);
  const day = versionStr.slice(4, 6);
  
  return `${year}-${month}-${day}`;
}

// CV 파일을 찾는 함수 (URL과 버전 정보 반환)
async function getProfilesCVDict(isAlumni: boolean = false): Promise<Map<string, { url: string; version?: string }>> {
  try {
    const rawData = await loadProfilesYAML(isAlumni);
    const profileIds = new Set(rawData.map(profile => profile.id).filter(id => id));

    let files: string[] = [];
    try {
      files = await fs.readdir(path.join(process.cwd(), 'public', 'pdf', 'cv'));
    } catch (error) {
      return new Map();
    }
    
    const cvDict = new Map<string, { url: string; version?: string }>();
    
    // 각 프로필 ID로 시작하는 PDF 파일 찾기
    for (const profileId of profileIds) {
      const matchingFile = files.find(file => 
        file.startsWith(profileId) && file.endsWith('.pdf')
      );
      
      if (matchingFile) {
        const version = extractCVVersion(matchingFile);
        cvDict.set(profileId, {
          url: `/pdf/cv/${matchingFile}`,
          version
        });
      }
    }
    
    return cvDict;
  } catch (error) {
    console.error(`Error reading CV directory:`, error);
    return new Map();
  }
}

// 프로필 디렉토리의 파일들을 ID별로 그룹화하여 Dictionary로 반환
async function getProfilesPhotosDict(isAlumni: boolean = false): Promise<Map<string, string[]>> {
  try {
    const rawData = await loadProfilesYAML(isAlumni);
    const profileIds = new Set(rawData.map(profile => profile.id).filter(id => id));

    const files = await fs.readdir(path.join(process.cwd(), 'public', 'images', 'profiles'));
    
    const photosDict = new Map<string, string[]>();
    
    // 각 프로필 ID로 시작하는 파일들 찾기
    for (const profileId of profileIds) {
      const matchingFiles = files.filter(file => 
        file.startsWith(profileId)
      );
      
      if (matchingFiles.length > 0) {
        photosDict.set(profileId, matchingFiles.map(file => `/images/profiles/${file}`));
      } else {
        // 매칭되는 파일이 없으면 기본 이미지 사용
        photosDict.set(profileId, ["/images/profiles/ku_basic_1_down.webp"]);
      }
    }
    
    // 각 ID의 사진들을 정렬 (문자열 정렬로 충분, 1~9만 있으므로)
    for (const [profileId, photoUrls] of photosDict.entries()) {
      photoUrls.sort();
    }
    
    return photosDict;
  } catch (error) {
    console.error(`Error reading profiles directory:`, error);
    return new Map();
  }
}

// YAML 프로필을 컴포넌트에서 사용하는 형태로 변환
function transformProfile(yamlProfile: ProfileYAML, photosDict: Map<string, string[]>, cvDict: Map<string, { url: string; version?: string }>): ProfileData {
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

  // Google Scholar URL 정규화
  const scholarUrls = (yamlProfile.contacts.scholar || []).map(scholar => {
    return scholar.startsWith('https://') ? scholar : `https://scholar.google.com/citations?user=${scholar}`;
  });

  // Homepage URL 정규화
  const homepageUrls = (yamlProfile.contacts.homepage || []).map(homepage => {
    if (homepage.startsWith('http://') || homepage.startsWith('https://')) {
      return homepage;
    }
    return `https://${homepage}`;
  });

  // Dictionary에서 사진 URL 조회
  const photoUrls = photosDict.get(yamlProfile.id || "")!;
  // Dictionary에서 CV 정보 조회
  const cvInfo = cvDict.get(yamlProfile.id || "");

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
    photo: photoUrls,
    email: yamlProfile.contacts.emails || [],
    homepage: homepageUrls,
    github: githubUrls,
    linkedin: linkedinUrls,
    scholar: scholarUrls,
    cv: cvInfo?.url,
    cvVersion: cvInfo?.version,
  };
}

// 프로필 파일을 찾는 함수
async function findProfileFile(suffix: string): Promise<string> {
  const dataDir = path.join(process.cwd(), 'src', 'data', 'profiles');
  const files = await fs.readdir(dataDir);
  
  // 지정된 suffix로 끝나는 파일들 찾기
  const matchingFiles = files.filter(file => file.endsWith(suffix));
  
  if (matchingFiles.length === 0) {
    throw new Error(`No profile file found with suffix: ${suffix}`);
  }
  
  // [년도-학기] 형식의 파일명에서 최신 것 찾기
  const profileFile = findLatestFile(matchingFiles);
  
  return path.join(dataDir, profileFile);
}

// [년도-학기] 형식의 파일명에서 최신 파일을 찾는 함수
function findLatestFile(files: string[]): string {
  const fileWithYearSemester = files.map(file => {
    // [년도-학기] 패턴 매칭
    const match = file.match(/^\[(\d{4})-(\d+)\]/);
    if (match) {
      const year = parseInt(match[1]);
      const semester = parseInt(match[2]);
      return { file, year, semester };
    }
    // 패턴이 없는 경우 기본값으로 처리 (가장 나중에 선택되도록)
    return { file, year: 0, semester: 0 };
  });
  
  // 년도 내림차순, 학기 내림차순으로 정렬
  fileWithYearSemester.sort((a, b) => {
    if (a.year !== b.year) {
      return b.year - a.year;
    }
    return b.semester - a.semester;
  });
  
  return fileWithYearSemester[0].file;
}

// 현재 프로필 데이터를 가져오는 함수
export async function getProfiles(): Promise<ProfileData[]> {
  try {
    const rawData = await loadProfilesYAML(false);
    const photosDict = await getProfilesPhotosDict(false);
    const cvDict = await getProfilesCVDict(false);
    return rawData.map(profile => transformProfile(profile, photosDict, cvDict));
  } catch (error) {
    console.error('Error loading profiles data:', error);
    return [];
  }
}

// Alumni 프로필 데이터를 가져오는 함수
export async function getAlumniProfiles(): Promise<ProfileData[]> {
  try {
    const rawData = await loadProfilesYAML(true);
    const photosDict = await getProfilesPhotosDict(true);
    const cvDict = await getProfilesCVDict(true);
    return rawData.map(profile => transformProfile(profile, photosDict, cvDict));
  } catch (error) {
    console.error('Error loading alumni data:', error);
    return [];
  }
}

// 현재 멤버 ID 리스트만 가져오는 함수
export async function getMemberIds(): Promise<string[]> {
  try {
    const rawData = await loadProfilesYAML(false);
    return rawData.map(profile => profile.id).filter(id => id);
  } catch (error) {
    console.error('Error loading member IDs:', error);
    return [];
  }
}

// Alumni ID 리스트만 가져오는 함수
export async function getAlumniIds(): Promise<string[]> {
  try {
    const rawData = await loadProfilesYAML(true);
    return rawData.map(profile => profile.id).filter(id => id);
  } catch (error) {
    console.error('Error loading alumni IDs:', error);
    return [];
  }
} 