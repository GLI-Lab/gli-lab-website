const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function fixRotatedImages() {
  const galleryPath = 'public/images/gallery';
  
  console.log('🔄 회전된 이미지 수정 시작...\n');
  
  try {
    // 갤러리 폴더들 가져오기
    const folders = fs.readdirSync(galleryPath, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);
    
    for (const folder of folders) {
      console.log(`📁 처리 중: ${folder}`);
      const folderPath = path.join(galleryPath, folder);
      const backupPath = path.join(folderPath, 'original-backup');
      
      if (!fs.existsSync(backupPath)) {
        console.log(`  ⚠️  백업 폴더 없음: ${folder}`);
        continue;
      }
      
      // 백업 폴더의 원본 파일들 찾기
      const backupFiles = fs.readdirSync(backupPath)
        .filter(file => /\.(jpg|jpeg|png|webp)$/i.test(file));
      
      for (const file of backupFiles) {
        const backupFilePath = path.join(backupPath, file);
        const outputFileName = file.replace(/\.(png|webp)$/i, '.jpg');
        const outputPath = path.join(folderPath, outputFileName);
        const tempOutputPath = path.join(folderPath, `temp_${outputFileName}`);
        
        try {
          // 백업 파일 크기 확인
          const stats = fs.statSync(backupFilePath);
          const fileSizeMB = (stats.size / (1024 * 1024)).toFixed(2);
          
          console.log(`  🔄 ${file} (${fileSizeMB}MB) 회전 수정 중...`);
          
          // 이미지 최적화 (EXIF 회전 정보 적용)
          const image = sharp(backupFilePath);
          const metadata = await image.metadata();
          
          // EXIF 회전 정보 자동 적용
          let pipeline = image.rotate();
          
          // 큰 이미지는 리사이즈
          if (metadata.width > 1920 || metadata.height > 1080) {
            pipeline = pipeline.resize(1920, 1080, { 
              fit: 'inside',
              withoutEnlargement: true 
            });
          }
          
          // JPEG로 변환 및 품질 최적화
          await pipeline
            .jpeg({ 
              quality: 80,
              progressive: true,
              mozjpeg: true
            })
            .toFile(tempOutputPath);
          
          // 기존 파일 삭제 후 새 파일로 교체
          if (fs.existsSync(outputPath)) {
            fs.unlinkSync(outputPath);
          }
          fs.renameSync(tempOutputPath, outputPath);
          
          // 최적화된 파일 크기 확인
          const optimizedStats = fs.statSync(outputPath);
          const optimizedSizeMB = (optimizedStats.size / (1024 * 1024)).toFixed(2);
          const reduction = ((stats.size - optimizedStats.size) / stats.size * 100).toFixed(1);
          
          console.log(`    ✅ 회전 수정 완료: ${optimizedSizeMB}MB (${reduction}% 감소)`);
          
        } catch (error) {
          console.error(`    ❌ 오류 발생: ${file}`, error.message);
        }
      }
      
      console.log(`📁 ${folder} 완료\n`);
    }
    
    console.log('🎉 모든 이미지 회전 수정 완료!');
    
  } catch (error) {
    console.error('❌ 회전 수정 중 오류 발생:', error);
  }
}

// 스크립트 실행
fixRotatedImages(); 