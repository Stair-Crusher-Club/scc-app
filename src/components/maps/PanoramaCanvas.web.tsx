import React, {useEffect, useRef} from 'react';
import {StyleProp, View, ViewStyle} from 'react-native';

declare global {
  interface Window {
    naver: any;
  }
}

// 카메라(도로 지점)에서 장소까지의 방위각(정북 기준, -180~180). pano.setPov의 pan 값.
function bearing(
  fromLat: number,
  fromLng: number,
  toLat: number,
  toLng: number,
): number {
  const rad = Math.PI / 180;
  const dLng = (toLng - fromLng) * rad;
  const y = Math.sin(dLng) * Math.cos(toLat * rad);
  const x =
    Math.cos(fromLat * rad) * Math.sin(toLat * rad) -
    Math.sin(fromLat * rad) * Math.cos(toLat * rad) * Math.cos(dLng);
  return Math.atan2(y, x) / rad;
}

function escapeHtml(s: string): string {
  return s.replace(
    /[&<>"']/g,
    c =>
      ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;',
      })[c] as string,
  );
}

// 장소명 라벨 + 핀. translate(-50%,-100%)로 핀 끝이 정확히 좌표에 오게 한다(anchor 0,0).
function markerHtml(name: string): string {
  return (
    '<div style="transform:translate(-50%,-100%);display:inline-flex;flex-direction:column;align-items:center;">' +
    '<div style="background:#fff;border:2px solid #2D74F4;border-radius:10px;padding:6px 14px;font-size:18px;font-weight:700;color:#111;white-space:nowrap;box-shadow:0 2px 8px rgba(0,0,0,0.35);">' +
    escapeHtml(name) +
    '</div>' +
    '<div style="width:0;height:0;border-left:7px solid transparent;border-right:7px solid transparent;border-top:10px solid #2D74F4;"></div>' +
    '</div>'
  );
}

export interface PanoramaCanvasProps {
  position: {lat: number; lng: number};
  // 핀에 표시할 장소명.
  label?: string;
  // 핀(마커) 표시 여부. 입구를 가릴 때 끌 수 있다. 기본 true.
  showPin?: boolean;
  // 미리보기처럼 조작이 필요 없을 땐 false. 컨트롤을 숨기고 위 레이어가 탭을 가로채게 둔다.
  interactive?: boolean;
  style?: StyleProp<ViewStyle>;
}

/**
 * 로드뷰(네이버 파노라마)의 웹 구현. web/index.html에서 `submodules=...,panorama`로 로드된
 * `window.naver.maps.Panorama`를 사용한다. SDK가 async 로드라 MapView.web.tsx와 동일하게
 * 100ms 폴링으로 준비를 기다린다.
 */
export default function PanoramaCanvas({
  position,
  label = '',
  showPin = true,
  interactive = true,
  style,
}: PanoramaCanvasProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const panoramaRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  // init 이벤트 시점의 최신 showPin을 읽기 위한 ref (메인 effect는 showPin에 재실행되지 않음).
  const showPinRef = useRef(showPin);
  showPinRef.current = showPin;

  useEffect(() => {
    let cancelled = false;
    const tryInit = () => {
      if (cancelled) {
        return;
      }
      if (
        !containerRef.current ||
        !window.naver?.maps?.Panorama ||
        panoramaRef.current
      ) {
        if (!window.naver?.maps?.Panorama) {
          setTimeout(tryInit, 100);
        }
        return;
      }
      const placeLatLng = new window.naver.maps.LatLng(
        position.lat,
        position.lng,
      );
      const pano = new window.naver.maps.Panorama(containerRef.current, {
        position: placeLatLng,
        aroundControl: interactive,
        zoomControl: interactive,
      });
      panoramaRef.current = pano;
      window.naver.maps.Event.addListener(pano, 'init', () => {
        // 1. 장소 위치에 장소명 라벨 핀 (가리기 상태면 표시하지 않음)
        const marker = new window.naver.maps.Marker({
          position: placeLatLng,
          icon: {
            content: markerHtml(label),
            anchor: new window.naver.maps.Point(0, 0),
          },
        });
        marker.setMap(showPinRef.current ? pano : null);
        markerRef.current = marker;
        // 2. 도로 지점에서 장소를 바라보도록 시점 회전 + 적당한 줌
        //    (fov 작을수록 확대 → 네이버가 더 고해상도 타일을 줘서 선명해진다)
        const cam = pano.getPosition();
        pano.setPov({
          pan: bearing(cam.lat(), cam.lng(), position.lat, position.lng),
          tilt: 0,
          fov: 50,
        });
      });
    };
    tryInit();
    return () => {
      cancelled = true;
      markerRef.current = null;
      if (panoramaRef.current) {
        panoramaRef.current.destroy?.();
        panoramaRef.current = null;
      }
    };
    // 위치/조작 모드/장소명이 바뀌면 파노라마를 재생성한다.
  }, [position.lat, position.lng, interactive, label]);

  // 핀 토글: 파노라마 재생성 없이 마커만 켜고 끈다.
  useEffect(() => {
    if (markerRef.current && panoramaRef.current) {
      markerRef.current.setMap(showPin ? panoramaRef.current : null);
    }
  }, [showPin]);

  return (
    <View style={[{overflow: 'hidden'}, style]}>
      {/* react-native-web에서 View는 div로 렌더되지만, 네이버 SDK가 직접 제어할
          순수 div 컨테이너가 필요해 ref를 단 div를 명시적으로 둔다. */}
      <div
        ref={containerRef}
        style={{
          width: '100%',
          height: '100%',
          pointerEvents: interactive ? 'auto' : 'none',
        }}
      />
    </View>
  );
}
