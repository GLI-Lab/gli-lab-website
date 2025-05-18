'use client';

import { useEffect, useRef } from 'react';
import Script from 'next/script';

declare global {
  interface Window {
    kakao: any;
  }
}

export default function KakaoMap() {
  const mapRef = useRef<HTMLDivElement>(null);
  const isMapInitialized = useRef(false);

  // 교수실과 연구실 위치 데이터
  const locations = [
    { name: '교수실', lat: 37.541162, lng: 127.079852 },
    { name: '연구실', lat: 37.540605, lng: 127.079538 }
  ];

  // 지도 초기화 함수
  const initializeMap = () => {
    if (!mapRef.current || !window.kakao || isMapInitialized.current) return;

    window.kakao.maps.load(() => {
      if (!mapRef.current) return;
      
      const centerLat = (locations[0].lat + locations[1].lat) / 2;
      const centerLng = (locations[0].lng + locations[1].lng) / 2;
      
      // 지도 생성
      const map = new window.kakao.maps.Map(mapRef.current, {
        center: new window.kakao.maps.LatLng(centerLat, centerLng),
        level: 3
      });

      // 각 위치에 마커와 오버레이 생성
      locations.forEach(({ name, lat, lng }) => {
        const position = new window.kakao.maps.LatLng(lat, lng);
        
        // 마커 생성
        const marker = new window.kakao.maps.Marker({
          position,
          map
        });
        
        // 오버레이 생성
        const overlay = new window.kakao.maps.CustomOverlay({
          position,
          content: `
            <div style="padding:3px 8px; background:#fff; border:1px solid #2F5E8C; border-radius:3px; box-shadow:0 1px 2px rgba(0,0,0,0.2);">
              <div style="font-size:12px; font-weight:bold; color:#333; text-align:center;">${name}</div>
            </div>`,
          yAnchor: 2.0
        });
        
        // 오버레이 표시
        overlay.setMap(map);
        
        // 마커 클릭 이벤트 - 오버레이 토글
        let isVisible = true;
        window.kakao.maps.event.addListener(marker, 'click', () => {
          overlay.setMap(isVisible ? null : map);
          isVisible = !isVisible;
        });
      });

      isMapInitialized.current = true;
    });
  };

  // 스크립트 로드 시와 컴포넌트 마운트 시 초기화
  useEffect(() => {
    if (window.kakao?.maps) {  // 카카오맵 API가 이미 로드되어 있는 경우
      initializeMap();
    }
    
    return () => {  // 사용자가 다른 페이지로 이동해서 이 컴포넌트가 화면에서 제거될 때 실행
      isMapInitialized.current = false;  // 사용자가 다시 이 페이지로 돌아왔을 때 지도가 재초기화될 수 있도록
    };
  }, []);

  return (
    <>
      <Script
        strategy="afterInteractive"
        src={`https://dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.NEXT_PUBLIC_KAKAO_MAP_KEY}&autoload=false`}
        onLoad={initializeMap}
      />
      <div id="map" ref={mapRef} className="w-full mt-8 h-[400px] md:h-[600px]"></div>
    </>
  );
} 