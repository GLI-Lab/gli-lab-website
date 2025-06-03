import yaml from 'js-yaml';
import path from 'path';
import fs from 'fs/promises';
import { ProfileYAML, ProfileData, PaperData } from './profiles';

// YAML 프로필을 컴포넌트에서 사용하는 형태로 변환
function transformProfile(yamlProfile: ProfileYAML): ProfileData {
  // GitHub URL 정규화
  const githubUrls = (yamlProfile.contacts.github || []).map(github => {
    return github.startsWith('https://') ? github : `https://github.com/${github}`;
  });

  // LinkedIn URL 정규화
  const linkedinUrls = (yamlProfile.contacts.linkedin || []).map(linkedin => {
    return linkedin.startsWith('https://') ? linkedin : `https://www.linkedin.com/in/${linkedin}`;
  });

  // Photo 경로 정규화
  const photoUrls = (yamlProfile.photos || []).map(photo => {
    return photo.startsWith('/images/profiles/') ? photo : `/images/profiles/${photo}`;
  });

  return {
    id: yamlProfile.id || "",
    type: yamlProfile.position || "",
    title: yamlProfile.title || "",
    name_en: yamlProfile.name.en || "",
    name_ko: yamlProfile.name.ko || "",
    admission: yamlProfile.education.admission || "",
    bs: yamlProfile.education.bs || "",
    ms: yamlProfile.education.ms || "",
    phd: yamlProfile.education.phd || "",
    academic_year: yamlProfile.academic.year,
    academic_semester: yamlProfile.academic.semester,
    joined: yamlProfile.joined || "",
    interest: yamlProfile.interests || [],
    current_work: yamlProfile.current_work || [],
    photo: photoUrls.length > 0 ? photoUrls : ["/images/profiles/ku_basic_1_down.png"],
    email: yamlProfile.contacts.emails || [],
    homepage: yamlProfile.contacts.homepage || [],
    github: githubUrls,
    linkedin: linkedinUrls,
  };
}

// 가장 최신 프로필 파일을 찾는 함수
async function getLatestProfilesFile(): Promise<string> {
  const dataDir = path.join(process.cwd(), 'src', 'data', 'profiles');
  const files = await fs.readdir(dataDir);
  
  // [YYYY-N] profiles.yaml 패턴의 파일들 필터링
  const profileFiles = files.filter(file => 
    file.match(/^\[(\d{4})-(\d+)\] profiles\.yaml$/)
  );
  
  if (profileFiles.length === 0) {
    throw new Error('No profile files found');
  }
  
  // 파일명을 날짜순으로 정렬 (가장 최신이 마지막)
  profileFiles.sort((a, b) => {
    const aMatch = a.match(/^\[(\d{4})-(\d+)\]/);
    const bMatch = b.match(/^\[(\d{4})-(\d+)\]/);
    
    if (!aMatch || !bMatch) return 0;
    
    const aYear = parseInt(aMatch[1]);
    const aVersion = parseInt(aMatch[2]);
    const bYear = parseInt(bMatch[1]);
    const bVersion = parseInt(bMatch[2]);
    
    if (aYear !== bYear) {
      return aYear - bYear;
    }
    return aVersion - bVersion;
  });
  
  return path.join(dataDir, profileFiles[profileFiles.length - 1]);
}

// 현재 프로필 데이터를 가져오는 함수
export async function getProfiles(): Promise<ProfileData[]> {
  const filePath = await getLatestProfilesFile();
  const yamlText = await fs.readFile(filePath, 'utf8');
  const rawData = yaml.load(yamlText) as ProfileYAML[];
  return rawData.map(transformProfile);
}

// Paper 데이터를 가져오는 함수
export async function getPapers(): Promise<PaperData[]> {
  try {
    const filePath = path.join(process.cwd(), 'src', 'data', 'paper.yaml');
    const yamlText = await fs.readFile(filePath, 'utf8');
    const rawData = yaml.load(yamlText) as PaperData[];
    return rawData;
  } catch (error) {
    console.error('Error loading paper data:', error);
    return [];
  }
} 