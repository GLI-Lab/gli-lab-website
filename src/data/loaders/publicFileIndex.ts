import publicFileIndex from '@/data/generated/public-file-index.json';

type PublicFileIndex = Record<string, string[]>;

/** prebuild가 만든 public/ 파일명 목록. PDF/이미지 원본은 포함하지 않는다. */
export function listPublicFiles(dirRelative: string): string[] {
  return (publicFileIndex as PublicFileIndex)[dirRelative] ?? [];
}
