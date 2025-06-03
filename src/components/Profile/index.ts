// Components
export { ProfileCardList } from './ProfileCardList';
export { ProfileItem } from './ProfileItem';
export { ProfileDetail } from './ProfileDetail';

// Data functions and types
export { 
  type ProfileData,
  type ProfileItemProps,
  type ProfileDetailProps,
  type PaperData,
  type AuthorData,
  parseAuthorString,
  findUserRoleInPaper,
  getPapersForProfile,
} from './profiles';

// Server-side functions
export { 
  getProfiles,
  getPapers,
} from './profilesServer'; 