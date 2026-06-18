import React, {forwardRef, useEffect, useImperativeHandle, useRef} from 'react';
import {View, StyleSheet} from 'react-native';

import type {Region} from '@/components/maps/Types.tsx';
// Type-only import: the spec module calls codegenNativeComponent() at load time,
// which would break the web bundle. `import type` is erased at compile time.
import type {
  NativeProps,
  NativeCameraIdleEvent,
} from '@/../specs/SccMapViewNativeComponent';

type LatLng = {latitude: number; longitude: number};

// Mirror of the native MapView's imperative handle. Re-declared here (not imported
// from MapView.tsx) because on web `@/components/maps/MapView` resolves to THIS file.
export interface MapViewHandle {
  fitToElements: () => void;
  animateToRegion: (region: Region, padding: number, duration: number) => void;
  animateCamera: (center: LatLng, duration: number) => void;
  setPositionMode: (mode: 'normal' | 'direction' | 'compass') => void;
}

declare global {
  interface Window {
    naver: any;
  }
}

const LOGO_POSITION_MAP: Record<string, string | undefined> = {
  leftBottom: 'BOTTOM_LEFT',
  leftTop: 'TOP_LEFT',
  rightBottom: 'BOTTOM_RIGHT',
  rightTop: 'TOP_RIGHT',
  leftCenter: 'BOTTOM_LEFT',
  rightCenter: 'BOTTOM_RIGHT',
  bottomCenter: 'BOTTOM_CENTER',
  topCenter: 'TOP_CENTER',
};

function regionCenter(r: {
  northEastLat: number;
  northEastLng: number;
  southWestLat: number;
  southWestLng: number;
}) {
  return {
    lat: (r.northEastLat + r.southWestLat) / 2,
    lng: (r.northEastLng + r.southWestLng) / 2,
  };
}

/**
 * Web implementation of the native SccMapView wrapper (src/components/maps/MapView.tsx),
 * backed by the Naver Maps JS SDK (loaded in web/index.html). Implements the same
 * NativeProps + MapViewHandle contract so ItemMap/ItemMapView render unchanged on web.
 */
const MapViewComponent = forwardRef<MapViewHandle, NativeProps>(
  (
    {
      style,
      onMarkerPress,
      onCameraIdle,
      initialRegion,
      mapPadding,
      markers,
      logoPosition,
    },
    ref,
  ) => {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const mapInstanceRef = useRef<any>(null);
    const markerObjectsRef = useRef<any[]>([]);
    const currentLocationMarkerRef = useRef<any>(null);
    // Set before programmatic camera moves so the next `idle` reports reason=3
    // (developer) instead of 0 (gesture) — only gesture moves trigger analytics.
    const programmaticMoveRef = useRef(false);
    const [isMapLoaded, setIsMapLoaded] = React.useState(false);

    // The `idle` listener is registered once (init effect), so capture the
    // latest props via refs to avoid stale closures.
    const onCameraIdleRef = useRef(onCameraIdle);
    onCameraIdleRef.current = onCameraIdle;
    const mapPaddingRef = useRef(mapPadding);
    mapPaddingRef.current = mapPadding;

    // --- Map init (wait for async-loaded Naver SDK) ---
    useEffect(() => {
      let cancelled = false;
      const tryInit = () => {
        if (cancelled) return;
        if (
          !containerRef.current ||
          !window.naver?.maps ||
          mapInstanceRef.current
        ) {
          if (!window.naver?.maps) {
            setTimeout(tryInit, 100);
          }
          return;
        }
        const center = regionCenter(initialRegion);
        const map = new window.naver.maps.Map(containerRef.current, {
          center: new window.naver.maps.LatLng(center.lat, center.lng),
          zoom: 15,
          minZoom: 7,
          maxZoom: 21,
          mapTypeControl: false,
          zoomControl: false,
          logoControlOptions: logoPosition
            ? {
                position:
                  window.naver.maps.Position[
                    LOGO_POSITION_MAP[logoPosition] ?? 'BOTTOM_LEFT'
                  ],
              }
            : undefined,
        });
        mapInstanceRef.current = map;

        window.naver.maps.Event.addListener(map, 'idle', () => {
          const cb = onCameraIdleRef.current;
          if (!cb) return;
          const bounds = map.getBounds();
          const ne = bounds.getNE();
          const sw = bounds.getSW();
          const c = map.getCenter();

          let northEastLat = ne.lat();
          let northEastLng = ne.lng();
          let southWestLat = sw.lat();
          let southWestLng = sw.lng();

          // Inset the reported region by mapPadding so the search region excludes
          // the card overlay(bottom) + 재검색 버튼(top) 영역과 핀/캡션을 위한
          // 좌우 버퍼를 제외한 더 작은 사각형이 되도록 한다. (네이티브 SccMapView가
          // padding 을 반영한 region 을 주는 동작을 웹에서 재현)
          const pad = mapPaddingRef.current;
          const el = containerRef.current;
          if (pad && el && el.clientWidth > 0 && el.clientHeight > 0) {
            const latPerPx = (northEastLat - southWestLat) / el.clientHeight;
            const lngPerPx = (northEastLng - southWestLng) / el.clientWidth;
            const insetNorth = northEastLat - (pad.top ?? 0) * latPerPx;
            const insetSouth = southWestLat + (pad.bottom ?? 0) * latPerPx;
            const insetEast = northEastLng - (pad.right ?? 0) * lngPerPx;
            const insetWest = southWestLng + (pad.left ?? 0) * lngPerPx;
            // 패딩이 과도해 사각형이 뒤집히는 경우만 원본 유지.
            if (insetNorth > insetSouth && insetEast > insetWest) {
              northEastLat = insetNorth;
              southWestLat = insetSouth;
              northEastLng = insetEast;
              southWestLng = insetWest;
            }
          }

          const wasProgrammatic = programmaticMoveRef.current;
          programmaticMoveRef.current = false;
          const event: NativeCameraIdleEvent = {
            northEastLat,
            northEastLng,
            southWestLat,
            southWestLng,
            zoom: map.getZoom(),
            centerLat: c.lat(),
            centerLng: c.lng(),
            reason: wasProgrammatic ? 3 : 0,
          };
          cb({nativeEvent: event} as any);
        });

        setIsMapLoaded(true);
      };
      tryInit();
      return () => {
        cancelled = true;
      };
    }, []);

    // --- Markers (recreate on change) ---
    const markersKey = (markers ?? [])
      .map(
        m =>
          `${m.id}:${m.zIndex}:${m.iconColor}:${m.position.lat},${m.position.lng}:${m.iconResource?.length ?? 0}`,
      )
      .join('|');

    useEffect(() => {
      const map = mapInstanceRef.current;
      if (!map || !isMapLoaded || !window.naver?.maps) return;

      markerObjectsRef.current.forEach(m => m.setMap(null));
      markerObjectsRef.current = [];

      (markers ?? []).forEach(item => {
        const position = new window.naver.maps.LatLng(
          item.position.lat,
          item.position.lng,
        );
        let svg = item.iconResource ?? '';
        if (item.iconColor && svg) {
          svg = svg.replace(/fill="#9A9B9F"/g, `fill="${item.iconColor}"`);
        }
        // 마커 아이콘을 SVG 고유 크기로 렌더한다. 선택 시 svg 가 24×24 → 48×55 로
        // 커지므로, 고정 32×32 박스에 가두면(기존) 선택 핀이 줄어들어 앱보다 덜 커
        // 보였다. svg 의 width/height 를 읽어 박스 크기와 anchor(바닥 중앙=핀 끝)를 맞춘다.
        const wMatch = svg.match(/width="(\d+(?:\.\d+)?)"/);
        const hMatch = svg.match(/height="(\d+(?:\.\d+)?)"/);
        const svgW = wMatch ? parseFloat(wMatch[1]) : 32;
        const svgH = hMatch ? parseFloat(hMatch[1]) : 32;
        const content = `<div style="position:relative;display:flex;flex-direction:column;align-items:center;cursor:pointer;">
          <div style="width:${svgW}px;height:${svgH}px;display:flex;align-items:center;justify-content:center;flex-shrink:0;">${svg}</div>
          ${
            item.captionText
              ? `<div style="position:absolute;top:${svgH}px;left:50%;transform:translateX(-50%);margin-top:2px;background:rgba(255,255,255,0.9);padding:2px 6px;font-size:11px;font-weight:500;color:#333;white-space:nowrap;border-radius:8px;max-width:100px;overflow:hidden;text-overflow:ellipsis;">${item.captionText}</div>`
              : ''
          }
        </div>`;
        const marker = new window.naver.maps.Marker({
          position,
          map,
          zIndex: item.zIndex ?? 0,
          icon: {
            content,
            anchor: new window.naver.maps.Point(svgW / 2, svgH),
          },
        });
        window.naver.maps.Event.addListener(marker, 'click', () => {
          onMarkerPress?.({nativeEvent: {id: item.id}} as any);
        });
        markerObjectsRef.current.push(marker);
      });
    }, [markersKey, isMapLoaded]);

    // --- Imperative handle ---
    useImperativeHandle(
      ref,
      () => ({
        fitToElements: () => {
          const map = mapInstanceRef.current;
          if (!map || markerObjectsRef.current.length === 0) return;
          const bounds = new window.naver.maps.LatLngBounds();
          markerObjectsRef.current.forEach(m => bounds.extend(m.getPosition()));
          programmaticMoveRef.current = true;
          map.fitBounds(bounds, {padding: paddingObject(mapPadding, 60)});
        },
        animateToRegion: (region: Region, padding: number) => {
          const map = mapInstanceRef.current;
          if (!map) return;
          const bounds = new window.naver.maps.LatLngBounds(
            new window.naver.maps.LatLng(
              region.southWest.latitude,
              region.southWest.longitude,
            ),
            new window.naver.maps.LatLng(
              region.northEast.latitude,
              region.northEast.longitude,
            ),
          );
          programmaticMoveRef.current = true;
          map.fitBounds(bounds, {padding: paddingObject(mapPadding, padding)});
        },
        animateCamera: (center: LatLng, duration: number) => {
          const map = mapInstanceRef.current;
          if (!map) return;
          programmaticMoveRef.current = true;
          map.panTo(
            new window.naver.maps.LatLng(center.latitude, center.longitude),
            {duration, easing: 'easeOutCubic'},
          );
        },
        setPositionMode: (mode: 'normal' | 'direction' | 'compass') => {
          const map = mapInstanceRef.current;
          if (!map || mode === 'normal') return;
          // Web has no heading/follow mode — recenter on current location and
          // render an orange location dot (mirrors the native position indicator).
          if (!navigator.geolocation) return;
          navigator.geolocation.getCurrentPosition(
            pos => {
              if (!mapInstanceRef.current) return;
              const here = new window.naver.maps.LatLng(
                pos.coords.latitude,
                pos.coords.longitude,
              );
              if (currentLocationMarkerRef.current) {
                currentLocationMarkerRef.current.setPosition(here);
              } else {
                currentLocationMarkerRef.current = new window.naver.maps.Marker(
                  {
                    position: here,
                    map: mapInstanceRef.current,
                    zIndex: 1000,
                    icon: {
                      content: `<div style="width:16px;height:16px;background:#FF5722;border:3px solid white;border-radius:50%;box-shadow:0 2px 6px rgba(0,0,0,0.3);"></div>`,
                      anchor: new window.naver.maps.Point(8, 8),
                    },
                  },
                );
              }
              programmaticMoveRef.current = true;
              mapInstanceRef.current.panTo(here, {duration: 400});
            },
            () => {},
            {enableHighAccuracy: true},
          );
        },
      }),
      [mapPadding],
    );

    const flat = StyleSheet.flatten(style) ?? {};
    return (
      <View style={style}>
        <div
          ref={containerRef}
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            // Avoid a flash of empty space before the SDK paints.
            backgroundColor: (flat as any).backgroundColor ?? '#e9ecef',
          }}
        />
      </View>
    );
  },
);

function paddingObject(
  mapPadding: NativeProps['mapPadding'],
  fallback: number,
): {top: number; right: number; bottom: number; left: number} {
  if (mapPadding) {
    return {
      top: mapPadding.top,
      right: mapPadding.right,
      bottom: mapPadding.bottom,
      left: mapPadding.left,
    };
  }
  return {top: fallback, right: fallback, bottom: fallback, left: fallback};
}

export default MapViewComponent;
