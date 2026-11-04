# APSSE Business Trip Itinerary

Megaline APSSE 조선소 출장(2026.12.08 ~ 12.10, 중국 안후이성 허페이 · 퉁링) 여정 정보 웹사이트 · PWA.

게시 주소: https://int-megaline.github.io/infor-bt-itinerary/

## 파일 구성
| 파일 | 역할 |
|---|---|
| `index.html` | 페이지 골격 (섹션, 내비게이션, PWA 메타태그) |
| `styles.css` | 라이트/다크 테마, 반응형 레이아웃 |
| `data.js` | 여정 데이터 (원본: Google Sheets "업데이트 R02") — **일정 변경 시 이 파일만 수정** |
| `app.js` | 렌더링, D-Day, 듀얼 시계, 진행 일정 하이라이트, 체크리스트, PWA 설치 |
| `manifest.json` | PWA 앱 정보 (이름, 아이콘, 테마 색상) |
| `sw.js` | 서비스워커 — 오프라인 캐시 |
| `icons/` | 파비콘 및 앱 아이콘 (SVG 원본 + PNG 192/512/maskable/apple-touch) |

## PWA 설치
- Android / PC Chrome · Edge: 상단 `앱 설치` 버튼 또는 주소창 설치 아이콘
- iPhone / iPad Safari: 공유 → 홈 화면에 추가 (사이트 상단 안내 카드 표시)
- 한 번 열어 두면 중국 현지 등 네트워크가 불안정해도 저장된 내용으로 열람 가능

## 업데이트 배포 시 주의
- `data.js` 등 파일 수정 후 **`sw.js`의 `VERSION` 값을 올려서** 커밋할 것 (예: `apsse-trip-v6` → `v7`)
- 페이지와 `data.js`는 네트워크 우선이라 온라인 상태에서는 바로 반영됨
- CSS · JS는 캐시 우선이라 VERSION 변경 후 다음 접속 시 반영됨

## 참고
- 중국 현지 접속 고려: 외부 웹폰트 · CDN 미사용, 지도 링크는 Google 지도 + Amap(高德) 병행
- 체크리스트 체크 상태와 테마 설정은 각 기기 브라우저(localStorage)에만 저장됨
