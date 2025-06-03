// Study data interface (to avoid importing from Study component)
export interface StudyData {
  title: string
  start_date: string
  end_date: string | null
  participants: string[]
  link?: string
}

// Paper data interface
export interface PaperData {
  title: string
  status: string
  link: string | null
  authors: string[]
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
  papers?: PaperData[];
}

// Author 문자열을 파싱하여 profile ID를 추출하는 함수
export function parseAuthorString(authorString: string): { profileId: string | null; displayName: string } {
  // <profile=[id] korean>English Name (korean)</> 형식 파싱
  const profileMatch = authorString.match(/<profile=([^\>]+)>([^<]+)<\/>/);
  
  if (profileMatch) {
    const profileId = profileMatch[1]; // [2024.07] 지상준 형태의 전체 ID
    const displayName = profileMatch[2]; // Sang-Jun Ji (지상준) 형태의 표시명
    return { profileId, displayName };
  }
  
  // 일반 텍스트인 경우
  return { profileId: null, displayName: authorString };
}

// 특정 profile ID와 관련된 논문들을 필터링하는 함수
export function getPapersForProfile(papers: PaperData[], profileId: string): PaperData[] {
  return papers.filter(paper => 
    paper.authors.some(author => {
      const parsed = parseAuthorString(author);
      return parsed.profileId === profileId;
    })
  );
}
