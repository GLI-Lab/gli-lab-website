'use client';

import Script from 'next/script';

declare global {
  interface Window {
    kakao: any;
  }
}

export default function KakaoMap() {
  const initializeMap = () => {
    const container = document.getElementById('map');

    // 카카오맵 초기화 함수 실행
    window.kakao.maps.load(() => {
      const options = {
        center: new window.kakao.maps.LatLng(37.540899, 127.079556),
        level: 3
      };

      const map = new window.kakao.maps.Map(container, options);

      // 교수실 마커와 오버레이
      const professorPosition = new window.kakao.maps.LatLng(37.541162, 127.079852);
      const professorMarker = new window.kakao.maps.Marker({
        position: professorPosition,
        map: map
      });
      
      const professorContent = 
        '<div style="padding:3px 8px; background:#fff; border:1px solid #2F5E8C; border-radius:3px; box-shadow:0 1px 2px rgba(0,0,0,0.2);">' +
        '  <div style="font-size:12px; font-weight:bold; color:#333; text-align:center;">교수실</div>' +
        '</div>';
      
      const professorOverlay = new window.kakao.maps.CustomOverlay({
        position: professorPosition,
        content: professorContent,
        yAnchor: 2.0,
        zIndex: 1
      });
      
      // 연구실 마커와 오버레이
      const labPosition = new window.kakao.maps.LatLng(37.540605, 127.079538);
      const labMarker = new window.kakao.maps.Marker({
        position: labPosition,
        map: map
      });
      
      const labContent = 
        '<div style="padding:3px 8px; background:#fff; border:1px solid #2F5E8C; border-radius:3px; box-shadow:0 1px 2px rgba(0,0,0,0.2);">' +
        '  <div style="font-size:12px; font-weight:bold; color:#333; text-align:center;">연구실</div>' +
        '</div>';
      
      const labOverlay = new window.kakao.maps.CustomOverlay({
        position: labPosition,
        content: labContent,
        yAnchor: 2.0,
        zIndex: 1
      });
      
      // 오버레이 표시
      professorOverlay.setMap(map);
      labOverlay.setMap(map);
      
      // 마커 클릭 이벤트
      let professorVisible = true;
      window.kakao.maps.event.addListener(professorMarker, 'click', function() {
        if (professorVisible) {
          professorOverlay.setMap(null);
        } else {
          professorOverlay.setMap(map);
        }
        professorVisible = !professorVisible;
      });
      
      let labVisible = true;
      window.kakao.maps.event.addListener(labMarker, 'click', function() {
        if (labVisible) {
          labOverlay.setMap(null);
        } else {
          labOverlay.setMap(map);
        }
        labVisible = !labVisible;
      });
    });
  };

  return (
    <>
      <Script
        strategy="afterInteractive"
        src={`https://dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.NEXT_PUBLIC_KAKAO_MAP_KEY}`}
        onLoad={initializeMap}
      />
    </>
  );
} 