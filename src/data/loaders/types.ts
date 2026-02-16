// Centralized type definitions for data loaders

// =====================================================
// Profile Types
// =====================================================

export interface ProfileYAML {
  id: string;
  role: {
    type: string | null;
    title: string | null;
  };
  name: {
    en: string | null;
    ko: string | null;
  };
  education: {
    bs: string | string[] | null;
    ms: string | string[] | null;
    phd: string | string[] | null;
  };
  interests: string[] | null;
  photos: string[] | null;
  contacts: {
    emails: string[] | null;
    homepage: string[] | null;
    github: string[] | null;
    linkedin: string[] | null;
    scholar: string[] | null;
  };
  status: {
    period: {
      admission: string | null;
      graduation: string | null;
    };
    joined: {
      start: string | null;
      end: string | null;
    };
    affiliation: string | null;
  };
}

export interface ProfileData {
  id: string;
  type: string;
  title: string;
  name_en: string;
  name_ko: string;
  admission: string;
  bs: string[];
  ms: string[];
  phd: string[];
  joined_start: string;
  joined_end: string;
  graduation?: string;
  affiliation?: string;
  interest: string[];
  photo: string[];
  email: string[];
  homepage: string[];
  github: string[];
  linkedin: string[];
  scholar: string[];
  cv?: string;
  cvVersion?: string;
}

export interface ProfileItemProps extends ProfileData {
  onClick?: () => void;
  isSelected?: boolean;
  isAlumniPage?: boolean;
}

export interface ProfileDetailProps extends ProfileData {
  studies?: StudyData[];
  papers?: PaperData[];
  patents?: PatentData[];
  isAlumniPage?: boolean;
}

// =====================================================
// Paper Types
// =====================================================

// Raw paper data interface (as it comes from YAML)
export interface PaperYAML {
  title: string;
  filter: { type: string; scope: string };
  status: string;
  year: number;
  venue: { name: string; acronym: string };
  links?: {
    [key: string]: string | null | undefined;
  };
  notes: {normal: string; important: string;};
  authors: {
    ID?: string;
    name: string;
    position: 'first' | 'co';
    isCorresponding?: boolean;
  }[];
}

export interface AuthorData {
  ID?: string;
  name: string;
  position: 'first' | 'co';
  isCorresponding?: boolean;
}

export interface PaperData {
  title: string;
  filter: { type: string; scope: string };
  status: string;
  year: number;
  venue: { name: string; acronym: string };
  links?: {
    [key: string]: string | null | undefined;
  };
  notes: { normal: string; important: string };
  authors: AuthorData[];
}

// =====================================================
// Study Types
// =====================================================

export interface StudyData {
  id: string;
  title: string;
  description: string;
  participants: string[];
  start_date: string;
  end_date: string;
  status: string;
  link?: string;
}

// =====================================================
// Seminar Types
// =====================================================

export interface SeminarTag {
  area?: Record<string, unknown>;
  topic?: Record<string, unknown>;
}

export interface SeminarData {
  title: string;
  date: string;
  season?: string | null;
  Presenter?: { ID: string; name: string } | null;
  tag?: SeminarTag | null;
  slide?: string | null;
  slideExists?: boolean;
}

// =====================================================
// News Types
// =====================================================

export interface NewsData {
  date: string;
  type: 'Member' | 'Publication' | 'Funding' | 'General';
  content: string;
}

// =====================================================
// Patent Types
// =====================================================

// Raw patent data interface (as it comes from YAML)
export interface PatentYAML {
  title: {
    ko: string;
    en: string;
  };
  scope: string;
  status: {
    filed: { date: string | null; number: string | null };
    registered: { date: string | null; number: string | null };
  };
  authors: {
    ID?: string;
    name: string;
  }[];
  link?: string | null;
}

export interface PatentAuthorData {
  ID?: string;
  name: string;
}

export interface PatentData {
  title: {
    ko: string;
    en: string;
  };
  scope: string;
  status: {
    filed: { date: string | null; number: string | null };
    registered: { date: string | null; number: string | null };
  };
  authors: PatentAuthorData[];
  link?: string | null;
}

// =====================================================
// Project Types
// =====================================================

/** YAML에서 image는 url과 선택적 width(px) */
export interface ProjectImage {
  url: string;
  width?: number;
}

export interface ProjectParent {
  funder: string;
  program: string | null;
}

export interface ProjectMain {
  funder: string | null;
  program: string | null;
}

export interface ProjectYAML {
  title: string;
  type: string;
  role: string;
  parent: ProjectParent;
  main: ProjectMain;
  start_date: string;
  end_date: string;
  /** 기관 로고: url 필수, width(px) 선택 */
  image?: { url: string; width?: number } | string | null;
}

export interface ProjectData {
  title: string;
  type: string;
  role: string;
  parent: ProjectParent;
  main: ProjectMain;
  start_date: string;
  end_date: string;
  image: ProjectImage | null;
}

 