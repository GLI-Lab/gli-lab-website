#!/usr/bin/env node
'use strict';

/**
 * public/ 아래 바이너리(PDF, 프로필 이미지)의 파일명만 인덱스로 저장한다.
 * 프로필 사진은 내용 해시(SHA-256 앞 8자)도 같이 기록한다 (`scripts/lib/fileHash.js`).
 * 로더는 이 해시를 URL 쿼리로 붙여, 같은 파일명으로 갈아끼운 사진이 1년 캐시를 피하게 한다.
 * OG 스크립트도 같은 함수로 `*1` 사진을 해시한 뒤 지문이 바뀌면 OG를 다시 만든다.
 * Next.js 서버리스 함수가 public/pdf 등을 readdir 하면 Vercel 트레이싱에
 * PDF 원본이 포함되어 250MB 제한을 넘긴다. 로더는 이 JSON만 읽는다.
 */

const fs = require('fs');
const path = require('path');
const { hashFile } = require('./lib/fileHash');

const ROOT = path.join(__dirname, '..');
const DIRS = ['pdf/seminar', 'pdf/cv', 'images/profiles'];
const PROFILE_IMAGE_DIR = 'images/profiles';

function listFiles(absDir) {
  try {
    return fs
      .readdirSync(absDir, { withFileTypes: true })
      .filter((entry) => entry.isFile() && !entry.name.startsWith('.'))
      .map((entry) => entry.name);
  } catch {
    return [];
  }
}

const index = {};
for (const dir of DIRS) {
  index[dir] = listFiles(path.join(ROOT, 'public', dir));
}

const profileHashes = {};
for (const filename of index[PROFILE_IMAGE_DIR]) {
  profileHashes[filename] = hashFile(path.join(ROOT, 'public', PROFILE_IMAGE_DIR, filename));
}
index.hashes = { [PROFILE_IMAGE_DIR]: profileHashes };

const outDir = path.join(ROOT, 'src', 'data', 'generated');
fs.mkdirSync(outDir, { recursive: true });
const outPath = path.join(outDir, 'public-file-index.json');
fs.writeFileSync(outPath, `${JSON.stringify(index, null, 2)}\n`);
console.log(`Wrote ${path.relative(ROOT, outPath)}`);
for (const dir of DIRS) {
  console.log(`  ${dir}: ${index[dir].length} files`);
}
console.log(`  ${PROFILE_IMAGE_DIR} hashes: ${Object.keys(profileHashes).length}`);
