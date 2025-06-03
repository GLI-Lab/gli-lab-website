// Study data interface (to avoid importing from Study component)
export interface StudyData {
  title: string
  start_date: string
  end_date: string | null
  participants: string[]
  link?: string
}

// Author data interface for papers
export interface AuthorData {
  role: string;           // "1저자", "공동저자", "교신저자" etc.
  profileId: string | null;
  displayName: string;
}

// Paper data interface
export interface PaperData {
  title: string
  status: string
  link: string | null
  authors: AuthorData[]
}

export interface ProfileYAML {
  id: string;
  position: string | null;
  title: string | null;
  name: {
    en: string | null;
    ko: string | null;
  };
  education: {
    admission: string | null;
    bs: string | null;
    ms: string | null;
    phd: string | null;
  };
  academic: {
    year: number | null;
    semester: number | null;
  };
  joined: string | null;
  interests: string[] | null;
  current_work: string[] | null;
  photos: string[] | null;
  contacts: {
    emails: string[] | null;
    homepage: string[] | null;
    github: string[] | null;
    linkedin: string[] | null;
  };
}

export interface ProfileData {
  id: string;
  type: string;
  title: string;
  name_en: string;
  name_ko: string;
  admission: string;
  bs: string;
  ms: string;
  phd: string;
  academic_year: number | null;
  academic_semester: number | null;
  joined: string;
  interest: string[];
  current_work: string[];
  photo: string[];
  email: string[];
  homepage: string[];
  github: string[];
  linkedin: string[];
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

// AuthorData에서 특정 프로필의 역할을 찾는 함수
export function findUserRoleInPaper(authors: AuthorData[], profileId: string): string | null {
  const author = authors.find(author => author.profileId === profileId);
  return author ? author.role : null;
}

// 특정 profile ID와 관련된 논문들을 필터링하는 함수
export function getPapersForProfile(papers: PaperData[], profileId: string): PaperData[] {
  return papers.filter(paper => 
    paper.authors.some(author => author.profileId === profileId)
  );
}
