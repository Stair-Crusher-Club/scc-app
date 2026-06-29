import React, {useEffect, useRef} from 'react';
import {StyleProp, ViewStyle} from 'react-native';
import {WebView} from 'react-native-webview';

export interface PanoramaCanvasProps {
  position: {lat: number; lng: number};
  // 핀에 표시할 장소명.
  label?: string;
  // 핀(마커) 표시 여부. 입구를 가릴 때 끌 수 있다. 기본 true.
  showPin?: boolean;
  // 미리보기처럼 조작이 필요 없을 땐 false. 컨트롤/제스처를 끈다.
  interactive?: boolean;
  style?: StyleProp<ViewStyle>;
}

// 네이버 JS SDK는 키에 등록된 웹 서비스 URL을 referer로 인증한다. WebView 인라인
// HTML은 origin이 없으므로 등록된 도메인을 baseUrl로 지정해 인증을 통과시킨다.
const REGISTERED_WEB_ORIGIN = 'https://web.staircrusher.club';
const NAVER_MAP_KEY_ID = 'y43vn4vgkw';

function buildHtml(
  {lat, lng}: {lat: number; lng: number},
  interactive: boolean,
  label: string,
  showPin: boolean,
) {
  return `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <style>
    html, body { margin: 0; padding: 0; width: 100%; height: 100%; overflow: hidden; background: #eee; }
    #pano { width: 100%; height: 100%; }
  </style>
  <script>
    window.navermap_authFailure = function () {
      document.body.innerHTML =
        '<div style="display:flex;align-items:center;justify-content:center;height:100%;color:#888;font:14px sans-serif;">네이버 지도 인증 실패 (도메인/키 확인)</div>';
    };
  </script>
  <script src="https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${NAVER_MAP_KEY_ID}&submodules=panorama"></script>
</head>
<body>
  <div id="pano"></div>
  <script>
    var pano, marker;
    var placeName = ${JSON.stringify(label)};
    // RN에서 injectJavaScript로 핀을 토글한다. init 전에 호출돼도 의도를 보존한다.
    window.__pinVisible = ${showPin ? 'true' : 'false'};
    window.__setPin = function (v) {
      window.__pinVisible = v;
      if (marker) { marker.setMap(v ? pano : null); }
    };
    function esc(s) {
      return String(s).replace(/[&<>"']/g, function (c) {
        return {'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c];
      });
    }
    // 장소명 라벨 + 핀. translate(-50%,-100%)로 핀 끝이 정확히 좌표에 오게 한다(anchor 0,0).
    function markerHtml(name) {
      return '<div style="transform:translate(-50%,-100%);display:inline-flex;flex-direction:column;align-items:center;">' +
        '<div style="background:#fff;border:2px solid #2D74F4;border-radius:10px;padding:6px 14px;font-size:18px;font-weight:700;color:#111;white-space:nowrap;box-shadow:0 2px 8px rgba(0,0,0,0.35);">' + esc(name) + '</div>' +
        '<div style="width:0;height:0;border-left:7px solid transparent;border-right:7px solid transparent;border-top:10px solid #2D74F4;"></div>' +
        '</div>';
    }
    // 카메라(도로 지점)에서 장소까지의 방위각(정북 기준, -180~180).
    function bearing(fromLat, fromLng, toLat, toLng) {
      var rad = Math.PI / 180;
      var dLng = (toLng - fromLng) * rad;
      var y = Math.sin(dLng) * Math.cos(toLat * rad);
      var x = Math.cos(fromLat * rad) * Math.sin(toLat * rad) -
        Math.sin(fromLat * rad) * Math.cos(toLat * rad) * Math.cos(dLng);
      return Math.atan2(y, x) / rad;
    }
    function init() {
      if (!window.naver || !window.naver.maps || !window.naver.maps.Panorama) {
        setTimeout(init, 100);
        return;
      }
      var placeLatLng = new naver.maps.LatLng(${lat}, ${lng});
      pano = new naver.maps.Panorama('pano', {
        position: placeLatLng,
        aroundControl: ${interactive},
        zoomControl: ${interactive}
      });
      naver.maps.Event.addListener(pano, 'init', function () {
        // 1. 장소 위치에 장소명 라벨 핀 (가리기 상태면 표시하지 않음)
        marker = new naver.maps.Marker({
          position: placeLatLng,
          icon: {content: markerHtml(placeName), anchor: new naver.maps.Point(0, 0)}
        });
        marker.setMap(window.__pinVisible ? pano : null);
        // 2. 도로 지점에서 장소를 바라보도록 시점 회전 + 적당한 줌
        //    (fov 작을수록 확대 → 네이버가 더 고해상도 타일을 줘서 선명해진다)
        var cam = pano.getPosition();
        pano.setPov({pan: bearing(cam.lat(), cam.lng(), ${lat}, ${lng}), tilt: 0, fov: 50});
      });
      // WebView가 0 크기로 마운트됐다가 나중에 실제 크기를 받으면 파노라마를 다시 맞춘다.
      window.addEventListener('resize', function () {
        if (pano && pano.setSize) { pano.setSize(new naver.maps.Size(window.innerWidth, window.innerHeight)); }
      });
    }
    init();
  </script>
</body>
</html>`;
}

/**
 * 로드뷰(네이버 파노라마)의 네이티브 구현. react-native-webview로 네이버 JS SDK
 * 파노라마를 렌더한다(별도 네이티브 모듈 없이 웹과 동일 로직). 웹 구현은
 * PanoramaCanvas.web.tsx 참고.
 */
export default function PanoramaCanvas({
  position,
  label = '',
  showPin = true,
  interactive = true,
  style,
}: PanoramaCanvasProps) {
  const webViewRef = useRef<WebView>(null);
  // showPin을 source(HTML)에 박으면 토글할 때마다 HTML이 바뀌어 WebView가 통째로
  // 리로드되고 시점/zoom이 초기화된다. 초기값만 한 번 굽고 이후엔 injectJavaScript로만
  // 마커를 토글한다.
  const initialShowPinRef = useRef(showPin);

  // 핀 토글: WebView를 리로드하지 않고 JS만 주입해 마커만 켜고 끈다.
  useEffect(() => {
    webViewRef.current?.injectJavaScript(
      `window.__setPin && window.__setPin(${showPin ? 'true' : 'false'}); true;`,
    );
  }, [showPin]);

  return (
    <WebView
      ref={webViewRef}
      style={style}
      originWhitelist={['*']}
      source={{
        html: buildHtml(
          position,
          interactive,
          label,
          initialShowPinRef.current,
        ),
        baseUrl: REGISTERED_WEB_ORIGIN,
      }}
      scrollEnabled={false}
      scalesPageToFit={false}
      // Android WebView 레이어:
      // - 풀스크린(interactive=Modal 내부): Modal 안에서 hardware 레이어가 아니면
      //   빈 화면으로 렌더되는 알려진 버그가 있어 hardware 강제.
      // - 미리보기(non-interactive=ScrollView 내부): 반대로 hardware 레이어면
      //   ScrollView 안에서 paint가 안 돼 회색으로 비는 이슈가 있어 software 사용.
      androidLayerType={interactive ? 'hardware' : 'software'}
      // 미리보기에서는 제스처를 막아 상위 Pressable이 탭을 받게 한다.
      pointerEvents={interactive ? 'auto' : 'none'}
    />
  );
}
