export interface ProfileData {
    type: string;
    title: string;
    name_en: string;
    name_ko: string;
    admission: string;
    bs: string;
    ms: string;
    phd: string;
    period: string;
    interest: string;
    photo: string[];
    email: string[];
    homepage: string;
    github: string[];
    linkedin: string;
}

export interface ProfileItemProps extends ProfileData {
    onClick?: () => void;
    isSelected?: boolean;
}

export interface ProfileDetailProps extends ProfileData {
    // ProfileDetail에 특별한 추가 props가 있다면 여기에 정의
} 