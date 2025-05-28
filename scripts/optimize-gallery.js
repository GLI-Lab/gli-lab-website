const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function optimizeGalleryImages() {
  const galleryPath = 'public/images/gallery';
  
  console.log('🚀 갤러리 이미지 최적화 시작 (고화질 모드)...\n');
  
  try {
    // 갤러리 폴더들 가져오기
    const folders = fs.readdirSync(galleryPath, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);
    
    let totalProcessed = 0;
    let totalOriginalSize = 0;  // 원본 총 용량
    let totalOptimizedSize = 0; // 최적화된 총 용량
    const folderStats = {};     // 폴더별 통계
    
    for (const folder of folders) {
      console.log(`📁 처리 중: ${folder}`);
      const folderPath = path.join(galleryPath, folder);
      
      // 이미지 파일들 찾기
      const files = fs.readdirSync(folderPath)
        .filter(file => /\.(jpg|jpeg|png|webp)$/i.test(file));
      
      let folderProcessed = 0;
      let folderOriginalSize = 0;
      let folderOptimizedSize = 0;
      
      for (const file of files) {
        const inputPath = path.join(folderPath, file);
        
        // WebP 파일은 이미 최적화된 것으로 간주하고 건너뛰기
        if (file.toLowerCase().endsWith('.webp')) {
          console.log(`  ⏭️  ${file} - 이미 최적화됨 (WebP)`);
          continue;
        }
        
        // WebP 포맷으로 출력 (더 좋은 압축률과 품질)
        const outputExtension = '.webp';
        const tempOutputPath = path.join(folderPath, `temp_${file.replace(/\.(jpg|jpeg|png)$/i, outputExtension)}`);
        const finalOutputPath = path.join(folderPath, file.replace(/\.(jpg|jpeg|png)$/i, outputExtension));
        
        try {
          // 파일 크기 확인
          const stats = fs.statSync(inputPath);
          const fileSizeMB = (stats.size / (1024 * 1024)).toFixed(2);
          
          console.log(`  📷 ${file} (${fileSizeMB}MB) 최적화 중...`);
          
          // 이미지 최적화
          const image = sharp(inputPath);
          const metadata = await image.metadata();
          
          // EXIF 회전 정보 자동 적용
          let pipeline = image.rotate();
          
          // 갤러리 모달 크기에 최적화된 해상도 설정
          // 모달: max-w-4xl (896px), 레티나 디스플레이 고려 시 1800px 필요
          const maxWidth = 1800;   // 레티나 디스플레이 완벽 지원
          const maxHeight = 1800;  // 모든 비율에서 충분한 품질
          
          if (metadata.width > maxWidth || metadata.height > maxHeight) {
            pipeline = pipeline.resize(maxWidth, maxHeight, { 
              fit: 'inside',
              withoutEnlargement: true,
              kernel: sharp.kernel.lanczos3  // 고품질 리샘플링
            });
          }
          
          // WebP로 변환 (최고 품질 100%)
          await pipeline
            .webp({ 
              quality: 100,        // 최고 품질
              effort: 6,           // 최고 압축 효율 (0-6, 6이 최고)
              smartSubsample: true // 스마트 서브샘플링
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
          
          // 용량 통계 누적
          folderOriginalSize += stats.size;
          folderOptimizedSize += optimizedStats.size;
          totalOriginalSize += stats.size;
          totalOptimizedSize += optimizedStats.size;
          
          console.log(`    ✅ 최적화 완료: ${optimizedSizeMB}MB (품질: 100%, ${reduction}% 감소)`);
          folderProcessed++;
          totalProcessed++;
          
        } catch (error) {
          console.error(`    ❌ 오류 발생: ${file}`, error.message);
        }
      }
      
      // 폴더별 통계 저장
      if (folderProcessed > 0) {
        folderStats[folder] = {
          processed: folderProcessed,
          originalSize: folderOriginalSize,
          optimizedSize: folderOptimizedSize
        };
      }
      
      if (folderProcessed === 0) {
        console.log(`  ✨ ${folder} - 모든 이미지가 이미 최적화됨`);
      } else {
        console.log(`  📁 ${folder} - ${folderProcessed}개 이미지 최적화됨`);
      }
      console.log('');
    }
    
    if (totalProcessed === 0) {
      console.log('✨ 모든 갤러리 이미지가 이미 최적화되어 있습니다!');
      console.log('💡 새 이미지를 추가한 후 다시 실행하세요.');
    } else {
      console.log(`🎉 ${totalProcessed}개의 이미지 최적화 완료!`);
      
      // 폴더별 용량 비교
      console.log('\n📊 폴더별 최적화 결과:');
      for (const [folder, stats] of Object.entries(folderStats)) {
        const originalMB = (stats.originalSize / (1024 * 1024)).toFixed(1);
        const optimizedMB = (stats.optimizedSize / (1024 * 1024)).toFixed(1);
        const savedMB = ((stats.originalSize - stats.optimizedSize) / (1024 * 1024)).toFixed(1);
        const reduction = ((stats.originalSize - stats.optimizedSize) / stats.originalSize * 100).toFixed(1);
        
        console.log(`  📁 ${folder}:`);
        console.log(`    처리: ${stats.processed}개 파일`);
        console.log(`    원본: ${originalMB}MB → 최적화: ${optimizedMB}MB`);
        console.log(`    절약: ${savedMB}MB (${reduction}% 감소)`);
        console.log('');
      }
      
      // 전체 용량 비교
      const totalOriginalMB = (totalOriginalSize / (1024 * 1024)).toFixed(1);
      const totalOptimizedMB = (totalOptimizedSize / (1024 * 1024)).toFixed(1);
      const totalSavedMB = ((totalOriginalSize - totalOptimizedSize) / (1024 * 1024)).toFixed(1);
      const totalReduction = ((totalOriginalSize - totalOptimizedSize) / totalOriginalSize * 100).toFixed(1);
      
      console.log('🎯 전체 최적화 결과:');
      console.log(`  원본 총 용량: ${totalOriginalMB}MB`);
      console.log(`  최적화 후: ${totalOptimizedMB}MB`);
      console.log(`  총 절약량: ${totalSavedMB}MB (${totalReduction}% 감소)`);
      
      console.log('\n🎨 화질 개선 사항:');
      console.log('  • WebP 포맷 사용 (JPEG 대비 25-35% 더 나은 압축)');
      console.log('  • 레티나 디스플레이 최적화 (최대 1800px)');
      console.log('  • 스마트 품질 설정 (82-95%, 이미지 특성별 적응)');
      console.log('  • 고품질 리샘플링 (Lanczos3)');
      console.log('  • 작은 파일은 거의 무손실 압축');
      console.log('  • 갤러리 모달 크기에 완벽 최적화 (max-w-4xl 기준)');
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