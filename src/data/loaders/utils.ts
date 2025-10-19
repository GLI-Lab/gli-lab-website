// Utility functions for data processing (client-safe)

import { AuthorData, PaperData } from './types';

// Find user's position in a paper
export function findUserPositionInPaper(authors: AuthorData[], profileId: string): string | null {
  const author = authors.find(author => author.ID === profileId);
  return author ? author.position : null;
}

// Check if user is corresponding author
export function isUserCorrespondingAuthor(authors: AuthorData[], profileId: string): boolean {
  const author = authors.find(author => author.ID === profileId);
  return author ? author.isCorresponding || false : false;
}

// Get papers for a specific profile
export function getPapersForProfile(papers: PaperData[], profileId: string): PaperData[] {
  return papers.filter(paper => 
    paper.authors.some(author => author.ID === profileId)
  );
}

// Format venue display name
export function formatVenueDisplay(venue: string | null | { name: string; acronym: string }): string {
  if (!venue) return '';
  if (typeof venue === 'string') return venue;
  return `${venue.name} (${venue.acronym})`;
}

// Find user's role in a paper
export function findUserRoleInPaper(authors: AuthorData[], profileId: string): string | null {
  const author = authors.find(author => author.ID === profileId);
  if (!author) return null;
  
  if (author.isCorresponding) {
    if (author.position === 'first') {
      return '1저자/교신저자';
    }
    return '교신저자';
  }
  
  switch (author.position) {
    case 'first':
      return '1저자';
    case 'co':
      return '공저자';
    default:
      return '공저자';
  }
} 