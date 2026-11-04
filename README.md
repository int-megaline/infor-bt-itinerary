# APSSE Business Trip Itinerary

Megaline APSSE 조선소 출장(2026.12.08 ~ 12.10, 중국 안후이성 허페이 · 퉁링) 여정 정보 웹사이트.

## 파일 구성
| 파일 | 역할 |
|---|---|
| `index.html` | 페이지 골격 (섹션, 내비게이션) |
| `styles.css` | 라이트/다크 테마, 반응형 레이아웃 |
| `data.js` | 여정 데이터 (원본: Google Sheets "업데이트 R02") — **일정 변경 시 이 파일만 수정** |
| `app.js` | 렌더링, D-Day, 듀얼 시계, 진행 일정 하이라이트, 체크리스트 |

## GitHub Pages 게시
1. 저장소 루트에 위 4개 파일 업로드
2. Settings → Pages → Branch `main` / `/ (root)` 선택 후 Save
3. `https://<계정>.github.io/<저장소>/` 로 접속

## 참고
- 중국 현지 접속 고려: 외부 웹폰트 · CDN 미사용, 지도 링크는 Google 지도 + Amap(高德) 병행
- 단, `github.io` 자체가 중국 내에서 느리거나 불안정할 수 있음 → 2차 PWA 단계에서 오프라인 캐시로 보완 예정
- 체크리스트 체크 상태와 테마 설정은 각 기기 브라우저(localStorage)에만 저장됨

## 다음 단계 (PWA)
- `manifest.json`, 앱 아이콘(192/512px), `sw.js`(오프라인 캐시) 추가
- `index.html`의 manifest 주석 해제 및 서비스워커 등록
