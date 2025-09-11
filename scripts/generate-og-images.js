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
// YAML 프로필을 변환하는 함수
function transformProfile(yamlProfile, isAlumni = false) {
  const photoUrls = (yamlProfile.photos || []).map(photo => {
    return isAlumni ? `/images/profiles/alumni/${photo}.webp` : `/images/profiles/${photo}.webp`;
  });

  return {
    id: yamlProfile.id || "",
    name_en: yamlProfile.name.en || "",
    name_ko: yamlProfile.name.ko || "",
    photo: photoUrls.length > 0 ? photoUrls : ["/images/profiles/ku_basic_1_down.png"],
  };
}

// 프로필 데이터를 가져오는 함수
async function getProfiles() {
  try {
    const filePath = await findProfileFile('profiles.yaml');
    const yamlText = await fs.readFile(filePath, 'utf8');
    const rawData = yaml.load(yamlText);
    return rawData.map(profile => transformProfile(profile, false));
  } catch (error) {
    console.error('Error loading profiles:', error);
    return [];
  }
}

// Alumni 프로필 데이터를 가져오는 함수
async function getAlumniProfiles() {
  try {
    const filePath = await findProfileFile('profiles-alumni.yaml');
    const yamlText = await fs.readFile(filePath, 'utf8');
    const rawData = yaml.load(yamlText);
    return rawData.map(profile => transformProfile(profile, true));
  } catch (error) {
    console.error('Error loading alumni profiles:', error);
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
async function generateOGImageWebP({ photoUrl, nameEn, nameKo }) {
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
      const localImagePath = path.join(process.cwd(), 'public', photoUrl.replace('.jpg', '.webp').replace('.jpeg', '.webp').replace('.png', '.webp'));
      
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
    const textY = nameKo ? 280 : 315;
    const koreanY = 365;
    const labY = nameKo ? 455 : 400;
    
    let textSvg = `<svg width="${width}" height="${height}">
      <text x="560" y="${textY}" font-family="Arial, sans-serif" font-size="66" font-weight="700" fill="#0f172a" text-anchor="start">
        ${nameEn || 'GLI Lab Member'}
      </text>`;
    
    if (nameKo) {
      textSvg += `
      <text x="560" y="${koreanY}" font-family="Arial, sans-serif" font-size="54" fill="#334155" text-anchor="start">
        ${nameKo}
      </text>`;
    }
    
    textSvg += `
      <text x="560" y="${labY}" font-family="Arial, sans-serif" font-size="38" fill="#475569" text-anchor="start">
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

// SVG 기반 OpenGraph 이미지 생성 (백업용)
async function generateOGImageSVG({ photoUrl, nameEn, nameKo }) {
  let imageData = '';
  
  // 로컬 이미지 파일을 base64로 인코딩
  if (photoUrl && photoUrl.startsWith('/images/profiles/')) {
    const localImagePath = path.join(process.cwd(), 'public', photoUrl);
    const base64Data = await imageToBase64(localImagePath);
    if (base64Data) {
      imageData = `<image href="${base64Data}" x="0" y="0" width="520" height="630" preserveAspectRatio="xMidYMid meet"/>`;
    }
  }
  
  return `<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
  <!-- Background -->
  <rect x="0" y="0" width="1200" height="630" fill="white"/>
  
  <!-- Photo Section -->
  <rect x="0" y="0" width="520" height="630" fill="white"/>
  ${imageData}
  
  <!-- Text Section -->
  <g transform="translate(556, 0)">
    <!-- Main Name -->
    <text x="36" y="${nameKo ? '280' : '315'}" font-family="Arial, sans-serif" font-size="66" font-weight="700" fill="#0f172a" text-anchor="start">
      ${nameEn || 'GLI Lab Member'}
    </text>
    
    ${nameKo ? `
    <!-- Korean Name -->
    <text x="36" y="365" font-family="Arial, sans-serif" font-size="54" fill="#334155" text-anchor="start">
      ${nameKo}
    </text>
    ` : ''}
    
    <!-- Lab Name -->
    <text x="36" y="${nameKo ? '455' : '400'}" font-family="Arial, sans-serif" font-size="38" fill="#475569" text-anchor="start">
      Graph &amp; Language Intelligence Lab
    </text>
  </g>
</svg>`;
}

// 정적 이미지 파일 생성
async function generateStaticImages(forceRegenerate = false) {
  console.log('🎨 Generating OpenGraph images...');
  if (forceRegenerate) {
    console.log('🔄 Force regenerate mode: overwriting existing files');
  }
  
  try {
    // 출력 디렉토리 생성
    const outputDir = path.join(process.cwd(), 'public', 'images', 'profiles-og');
    await fs.mkdir(outputDir, { recursive: true });
    
    const membersDir = outputDir; // members는 profiles-og 루트에
    const alumniDir = path.join(outputDir, 'alumni');
    await fs.mkdir(alumniDir, { recursive: true });
    
    // Members 이미지 생성
    const profiles = await getProfiles();
    console.log(`📝 Checking ${profiles.length} member images...`);
    
    let generatedCount = 0;
    let skippedCount = 0;
    
    for (const profile of profiles) {
      if (profile.id) {
        const filename = `${profile.id}.webp`;
        const filepath = path.join(membersDir, filename);
        
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
          nameKo: profile.name_ko
        });
        
        await fs.writeFile(filepath, webpBuffer);
        console.log(`  ✅ Generated: ${filename}`);
        generatedCount++;
      }
    }
    
    console.log(`📊 Members: ${generatedCount} generated, ${skippedCount} skipped`);
    
    // Alumni 이미지 생성
    const alumniProfiles = await getAlumniProfiles();
    console.log(`📝 Checking ${alumniProfiles.length} alumni images...`);
    
    let alumniGeneratedCount = 0;
    let alumniSkippedCount = 0;
    
    for (const profile of alumniProfiles) {
      if (profile.id) {
        const filename = `${profile.id}.webp`;
        const filepath = path.join(alumniDir, filename);
        
        // 파일이 이미 존재하는지 확인 (강제 재생성 모드가 아닌 경우)
        if (!forceRegenerate) {
          try {
            await fs.access(filepath);
            console.log(`  ⏭️  Skipped (exists): ${filename}`);
            alumniSkippedCount++;
            continue;
          } catch {
            // 파일이 없으면 생성
          }
        }
        
        const photoPath = profile.photo?.[0]; // 로컬 경로 사용
        const webpBuffer = await generateOGImageWebP({
          photoUrl: photoPath,
          nameEn: profile.name_en,
          nameKo: profile.name_ko
        });
        
        await fs.writeFile(filepath, webpBuffer);
        console.log(`  ✅ Generated: ${filename}`);
        alumniGeneratedCount++;
      }
    }
    
    console.log(`📊 Alumni: ${alumniGeneratedCount} generated, ${alumniSkippedCount} skipped`);
    
    // fallback 이미지는 기존 로고 이미지 사용 (/images/logo/GLI_opengraph_2000x1050.jpg)
    
    const totalGenerated = generatedCount + alumniGeneratedCount;
    const totalSkipped = skippedCount + alumniSkippedCount;
    
    console.log('🎉 OpenGraph image generation completed!');
    console.log(`📈 Summary: ${totalGenerated} generated, ${totalSkipped} skipped`);
    
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
  getProfiles,
  getAlumniProfiles
};
