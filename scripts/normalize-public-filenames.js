#!/usr/bin/env node
'use strict';

/**
 * public/ 파일명을 NFC(완성형)로 맞춘다.
 * macOS는 한글 파일명을 NFD(조합형)로 저장한다. 리눅스에서는 같은 글자도
 * 다른 파일명이 되어, 프로필 사진 정렬이 1, 2, 3 순서를 따르지 않는다.
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const DIRS = ['public/pdf/seminar', 'public/pdf/cv', 'public/images/profiles'];

function normalizeDir(absDir) {
  let renamed = 0;
  let entries;
  try {
    entries = fs.readdirSync(absDir, { withFileTypes: true });
  } catch (error) {
    console.warn(`skip ${path.relative(ROOT, absDir)}: ${error.message}`);
    return 0;
  }

  for (const entry of entries) {
    if (entry.name.startsWith('.')) continue;
    const abs = path.join(absDir, entry.name);

    if (entry.isDirectory()) {
      renamed += normalizeDir(abs);
      continue;
    }
    if (!entry.isFile()) continue;

    const nfc = entry.name.normalize('NFC');
    if (nfc === entry.name) continue;

    const dest = path.join(absDir, nfc);
    if (fs.existsSync(dest)) {
      const sameFile = fs.statSync(abs).ino === fs.statSync(dest).ino;
      if (!sameFile) {
        console.warn(`  skip (NFC name already exists): ${entry.name}`);
      }
      continue;
    }

    fs.renameSync(abs, dest);
    console.log(`  ${entry.name} -> ${nfc}`);
    renamed++;
  }

  return renamed;
}

let total = 0;
for (const dir of DIRS) {
  console.log(dir);
  total += normalizeDir(path.join(ROOT, dir));
}
console.log(`Renamed ${total} files to NFC`);
