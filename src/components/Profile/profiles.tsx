import yaml from 'js-yaml';
import path from 'path';
import fs from 'fs/promises';

// Study data interface (to avoid importing from Study component)
export interface StudyData {
  id: string
  title: string
  start_date: string
  end_date: string | null
  profile_ids: string[]
  link?: string
}

export interface ProfileYAML {
  id: string;
  position: string;
  title: string;
  name: {
    en: string;
    ko: string;
  };
  education: {
    admission: string | null;
    bs: string;
    ms: string | null;
    phd: string | null;
  };
  academic: {
    year: number | null;
    semester: number | null;
  };
  joined: string | null;
  interests: string[];
  current_work: string[];
  photos: string[];
  contacts: {
    emails: string[];
    homepage: string | null;
    github: string[] | null;
    linkedin: string | null;
  };
}

export interface ProfileData {
  id: string;
  type: string;
  title: string;
  name_en: string;
  name_ko: string;
  admission: string | null;
  bs: string;
  ms: string | null;
  phd: string | null;
  academic_year: number | null;
  academic_semester: number | null;
  joined: string | null;
  interest: string;
  current_work: string[];
  photo: string[];
  email: string[];
  homepage: string | null;
  github: string[];
  linkedin: string | null;
}

export interface ProfileItemProps extends ProfileData {
  onClick?: () => void;
  isSelected?: boolean;
}

export interface ProfileDetailProps extends ProfileData {
  studies?: StudyData[];
}

// YAML 프로필을 컴포넌트에서 사용하는 형태로 변환
function transformProfile(yamlProfile: ProfileYAML): ProfileData {
  // GitHub URL 형식 통일
  const githubUrls = yamlProfile.contacts.github?.map(github => {
    if (github.startsWith('https://')) {
      return github;
    } else if (github.startsWith('github.com/')) {
      return `https://${github}`;
    } else {
      return `https://github.com/${github}`;
    }
  }) || [];

  return {
    id: yamlProfile.id,
    type: yamlProfile.position,
    title: yamlProfile.title,
    name_en: yamlProfile.name.en,
    name_ko: yamlProfile.name.ko,
    admission: yamlProfile.education.admission,
    bs: yamlProfile.education.bs,
    ms: yamlProfile.education.ms,
    phd: yamlProfile.education.phd,
    academic_year: yamlProfile.academic.year,
    academic_semester: yamlProfile.academic.semester,
    joined: yamlProfile.joined,
    interest: yamlProfile.interests.join(', '),
    current_work: yamlProfile.current_work,
    photo: yamlProfile.photos,
    email: yamlProfile.contacts.emails,
    homepage: yamlProfile.contacts.homepage,
    github: githubUrls,
    linkedin: yamlProfile.contacts.linkedin ? 
      yamlProfile.contacts.linkedin.startsWith('https://') ? 
        yamlProfile.contacts.linkedin : 
        `https://www.linkedin.com/in/${yamlProfile.contacts.linkedin}` 
      : null,
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
