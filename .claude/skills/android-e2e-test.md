# Android E2E Test

Android 에뮬레이터에서 E2E 테스트할 때 참조하는 skill.

## Metro 워크스페이스 확인

같은 RN 앱의 clone이 여러 개 있으면(scc-workspace, scc-workspace-2), Metro가 올바른 workspace에서 실행 중인지 반드시 확인한다.
잘못된 Metro가 서빙하면 코드 변경이 반영되지 않는다.

```bash
# Metro PID 확인
lsof -i :8081 | grep LISTEN

# 해당 PID의 실행 경로 확인
ps -p <PID> -o command=

# 잘못된 workspace면 kill 후 올바른 경로에서 재시작
kill <PID>
cd scc-app && npx react-native start --reset-cache
```

## Android 에뮬레이터 한국어 텍스트 입력

`adb shell input text`는 한국어를 지원하지 않는다. URL 인코딩도 안 됨.
`uiautomator2` Python 라이브러리를 사용한다.

```bash
# 설치 (최초 1회)
pip3 install --break-system-packages uiautomator2

# Python으로 한국어 입력
python3 -c "
import uiautomator2 as u2
d = u2.connect()
d(className='android.widget.EditText').set_text('한국어 텍스트')
"
```

## ADB 탭 타겟팅

탭이 안 먹히면 바깥 bounds(패딩 포함)를 탭하고 있을 가능성이 높다.
`uiautomator dump`로 정확한 clickable 요소를 찾는다.

```bash
# UI 트리 덤프
adb shell uiautomator dump /sdcard/ui.xml && adb pull /sdcard/ui.xml /tmp/ui.xml

# XML에서 타겟 요소의 bounds 확인 → 가장 안쪽 clickable 요소의 중심 좌표 사용
# bounds="[970,2183][1022,2235]" → 중심 = ((970+1022)/2, (2183+2235)/2) = (996, 2209)
adb shell input tap 996 2209
```

## adb 터치 좌표 계산

`adb shell screencap`으로 캡처한 이미지를 Read 도구로 보면 실제 해상도의 **절반 크기**로 표시된다.
`adb shell input tap x y`는 **실제 디바이스 해상도** 기준이므로, 이미지에서 보이는 좌표에 **2를 곱해야** 정확한 위치를 탭할 수 있다.

```bash
# 예: 이미지에서 버튼이 (270, 430) 위치 → adb tap (540, 860)
adb shell input tap 540 860
```

## E2E 검증 깊이 (MANDATORY)

**"화면이 떴는지"만 확인하면 불합격.** 각 화면에서 반드시:

1. **스크롤 상단+하단 모두 스크린샷** — 스크롤 없이 보이는 부분만 확인하면 하단의 중복 요소, 누락된 기능을 놓침
2. **Prefill 값과 DB 실제 값 대조** — "옵션이 선택되어 있는지"뿐 아니라 "올바른 옵션이 선택되어 있는지" 확인. DB에서 실제 저장된 값을 조회하여 화면에 표시된 prefill과 1:1 대조
3. **컴포넌트 구성 검증** — 해당 분기에서 렌더링되어야 할 컴포넌트가 모두 있는지, 불필요한 컴포넌트가 없는지 확인
4. **중복 요소 확인** — 같은 용도의 입력 필드가 여러 곳에 있지 않은지 (예: 섹션 내 "추가 설명" + 폼 하단 "부연 설명" 중복)
5. **인터랙션 검증** — 옵션 선택/해제, 사진 추가/교체/삭제, 텍스트 입력 등이 실제로 동작하는지

## uiautomator2 Python 자동화 테스트

좌표 추측 대신 `uiautomator2`의 셀렉터를 사용하면 안정적으로 UI 요소를 찾고 조작할 수 있다.
여러 분기를 테스트할 때 Python 스크립트로 자동화한다.

```python
import uiautomator2 as u2
import subprocess
import time

d = u2.connect()

def screenshot(name):
    subprocess.run(["adb", "shell", "screencap", "-p", "/sdcard/screen.png"], check=True)
    subprocess.run(["adb", "pull", "/sdcard/screen.png", f"/tmp/e2e_{name}.png"], check=True, capture_output=True)

def scroll_down():
    subprocess.run(["adb", "shell", "input", "swipe", "270", "1500", "270", "500", "300"], check=True)
    time.sleep(0.5)

# 텍스트로 요소 찾아 클릭 (좌표 추측 불필요)
d(text="틀린 정보가 있어요").click()

# content-desc로 클릭
d(description="다음").click()

# 존재 여부 확인
if d(text="올바른 정보를 알려주세요").exists(timeout=3):
    print("✅ 교정 폼 표시됨")

# click_exists: 있으면 클릭, 없으면 False 반환 (에러 없음)
d(description="닫기").click_exists(timeout=1)

# 주의: uiautomator dump은 복잡한 화면에서 OOM 발생 가능
# → 스크린샷 + Read 도구로 시각 검증이 더 안정적
```

### 분기별 자동화 테스트 패턴

```python
categories = ["입구 정보(계단, 경사로 등)", "층 정보", "문 유형", ...]

for cat in categories:
    # 1. 사이렌 → Step 1 → Step 2 → Step 3
    navigate_to_correction(cat)
    
    # 2. 상단 스크린샷
    screenshot(f"{cat}_top")
    
    # 3. 스크롤 후 하단 스크린샷
    scroll_down()
    screenshot(f"{cat}_bottom")
    
    # 4. 뒤로가기
    leave_correction()
```
