// Utility functions for data processing (client-safe)

import { AuthorData, PaperData } from './types';

// Parse author string to extract profile ID and display name
export function parseAuthorString(authorString: string): { profileId: string | null; displayName: string } {
  const profileMatch = authorString.match(/^<profile=(.+?)>(.+?)<\/>$/);
  if (profileMatch) {
    const [, profileId, displayName] = profileMatch;
    return { profileId, displayName };
  }
  return { profileId: null, displayName: authorString };
}

// Find user's role in a paper
export function findUserRoleInPaper(authors: AuthorData[], profileId: string): string | null {
  const author = authors.find(author => author.profileId === profileId);
  return author ? author.role : null;
}

// Get papers for a specific profile
export function getPapersForProfile(papers: PaperData[], profileId: string): PaperData[] {
  return papers.filter(paper => 
    paper.authors.some(author => author.profileId === profileId)
  );
} 