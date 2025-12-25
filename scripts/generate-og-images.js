const fs = require('fs').promises;
const path = require('path');
const yaml = require('js-yaml');
const sharp = require('sharp');

// 프로필 파일을 찾는 함수
async function findProfileFile(suffix) {
  const dataDir = path.join(process.cwd(), 'src', 'data', 'profiles');
  
  try {
    const files = await fs.readdir(dataDir);
    
    // 지정된 suffix로 끝나는 파일들 찾기
    const matchingFiles = files.filter(file => file.endsWith(suffix));
    
    if (matchingFiles.length === 0) {
      throw new Error(`Profile file with suffix '${suffix}' not found`);
    }
    
    // [년도-학기] 형식의 파일명에서 최신 것 찾기
    const profileFile = findLatestFile(matchingFiles);
    
    return path.join(dataDir, profileFile);
  } catch (error) {
    console.error(`Error finding profile file: ${error.message}`);
    throw error;
  }
}

// [년도-학기] 형식의 파일명에서 최신 파일을 찾는 함수
function findLatestFile(files) {
  const fileWithYearSemester = files.map(file => {
    // [년도-학기] 패턴 매칭
    const match = file.match(/^\[(\d{4})-(\d+)\]/);
    if (match) {
      const year = parseInt(match[1]);
      const semester = parseInt(match[2]);
      return { file, year, semester };
    }
    // 패턴이 없는 경우 기본값으로 처리 (가장 나중에 선택되도록)
    return { file, year: 0, semester: 0 };
  });
  
  // 년도 내림차순, 학기 내림차순으로 정렬
  fileWithYearSemester.sort((a, b) => {
    if (a.year !== b.year) {
      return b.year - a.year;
    }
    return b.semester - a.semester;
  });
  
  return fileWithYearSemester[0].file;
}
// 파일명에서 프로필 ID 추출 (예: "[2024.03] 오병국1.webp" -> "[2024.03] 오병국")
function extractProfileIdFromFilename(filename) {
  // 파일 확장자 제거
  const nameWithoutExt = filename.replace(/\.(webp|jpg|jpeg|png)$/i, '');
  // 끝의 숫자 제거 (예: "1", "2", "3" 등)
  const profileId = nameWithoutExt.replace(/\d+$/, '');
  return profileId;
}

// 프로필 ID로 YAML에서 프로필 정보 찾기
async function findProfileById(profileId, isAlumni = false) {
  try {
    const filePath = await findProfileFile(isAlumni ? 'profiles-alumni.yaml' : 'profiles.yaml');
    const yamlText = await fs.readFile(filePath, 'utf8');
    const rawData = yaml.load(yamlText);
    return rawData.find(profile => profile.id === profileId) || null;
  } catch (error) {
    console.error(`Error loading ${isAlumni ? 'alumni' : 'profiles'} YAML:`, error);
    return null;
  }
}

// public/images/profiles에서 *1.webp 파일들을 찾아서 프로필 정보와 매칭
// 일반 프로필과 alumni 프로필 모두 처리 (alumni 폴더 분리 없음)
async function getProfilesFromFiles() {
  try {
    const profilesDir = path.join(process.cwd(), 'public', 'images', 'profiles');
    const files = await fs.readdir(profilesDir);
    
    // 디렉토리 제외하고 파일만 필터링
    const fileList = [];
    for (const file of files) {
      const filePath = path.join(profilesDir, file);
      const stats = await fs.stat(filePath);
      if (stats.isFile()) {
        fileList.push(file);
      }
    }
    
    // *1.webp 패턴의 파일들만 필터링
    const profile1Files = fileList.filter(file => {
      const nameWithoutExt = file.replace(/\.(webp|jpg|jpeg|png)$/i, '');
      return /1$/.test(nameWithoutExt);
    });
    
    const profiles = [];
    
    for (const filename of profile1Files) {
      const profileId = extractProfileIdFromFilename(filename);
      
      // 먼저 일반 profiles.yaml에서 찾고, 없으면 profiles-alumni.yaml에서 찾기
      let yamlProfile = await findProfileById(profileId, false);
      if (!yamlProfile) {
        yamlProfile = await findProfileById(profileId, true);
      }
      
      if (yamlProfile) {
        profiles.push({
          id: profileId,
          name_en: yamlProfile.name?.en || "",
          name_ko: yamlProfile.name?.ko || "",
          role_title: yamlProfile.role?.title || "",
          photo: [`/images/profiles/${filename}`],
        });
      } else {
        console.warn(`⚠️  Profile not found in YAML for file: ${filename} (ID: ${profileId})`);
      }
    }
    
    return profiles;
  } catch (error) {
    console.error('Error loading profiles from files:', error);
    return [];
  }
}

// 이미지를 base64로 인코딩하는 함수
async function imageToBase64(imagePath) {
  try {
    const imageBuffer = await fs.readFile(imagePath);
    const ext = path.extname(imagePath).toLowerCase();
    let mimeType = 'image/jpeg';
    
    if (ext === '.png') mimeType = 'image/png';
    else if (ext === '.gif') mimeType = 'image/gif';
    else if (ext === '.svg') mimeType = 'image/svg+xml';
    
    return `data:${mimeType};base64,${imageBuffer.toString('base64')}`;
  } catch (error) {
    console.warn(`Failed to encode image ${imagePath}:`, error.message);
    return null;
  }
}

// WebP 기반 OpenGraph 이미지 생성
async function generateOGImageWebP({ photoUrl, nameEn, nameKo, roleTitle }) {
  const width = 1200;
  const height = 630;
  
  try {
    
    // 배경 생성 (흰색)
    let composite = [{
      input: Buffer.from(`<svg width="${width}" height="${height}">
        <rect width="${width}" height="${height}" fill="white"/>
      </svg>`),
      top: 0,
      left: 0
    }];
    
    // 프로필 이미지가 있으면 추가
    if (photoUrl && photoUrl.startsWith('/images/profiles/')) {
      // /images/profiles/... 경로를 public/images/profiles/... 로 변환
      const localImagePath = path.join(process.cwd(), 'public', photoUrl);
      
      try {
        await fs.access(localImagePath);
        
        // 이미지를 520x630으로 리사이즈하고 추가
        const resizedImage = await sharp(localImagePath)
          .resize(520, 630, { fit: 'cover' })
          .toBuffer();
          
        composite.push({
          input: resizedImage,
          top: 0,
          left: 0
        });
      } catch (error) {
        console.warn(`Profile image not found: ${localImagePath}`);
      }
    }
    
    // 텍스트 오버레이 생성
    const nameEnY = 215;
    const nameKoY = 300;
    const roleTitleY = 405;
    const labY = 485;
    
    let textSvg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <text x="560" y="${nameEnY}" font-family="Arial, sans-serif" font-size="66" font-weight="700" fill="#0f172a" text-anchor="start">
        ${nameEn || 'GLI Lab Member'}
      </text>`;
    
    if (nameKo) {
      textSvg += `
      <text x="560" y="${nameKoY}" font-family="Arial, sans-serif" font-size="54" font-weight="400" fill="#334155" text-anchor="start">
        ${nameKo}
      </text>`;
    }
    
    if (roleTitle) {
      // 괄호와 그 안의 학기 정보 제거 (예: "M.S. Student (2학기)" -> "M.S. Student")
      const cleanRoleTitle = roleTitle.replace(/\s*\([^)]*\)\s*/g, '').trim();
      textSvg += `
      <text x="560" y="${roleTitleY}" font-family="Arial, sans-serif" font-size="38" font-weight="400" fill="#475569" text-anchor="start">
        ${cleanRoleTitle}
      </text>`;
    }
    
    textSvg += `
      <text x="560" y="${labY}" font-family="Arial, sans-serif" font-size="38" font-weight="400" fill="#475569" text-anchor="start">
        Graph &amp; Language Intelligence Lab
      </text>
    </svg>`;
    
    composite.push({
      input: Buffer.from(textSvg),
      top: 0,
      left: 0
    });
    
    // 최종 WebP 이미지 생성
    const webpBuffer = await sharp({
      create: {
        width,
        height,
        channels: 3,
        background: { r: 255, g: 255, b: 255 }
      }
    })
    .composite(composite)
    .webp({ quality: 95, effort: 6 })
    .toBuffer();
    
    return webpBuffer;
    
  } catch (error) {
    console.error('WebP 생성 중 오류:', error);
    throw error;
  }
}


// 정적 이미지 파일 생성
async function generateStaticImages(forceRegenerate = false) {
  console.log('🎨 Generating OpenGraph images...');
  if (forceRegenerate) {
    console.log('🔄 Force regenerate mode: overwriting existing files');
  }
  
  try {
    // 출력 디렉토리 생성 (alumni 서브폴더 없이)
    const outputDir = path.join(process.cwd(), 'public', 'images', 'profiles-og');
    await fs.mkdir(outputDir, { recursive: true });
    
    // 모든 프로필 이미지 생성 (일반 프로필과 alumni 모두 포함)
    const profiles = await getProfilesFromFiles();
    console.log(`📝 Checking ${profiles.length} profile images...`);
    
    let generatedCount = 0;
    let skippedCount = 0;
    
    for (const profile of profiles) {
      if (profile.id) {
        const filename = `${profile.id}.webp`;
        const filepath = path.join(outputDir, filename);
        
        // 파일이 이미 존재하는지 확인 (강제 재생성 모드가 아닌 경우)
        if (!forceRegenerate) {
          try {
            await fs.access(filepath);
            console.log(`  ⏭️  Skipped (exists): ${filename}`);
            skippedCount++;
            continue;
          } catch {
            // 파일이 없으면 생성
          }
        }
        
        const photoPath = profile.photo?.[0]; // 로컬 경로 사용
        const webpBuffer = await generateOGImageWebP({
          photoUrl: photoPath,
          nameEn: profile.name_en,
          nameKo: profile.name_ko,
          roleTitle: profile.role_title
        });
        
        await fs.writeFile(filepath, webpBuffer);
        console.log(`  ✅ Generated: ${filename}`);
        generatedCount++;
      }
    }
    
    // fallback 이미지는 기존 로고 이미지 사용 (/images/logo/GLI_opengraph_2000x1050.jpg)
    
    console.log('🎉 OpenGraph image generation completed!');
    console.log(`📈 Summary: ${generatedCount} generated, ${skippedCount} skipped`);
    
  } catch (error) {
    console.error('❌ Error generating images:', error);
    process.exit(1);
  }
}

// 메인 실행
if (require.main === module) {
  const args = process.argv.slice(2);
  const forceRegenerate = args.includes('--force') || args.includes('-f');
  
  if (forceRegenerate) {
    console.log('🔄 Running in force regenerate mode...');
  }
  
  generateStaticImages(forceRegenerate);
}

module.exports = {
  generateStaticImages,
  getProfilesFromFiles
};
