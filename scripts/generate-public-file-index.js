#!/usr/bin/env node
'use strict';

/**
 * public/ 아래 바이너리(PDF, 프로필 이미지)의 파일명만 인덱스로 저장한다.
 * Next.js 서버리스 함수가 public/pdf 등을 readdir 하면 Vercel 트레이싱에
 * PDF 원본이 포함되어 250MB 제한을 넘긴다. 로더는 이 JSON만 읽는다.
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const DIRS = ['pdf/seminar', 'pdf/cv', 'images/profiles'];

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

const outDir = path.join(ROOT, 'src', 'data', 'generated');
fs.mkdirSync(outDir, { recursive: true });
const outPath = path.join(outDir, 'public-file-index.json');
fs.writeFileSync(outPath, `${JSON.stringify(index, null, 2)}\n`);
console.log(`Wrote ${path.relative(ROOT, outPath)}`);
for (const dir of DIRS) {
  console.log(`  ${dir}: ${index[dir].length} files`);
}
