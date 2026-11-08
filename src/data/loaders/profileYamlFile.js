'use strict';

const fs = require('fs').promises;
const path = require('path');

/** `src/data/profiles/` — `[YYYY-S] profiles.yaml` / `profiles-alumni.yaml` 스냅샷 */
const PROFILE_YAML_DIR = path.join(process.cwd(), 'src', 'data', 'profiles');

/**
 * `[YYYY-S]` 접두어가 있는 파일명 목록에서 가장 최신 학기 파일명을 고른다.
 * 접두어가 없으면 year=0, semester=0으로 두어 맨 뒤에 둔다.
 *
 * @param {string[]} files 예: ["[2025-1] profiles.yaml", "[2026-2] profiles.yaml"]
 * @returns {string} 예: "[2026-2] profiles.yaml"
 */
function findLatestProfileFilename(files) {
  if (!files.length) {
    throw new Error('No profile YAML filenames to choose from');
  }

  const ranked = files.map((file) => {
    const match = file.match(/^\[(\d{4})-(\d+)\]/);
    if (match) {
      return { file, year: parseInt(match[1], 10), semester: parseInt(match[2], 10) };
    }
    return { file, year: 0, semester: 0 };
  });

  ranked.sort((a, b) => {
    if (a.year !== b.year) return b.year - a.year;
    return b.semester - a.semester;
  });

  return ranked[0].file;
}

/**
 * `src/data/profiles/`에서 suffix로 끝나는 파일 중 최신 학기의 절대 경로.
 * 사이트 로더(`profileLoader.ts`)와 OG 스크립트(`scripts/generate-og-images.js`)가 같이 쓴다.
 *
 * @param {string} suffix 예: "profiles.yaml" | "profiles-alumni.yaml"
 * @returns {Promise<string>} 예: ".../src/data/profiles/[2026-2] profiles.yaml"
 */
async function findLatestProfileYamlPath(suffix) {
  const files = await fs.readdir(PROFILE_YAML_DIR);
  const matching = files.filter((file) => file.endsWith(suffix));
  if (matching.length === 0) {
    throw new Error(`No profile file found with suffix: ${suffix}`);
  }
  return path.join(PROFILE_YAML_DIR, findLatestProfileFilename(matching));
}

module.exports = {
  PROFILE_YAML_DIR,
  findLatestProfileFilename,
  findLatestProfileYamlPath,
};
