'use strict';

const crypto = require('crypto');
const fs = require('fs');

/** SHA-256 앞 8자. 프로필 사진 인덱스(`?v=`)와 OG 재생성 판별이 같이 쓴다. */
function hashFile(absPath) {
  const data = fs.readFileSync(absPath);
  return crypto.createHash('sha256').update(data).digest('hex').slice(0, 8);
}

module.exports = { hashFile };
