import publicFileIndex from '@/data/generated/public-file-index.json';

type PublicFileIndex = {
  hashes?: Record<string, Record<string, string>>;
} & Record<string, string[] | Record<string, Record<string, string>> | undefined>;

const index = publicFileIndex as PublicFileIndex;

/** prebuild가 만든 public/ 파일명 목록. PDF/이미지 원본은 포함하지 않는다. */
export function listPublicFiles(dirRelative: string): string[] {
  const files = index[dirRelative];
  return Array.isArray(files) ? files : [];
}

/** 프로필 사진 내용 해시. 파일명이 같아도 바이트가 바뀌면 값이 달라진다. */
export function getPublicFileHash(dirRelative: string, filename: string): string | undefined {
  return index.hashes?.[dirRelative]?.[filename];
}
