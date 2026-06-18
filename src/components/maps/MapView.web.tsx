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
          if (!onCameraIdle) return;
          const bounds = map.getBounds();
          const ne = bounds.getNE();
          const sw = bounds.getSW();
          const c = map.getCenter();
          const wasProgrammatic = programmaticMoveRef.current;
          programmaticMoveRef.current = false;
          const event: NativeCameraIdleEvent = {
            northEastLat: ne.lat(),
            northEastLng: ne.lng(),
            southWestLat: sw.lat(),
            southWestLng: sw.lng(),
            zoom: map.getZoom(),
            centerLat: c.lat(),
            centerLng: c.lng(),
            reason: wasProgrammatic ? 3 : 0,
          };
          onCameraIdle({nativeEvent: event} as any);
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
        const content = `<div style="position:relative;display:flex;flex-direction:column;align-items:center;justify-content:center;cursor:pointer;">
          <div style="width:32px;height:32px;display:flex;align-items:center;justify-content:center;">${svg}</div>
          ${
            item.captionText
              ? `<div style="background:rgba(255,255,255,0.9);padding:2px 6px;font-size:11px;font-weight:500;color:#333;white-space:nowrap;border-radius:8px;max-width:100px;overflow:hidden;text-overflow:ellipsis;">${item.captionText}</div>`
              : ''
          }
        </div>`;
        const marker = new window.naver.maps.Marker({
          position,
          map,
          zIndex: item.zIndex ?? 0,
          icon: {content, anchor: new window.naver.maps.Point(16, 34)},
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
