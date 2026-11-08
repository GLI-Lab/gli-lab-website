const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

/** 웹에서 눈으로 무손실에 가까운 구간. 페이지는 next/image가 다시 q=75로 보낸다. */
const WEBP_QUALITY = 82;
const WEBP_OPTIONS = { quality: WEBP_QUALITY, effort: 6, smartSubsample: true };

/** 긴 변 한도. 가로나 세로 중 큰 쪽이 이 값을 넘으면 비율 유지한 채 상자 안에 넣는다. */
const GALLERY_MAX_SIDE = 2048; // 모달 max-w-5xl(1024px) × 레티나 2배. 레이아웃이 커져도 한 단계는 커버
const PROFILE_MAX_SIDE = 1600; // 상세 sizes 640px보다 여유. 나중에 큰 모달을 켜도 버팀

const RASTER_RE = /\.(jpg|jpeg|png|webp)$/i;
const SOURCE_RE = /\.(jpg|jpeg|png)$/i;

async function optimizeImages() {
  console.log('🎯 이미지 최적화 시작!\n');

  await optimizeGalleryImages();
  console.log('─'.repeat(50) + '\n');
  await optimizeProfileImages();

  console.log('🎉 모든 이미지 최적화 완료!\n');
}

function listRasterFiles(dirPath) {
  if (!fs.existsSync(dirPath)) return [];
  return fs.readdirSync(dirPath, { withFileTypes: true })
    .filter((entry) => entry.isFile() && RASTER_RE.test(entry.name))
    .map((entry) => entry.name);
}

/**
 * JPG/PNG는 WebP로 바꾸고 원본을 지운다. 긴 변이 maxSide를 넘는 WebP는 그 자리에서 줄인다.
 * 이미 WebP이고 치수도 이하면 건너뛴다.
 */
async function optimizeOne(inputPath, { maxSide }) {
  const ext = path.extname(inputPath).toLowerCase();
  const isWebp = ext === '.webp';
  const outputPath = isWebp ? inputPath : inputPath.replace(SOURCE_RE, '.webp');

  const image = sharp(inputPath);
  const metadata = await image.metadata();
  const longSide = Math.max(metadata.width || 0, metadata.height || 0);
  const needsResize = longSide > maxSide;
  const needsConvert = !isWebp;

  if (!needsResize && !needsConvert) {
    return { skipped: true };
  }

  const origSize = fs.statSync(inputPath).size;
  let pipeline = image.rotate();
  if (needsResize) {
    pipeline = pipeline.resize(maxSide, maxSide, {
      fit: 'inside',
      withoutEnlargement: true,
      kernel: sharp.kernel.lanczos3,
    });
  }

  const tempPath = `${outputPath}.tmp`;
  await pipeline.webp(WEBP_OPTIONS).toFile(tempPath);
  if (!isWebp && fs.existsSync(inputPath) && inputPath !== outputPath) {
    fs.unlinkSync(inputPath);
  }
  fs.renameSync(tempPath, outputPath);

  return {
    skipped: false,
    origSize,
    newSize: fs.statSync(outputPath).size,
    needsResize,
    needsConvert,
    outputPath,
  };
}

function logResult(result) {
  const newMB = (result.newSize / (1024 * 1024)).toFixed(2);
  const reduction = ((result.origSize - result.newSize) / result.origSize * 100).toFixed(1);
  const why = [
    result.needsConvert ? 'WebP 변환' : null,
    result.needsResize ? '리사이즈' : null,
  ].filter(Boolean).join(', ');
  console.log(`    ✅ ${why}: ${newMB}MB (q${WEBP_QUALITY}, ${reduction}% 감소)`);
}

async function optimizeGalleryImages() {
  const galleryPath = 'public/images/gallery';
  console.log(`🚀 갤러리 이미지 최적화 (긴 변 ${GALLERY_MAX_SIDE}px, WebP q${WEBP_QUALITY})\n`);

  try {
    const folders = fs.readdirSync(galleryPath, { withFileTypes: true })
      .filter((dirent) => dirent.isDirectory())
      .map((dirent) => dirent.name);

    let totalProcessed = 0;
    let totalOriginalSize = 0;
    let totalOptimizedSize = 0;

    for (const folder of folders) {
      console.log(`📁 처리 중: ${folder}`);
      const folderPath = path.join(galleryPath, folder);
      const files = listRasterFiles(folderPath);
      let folderProcessed = 0;

      for (const file of files) {
        const inputPath = path.join(folderPath, file);
        const origMB = (fs.statSync(inputPath).size / (1024 * 1024)).toFixed(2);
        try {
          const result = await optimizeOne(inputPath, { maxSide: GALLERY_MAX_SIDE });
          if (result.skipped) {
            console.log(`  ⏭️  ${file} - 이미 WebP이고 ${GALLERY_MAX_SIDE}px 이하`);
            continue;
          }
          console.log(`  📷 ${file} (${origMB}MB)`);
          logResult(result);
          totalOriginalSize += result.origSize;
          totalOptimizedSize += result.newSize;
          folderProcessed++;
          totalProcessed++;
        } catch (error) {
          console.error(`    ❌ 오류 발생: ${file}`, error.message);
        }
      }

      if (folderProcessed === 0) {
        console.log(`  ✨ ${folder} - 처리할 이미지 없음`);
      } else {
        console.log(`  📁 ${folder} - ${folderProcessed}개 처리됨`);
      }
      console.log('');
    }

    if (totalProcessed === 0) {
      console.log('✨ 모든 갤러리 이미지가 이미 최적화되어 있습니다!\n');
    } else {
      const originalMB = (totalOriginalSize / (1024 * 1024)).toFixed(1);
      const optimizedMB = (totalOptimizedSize / (1024 * 1024)).toFixed(1);
      const savedMB = ((totalOriginalSize - totalOptimizedSize) / (1024 * 1024)).toFixed(1);
      const reduction = ((totalOriginalSize - totalOptimizedSize) / totalOriginalSize * 100).toFixed(1);
      console.log(`🎉 갤러리 ${totalProcessed}개 처리: ${originalMB}MB → ${optimizedMB}MB (−${savedMB}MB, ${reduction}%)\n`);
    }
  } catch (error) {
    console.error('❌ 갤러리 최적화 중 오류 발생:', error);
  }
}

async function optimizeProfileImages() {
  console.log(`🚀 프로필 이미지 최적화 (긴 변 ${PROFILE_MAX_SIDE}px, WebP q${WEBP_QUALITY})\n`);

  const profileFolders = [
    { path: 'public/images/profiles', name: 'Members' },
    { path: 'public/images/profiles/alumni', name: 'Alumni' },
    { path: 'public/images/etc', name: 'Etc' },
  ];

  let totalProcessed = 0;
  let totalOriginalSize = 0;
  let totalOptimizedSize = 0;

  for (const folder of profileFolders) {
    const { path: profilesPath, name: folderName } = folder;

    try {
      if (!fs.existsSync(profilesPath)) {
        console.log(`⏭️  ${folderName} 폴더가 없습니다: ${profilesPath}`);
        continue;
      }

      console.log(`📁 처리 중: ${folderName} (${profilesPath})`);
      const files = listRasterFiles(profilesPath);
      let folderProcessed = 0;

      if (files.length === 0) {
        console.log(`  ✨ ${folderName} - 이미지 없음\n`);
        continue;
      }

      for (const file of files) {
        const inputPath = path.join(profilesPath, file);
        const origMB = (fs.statSync(inputPath).size / (1024 * 1024)).toFixed(2);
        try {
          const result = await optimizeOne(inputPath, { maxSide: PROFILE_MAX_SIDE });
          if (result.skipped) {
            console.log(`  ⏭️  ${file} - 이미 WebP이고 ${PROFILE_MAX_SIDE}px 이하`);
            continue;
          }
          console.log(`  📷 ${file} (${origMB}MB)`);
          logResult(result);
          totalOriginalSize += result.origSize;
          totalOptimizedSize += result.newSize;
          folderProcessed++;
          totalProcessed++;
        } catch (error) {
          console.error(`    ❌ 오류 발생: ${file}`, error.message);
        }
      }

      if (folderProcessed > 0) {
        console.log(`  📁 ${folderName} - ${folderProcessed}개 처리됨\n`);
      } else {
        console.log(`  ✨ ${folderName} - 처리할 이미지 없음\n`);
      }
    } catch (error) {
      console.error(`❌ ${folderName} 최적화 중 오류 발생:`, error);
    }
  }

  if (totalProcessed > 0) {
    const originalMB = (totalOriginalSize / (1024 * 1024)).toFixed(1);
    const optimizedMB = (totalOptimizedSize / (1024 * 1024)).toFixed(1);
    const savedMB = ((totalOriginalSize - totalOptimizedSize) / (1024 * 1024)).toFixed(1);
    const reduction = ((totalOriginalSize - totalOptimizedSize) / totalOriginalSize * 100).toFixed(1);
    console.log(`🎉 프로필 ${totalProcessed}개 처리: ${originalMB}MB → ${optimizedMB}MB (−${savedMB}MB, ${reduction}%)\n`);
  } else {
    console.log('✨ 모든 프로필 이미지가 이미 최적화되어 있습니다!\n');
  }
}

optimizeImages();
