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
  status: string;
  link: string | null;
  authors: { [role: string]: string }[];
  year?: string;
  venue?: string;
}

export interface AuthorData {
  role: string;           // "1저자", "공동저자", "교신저자" etc.
  profileId: string | null;
  displayName: string;
}

export interface PaperData {
  title: string
  status: string
  link: string | null
  authors: AuthorData[]
  year?: string
  venue?: string
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

 