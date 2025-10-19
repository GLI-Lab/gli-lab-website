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
}

export interface ProfileItemProps extends ProfileData {
  onClick?: () => void;
  isSelected?: boolean;
  isAlumniPage?: boolean;
}

export interface ProfileDetailProps extends ProfileData {
  studies?: StudyData[];
  papers?: PaperData[];
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
// News Types
// =====================================================

export interface NewsData {
  date: string;
  content: string;
}

 