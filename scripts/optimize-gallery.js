const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function optimizeGalleryImages() {
  const galleryPath = 'public/images/gallery';
  
  console.log('🚀 갤러리 이미지 최적화 시작...\n');
  
  try {
    // 갤러리 폴더들 가져오기
    const folders = fs.readdirSync(galleryPath, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);
    
    let totalProcessed = 0;
    
    for (const folder of folders) {
      console.log(`📁 확인 중: ${folder}`);
      const folderPath = path.join(galleryPath, folder);
      const backupPath = path.join(folderPath, 'original-backup');
      
      // 백업 폴더가 없으면 생성
      if (!fs.existsSync(backupPath)) {
        fs.mkdirSync(backupPath, { recursive: true });
      }
      
      // 이미지 파일들 찾기 (백업 폴더 제외)
      const files = fs.readdirSync(folderPath)
        .filter(file => /\.(jpg|jpeg|png|webp)$/i.test(file));
      
      let folderProcessed = 0;
      
      for (const file of files) {
        const inputPath = path.join(folderPath, file);
        const backupFilePath = path.join(backupPath, file);
        
        // 이미 백업이 있으면 건너뛰기 (이미 최적화됨)
        if (fs.existsSync(backupFilePath)) {
          console.log(`  ⏭️  ${file} - 이미 최적화됨 (건너뛰기)`);
          continue;
        }
        
        const tempOutputPath = path.join(folderPath, `temp_${file.replace(/\.(png|webp)$/i, '.jpg')}`);
        const finalOutputPath = path.join(folderPath, file.replace(/\.(png|webp)$/i, '.jpg'));
        
        try {
          // 파일 크기 확인
          const stats = fs.statSync(inputPath);
          const fileSizeMB = (stats.size / (1024 * 1024)).toFixed(2);
          
          console.log(`  📷 ${file} (${fileSizeMB}MB) 새로 최적화 중...`);
          
          // 원본을 백업 폴더로 복사
          fs.copyFileSync(inputPath, backupFilePath);
          console.log(`    💾 백업 완료: original-backup/${file}`);
          
          // 이미지 최적화
          const image = sharp(inputPath);
          const metadata = await image.metadata();
          
          // EXIF 회전 정보 자동 적용
          let pipeline = image.rotate();
          
          // 큰 이미지는 리사이즈, 작은 이미지는 그대로
          if (metadata.width > 1920 || metadata.height > 1080) {
            pipeline = pipeline.resize(1920, 1080, { 
              fit: 'inside',
              withoutEnlargement: true 
            });
          }
          
          // JPEG로 변환 및 품질 최적화 (임시 파일로)
          await pipeline
            .jpeg({ 
              quality: 80,
              progressive: true,
              mozjpeg: true
            })
            .toFile(tempOutputPath);
          
          // 원본 파일 삭제
          if (fs.existsSync(inputPath)) {
            fs.unlinkSync(inputPath);
          }
          
          // 임시 파일을 최종 파일명으로 변경
          fs.renameSync(tempOutputPath, finalOutputPath);
          
          // 최적화된 파일 크기 확인
          const optimizedStats = fs.statSync(finalOutputPath);
          const optimizedSizeMB = (optimizedStats.size / (1024 * 1024)).toFixed(2);
          const reduction = ((stats.size - optimizedStats.size) / stats.size * 100).toFixed(1);
          
          console.log(`    ✅ 최적화 완료: ${optimizedSizeMB}MB (${reduction}% 감소)`);
          folderProcessed++;
          totalProcessed++;
          
        } catch (error) {
          console.error(`    ❌ 오류 발생: ${file}`, error.message);
        }
      }
      
      if (folderProcessed === 0) {
        console.log(`  ✨ ${folder} - 모든 이미지가 이미 최적화됨`);
      } else {
        console.log(`  📁 ${folder} - ${folderProcessed}개 이미지 새로 최적화됨`);
      }
      console.log('');
    }
    
    if (totalProcessed === 0) {
      console.log('✨ 모든 갤러리 이미지가 이미 최적화되어 있습니다!');
      console.log('💡 새 이미지를 추가한 후 다시 실행하세요.');
    } else {
      console.log(`🎉 ${totalProcessed}개의 새 이미지 최적화 완료!`);
      
      // 최종 용량 확인
      console.log('\n📊 최적화 결과:');
      for (const folder of folders) {
        const folderPath = path.join(galleryPath, folder);
        const backupPath = path.join(folderPath, 'original-backup');
        
        if (fs.existsSync(backupPath)) {
          const originalSize = getFolderSize(backupPath);
          const optimizedSize = getFolderSize(folderPath) - originalSize; // 백업 폴더 제외
          
          console.log(`  ${folder}:`);
          console.log(`    원본: ${(originalSize / (1024 * 1024)).toFixed(1)}MB`);
          console.log(`    최적화: ${(optimizedSize / (1024 * 1024)).toFixed(1)}MB`);
          console.log(`    절약: ${((originalSize - optimizedSize) / (1024 * 1024)).toFixed(1)}MB`);
        }
      }
    }
    
  } catch (error) {
    console.error('❌ 최적화 중 오류 발생:', error);
  }
}

// 폴더 크기 계산 함수
function getFolderSize(folderPath) {
  let totalSize = 0;
  
  if (!fs.existsSync(folderPath)) return 0;
  
  const files = fs.readdirSync(folderPath);
  for (const file of files) {
    const filePath = path.join(folderPath, file);
    const stats = fs.statSync(filePath);
    if (stats.isFile()) {
      totalSize += stats.size;
    }
  }
  
  return totalSize;
}

// 스크립트 실행
optimizeGalleryImages(); 