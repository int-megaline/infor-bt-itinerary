/* =========================================================
   APSSE 출장 여정 데이터 (소스: Google Sheets "업데이트 R02")
   일정 변경 시 이 파일만 수정하면 됨.
   start / end 는 절대 시각(ISO, 시간대 포함) — 현재 진행 일정 하이라이트에 사용
   KST = +09:00 (서울), CST = +08:00 (허페이)
   ========================================================= */
(function () {
  var amapSearch = function (kw) {
    return "https://uri.amap.com/search?keyword=" + encodeURIComponent(kw) + "&city=340100&callnative=1";
  };
  var gmap = function (q) {
    return "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(q);
  };

  window.TRIP = {
    revision: "R02",
    updated: "2026-11-04",
    title: "APSSE 비즈니스 출장 종합 여정표",
    region: "중국 안후이성 허페이 · 퉁링",
    period: { start: "2026-12-08", end: "2026-12-10", label: "2026.12.08(화) ~ 12.10(목)", nights: "2박 3일" },
    departAt: "2026-12-08T09:00:00+09:00",
    returnAt: "2026-12-10T15:35:00+09:00",
    purpose: "APSSE 조선소 현장 시찰 및 경영진 미팅",
    travelers: [
      { name: "정준택", role: "해운총괄" },
      { name: "남상태", role: "고문" },
      { name: "최진욱", role: "기술영업팀장" },
      { name: "강준서", role: "부장 · 현장 통역" }
    ],
    kpis: [
      { label: "출장 기간", value: "2박 3일", sub: "2026-12-08 ~ 12-10" },
      { label: "왕복 항공료 (1인)", value: "₩407,607", sub: "대한항공 직항 · 일반석", fn: 1 },
      { label: "조선소 편도 소요", value: "약 2.5h", sub: "허페이 ↔ 퉁링 쭝양현" },
      { label: "주요 미션", value: "시찰 · 만찬", sub: "조선소 현장 시찰 & 경영진 만찬" }
    ],

    flights: [
      {
        dir: "출국편", date: "2026-12-08 (화)", flight: "KE 155", airline: "대한항공",
        aircraft: "Boeing 737", cabin: "이코노미",
        from: { code: "ICN", city: "인천", time: "09:00", tz: "KST" },
        to: { code: "HFE", city: "허페이", time: "11:00", tz: "현지" },
        duration: "3시간 00분", amenities: "전원·USB / VOD", co2: "150 kg CO2e", fare: "₩203,800"
      },
      {
        dir: "귀국편", date: "2026-12-10 (목)", flight: "KE 156", airline: "대한항공",
        aircraft: "Boeing 737", cabin: "이코노미",
        from: { code: "HFE", city: "허페이", time: "12:00", tz: "현지" },
        to: { code: "ICN", city: "인천", time: "15:35", tz: "KST" },
        duration: "2시간 35분", amenities: "전원·USB / VOD", co2: "158 kg CO2e", fare: "₩203,807"
      }
    ],
    flightTotal: { fare: "₩407,607", time: "5시간 35분", co2: "308 kg CO2e", note: "왕복 직항 · 대한항공 마일리지 적립 가능 · 최저 총 가격 기준" },
    flightNotes: [
      "인천공항 출발 2.5시간 전(06:30) 집결 권장",
      "허페이 현지 시각은 한국보다 1시간 느림 (도착 11:00은 현지 시각)",
      "여권 잔여 유효기간 6개월 이상 필수 점검"
    ],

    /* 일정 구분: move(이동) · tour(투어) · meal(식사) · work(업무) · rest(휴식) */
    days: [
      {
        id: "d1", label: "Day 1", date: "12/08 (화)", theme: "허페이 도착 · 5시간 시내 투어",
        items: [
          { t: "06:30 ~ 09:00", s: "2026-12-08T06:30:00+09:00", e: "2026-12-08T09:00:00+09:00", h: [6.5, 9], cat: "move", tag: "출국 수속",
            title: "인천국제공항 T2 집결, 탑승 수속 및 출국 심사",
            place: "인천공항 제2여객터미널", g: gmap("Incheon International Airport Terminal 2"),
            by: "공항철도 / 리무진", memo: "여권(6개월 이상 유효), e-티켓, 중국 비자 점검" },
          { t: "09:00 ~ 11:00", s: "2026-12-08T09:00:00+09:00", e: "2026-12-08T11:00:00+08:00", h: [9, 11], cat: "move", tag: "항공 이동",
            title: "인천(ICN) 출발 → 허페이 신차오 공항(HFE) 도착 · KE 155",
            place: "허페이 신차오 국제공항", g: gmap("Hefei Xinqiao International Airport"), a: amapSearch("合肥新桥国际机场"),
            by: "직항 (소요 3시간)", memo: "기내식 제공, 현지 시각 11:00 도착 (한국 대비 -1시간)" },
          { t: "11:00 ~ 12:30", s: "2026-12-08T11:00:00+08:00", e: "2026-12-08T12:30:00+08:00", h: [11, 12.5], cat: "move", tag: "입국 & 체크인",
            title: "입국 심사 및 수하물 수취 후 시내 호텔 이동, 체크인 / 짐 보관",
            place: "더 웨스틴 허페이 바오허 (예정)", g: gmap("The Westin Hefei Baohe"), a: amapSearch("合肥万达威斯汀酒店"),
            by: "전용 차량 (약 45분)", memo: "현지 로밍 / eSIM 데이터 연결 확인, 현지 화폐 / 알리페이 점검" },
          { t: "12:30 ~ 13:45", s: "2026-12-08T12:30:00+08:00", e: "2026-12-08T13:45:00+08:00", h: [12.5, 13.75], cat: "meal", tag: "5시간 투어 ①",
            title: "[오찬] 바오허 완다 플라자 동칭추(同庆楼) 정통 안후이 휘채(徽菜) 비즈니스 오찬",
            place: "바오허 완다 동칭추(同庆楼)", g: gmap("同庆楼 包河万达 合肥"), a: amapSearch("同庆楼 包河万达"),
            by: "도보 3분 (웨스틴 인접)", memo: "취궤어(臭鳜鱼) 등 대표 휘채 요리 명가, 비즈니스 룸 구비 (완다몰 3층)" },
          { t: "13:45 ~ 15:15", s: "2026-12-08T13:45:00+08:00", e: "2026-12-08T15:15:00+08:00", h: [13.75, 15.25], cat: "tour", tag: "5시간 투어 ②",
            title: "[역사] 포공사(包公祠) 및 포하공원 유적 시찰",
            place: "포공사 (판관 포청천 사당)", g: gmap("Baogong Memorial Temple Hefei"), a: amapSearch("包公祠"),
            by: "차량 이동 (15분)", memo: "허페이 대표 역사 인물 유적 탐방, 호수 공원 산책" },
          { t: "15:15 ~ 17:30", s: "2026-12-08T15:15:00+08:00", e: "2026-12-08T17:30:00+08:00", h: [15.25, 17.5], cat: "tour", tag: "5시간 투어 ③",
            title: "[문화] 이홍장 고거(李鸿章故居) 및 회하로 보행가 참관",
            place: "이홍장 고거 전시관", g: gmap("Former Residence of Li Hongzhang Hefei"), a: amapSearch("李鸿章故居"),
            by: "차량 이동 (15분)", memo: "청나라 말기 양무운동 및 근대 외교 역사 관람, 회하로 보행가 탐방" },
          { t: "17:30 ~ 20:30", s: "2026-12-08T17:30:00+08:00", e: "2026-12-08T20:30:00+08:00", h: [17.5, 20.5], cat: "meal", tag: "석식 & 휴식",
            title: "[석식] 바오허 완다 플라자 루저우타이타이(庐州太太) 디너 후 호텔 복귀",
            place: "바오허 완다 플라자 식당가", g: gmap("庐州太太 包河万达 合肥"), a: amapSearch("庐州太太 包河万达"),
            by: "도보 3분 (호텔 인접)", memo: "안후이 가정식 명가 '루저우타이타이' 추천, 익일 조선소 출장자료 점검" }
        ]
      },
      {
        id: "d2", label: "Day 2", date: "12/09 (수)", theme: "APSSE 조선소 현장 시찰 · 공식 만찬",
        items: [
          { t: "07:30 ~ 08:30", s: "2026-12-09T07:30:00+08:00", e: "2026-12-09T08:30:00+08:00", h: [7.5, 8.5], cat: "rest", tag: "조식 & 출발",
            title: "호텔 조식 후 로비 집결, 퉁링 APSSE 이동 준비",
            place: "호텔 로비 (더 웨스틴 · 예정)", by: "전용 밴 대기", memo: "비즈니스 캐주얼 및 현장 안전화 지참 확인" },
          { t: "08:30 ~ 11:00", s: "2026-12-09T08:30:00+08:00", e: "2026-12-09T11:00:00+08:00", h: [8.5, 11], cat: "move", tag: "장거리 이동",
            title: "허페이 시내 → APSSE 조선소 이동 (G3 경유)",
            place: "안후이성 퉁링시 쭝양현 (M796+MW9)", site: true,
            by: "전용 차량 (2.5시간 소요)", memo: "이동 중 차내 브리핑 진행, 현지 접견 담당관 유선 컨택" },
          { t: "11:00 ~ 12:30", s: "2026-12-09T11:00:00+08:00", e: "2026-12-09T12:30:00+08:00", h: [11, 12.5], cat: "work", tag: "상견례 & 브리핑",
            title: "출장자 소개 및 조선소 사업팀 소개 (슈레이 부총경리 이하 신조 관련 부서장 참석), 건조 현황 및 향후 일정 브리핑",
            place: "APSSE 본관 2층 대회의실", by: "-", org: true, memo: "메가라인 출장단 소개(통역: 강준서 부장), 슈레이 부총경리 접견 및 신조선 건조 현황 · 향후 일정 수렴" },
          { t: "12:30 ~ 13:45", s: "2026-12-09T12:30:00+08:00", e: "2026-12-09T13:45:00+08:00", h: [12.5, 13.75], cat: "meal", tag: "환영 오찬",
            title: "APSSE 주최 공식 환영 비즈니스 오찬 (슈레이 부총경리 주도, 생산 관련 부서장 참석)",
            place: "APSSE 측 준비 (장소 미정)", tbd: true, by: "도보 이동", memo: "슈레이 부총경리 및 생산 부서장 라포 형성, 현장 감리사(SMC) 및 이홍정 매니저 동석" },
          { t: "13:45 ~ 17:00", s: "2026-12-09T13:45:00+08:00", e: "2026-12-09T17:00:00+08:00", h: [13.75, 17], cat: "work", tag: "조선소 현장시찰",
            title: "조선소 제작 현장 방문 및 현황 브리핑 (선박 건조 선대, 안벽 설비 및 장비 제작라인 정밀 실사)",
            place: "APSSE 건조 안벽 & 안벽 야드", by: "야드 내 차량 이동", memo: "메가라인 고용 현장 감리사(SMC) 및 파견 감독관(이홍정 매니저) 현장 인솔 및 건조 현황 상세 브리핑" },
          { t: "17:00 ~ 18:00", s: "2026-12-09T17:00:00+08:00", e: "2026-12-09T18:00:00+08:00", h: [17, 18], cat: "work", tag: "시찰 정리 & 간담",
            title: "조선소 현장 시찰 결과 정리 및 감리단 · 감독관 종합 간담회 (단순 방문으로 기술협의 없음)",
            place: "APSSE 선주 사무실", by: "야드 내 차량 이동", memo: "기술협의 제외, SMC 감리사 및 이홍정 매니저 실사 소견 점검 및 석식 이동 준비" },
          { t: "18:00 ~ 21:00", s: "2026-12-09T18:00:00+08:00", e: "2026-12-09T21:00:00+08:00", h: [18, 21], cat: "meal", tag: "공식 디너 만찬",
            title: "APSSE 주요 인사 초청 공식 비즈니스 디너 만찬 (슈레이 부총경리 주도, 생산 관련 부서장 참석)",
            place: "APSSE 측 준비 (장소 미정)", tbd: true, by: "의전 차량 이동", memo: "슈레이 부총경리 및 생산 부서장 네트워킹, 상호 우호 증진 및 기념품 증정" }
        ]
      },
      {
        id: "d3", label: "Day 3", date: "12/10 (목)", theme: "허페이 출발 · 인천 복귀",
        items: [
          { t: "08:30 ~ 15:35", s: "2026-12-10T08:30:00+08:00", e: "2026-12-10T15:35:00+09:00", h: [8.5, 15.58], cat: "move", tag: "공항 이동 & 귀국",
            title: "호텔 체크아웃 → 신차오 공항 이동 및 인천 복귀 (KE 156)",
            place: "신차오 공항(12:00) → 인천(15:35)", g: gmap("Hefei Xinqiao International Airport"), a: amapSearch("合肥新桥国际机场"),
            by: "차량 50분 + 항공 2h 35m", memo: "출장 결과 정리, 15:35 인천 도착 후 출장 보고 준비" }
        ]
      }
    ],

    hotels: [
      { id: "h2", tag: "후보 1 · 예정", name: "더 웨스틴 허페이 바오허", en: "The Westin Hefei Baohe", grade: "5성급", brand: "Marriott",
        loc: "바오허 완다광장 인접, 허페이 남역 차 15분", access: "남부 고속도로 IC 직결 최적 (편도 2.3h 단축)",
        perks: "헤븐리 베드, 비즈니스 라운지, 우수한 피트니스", min: 140000, max: 170000, stars: 5, verdict: "최우수 추천 호텔", pick: true,
        url: "https://www.marriott.com/en-us/hotels/hfewi-the-westin-hefei-baohe/overview", fn: 2, a: amapSearch("合肥万达威斯汀酒店") },
      { id: "h1", tag: "후보 2", name: "포 포인츠 바이 쉐라톤 허페이", en: "Four Points by Sheraton Hefei, Baohe", grade: "4성급", brand: "Marriott",
        loc: "바오허구 시내 중심가 인접, 지하철역 도보권", access: "고속도로 진입 20분, 퉁링 이동 보통",
        perks: "가성비 우수, 메리어트 포인트 적립, 깔끔한 룸", min: 95000, max: 120000, stars: 3, verdict: "실속형 출장 추천",
        url: "https://marriott.com/HFEHF", fn: 3, a: amapSearch("合肥包河福朋喜来登酒店") },
      { id: "h3", tag: "후보 3", name: "샹그릴라 호텔 허페이", en: "Shangri-La Hefei", grade: "5성급", brand: "Shangri-La",
        loc: "루양구 중심, 포공사 · 이홍장 고거 관광 최인접", access: "도심 중심부로 출근 시간대 약간 정체 감안",
        perks: "최고급 외빈 접대 식당, 럭셔리 라운지 구비", min: 160000, max: 210000, stars: 4, verdict: "의전 및 관광 최적",
        url: "https://www.shangri-la.com/hefei/shangrila/about", fn: 4, a: amapSearch("合肥香格里拉大酒店") }
    ],
    hotelReasons: [
      { k: "퉁링 이동성", v: "2일차 아침 퉁링 APSSE 조선소 이동 시 허페이 남부 외곽고속도로(G3) IC와 직결되어 도심 출근 정체 우회 가능" },
      { k: "인프라 편의", v: "바오허 완다 복합몰과 연결, 1일차 5시간 투어 후 석식 · 미팅 룸 · 현지 필요 물품 조달에 최적임" },
      { k: "비즈니스 신뢰", v: "글로벌 메리어트 5성급 체인으로 영문 소통 원활, 정식 영수증(發票) 발급 및 결제 프로세스 보장됨" }
    ],

    site: {
      name: "APSSE",
      full: "Anhui Port Sealand Sky Equipment",
      address: "중국 안후이성 퉁링시 쭝양현",
      addressCn: "安徽省 铜陵市 枞阳县",
      plus: "M796+MW9",
      dms: "30°40'08.9\"N, 117°15'44.5\"E",
      lat: 30.669139, lng: 117.262361,
      route: ["허페이 시내 (숙소 · 웨스틴 예정)", "G3 징타이 고속도로", "퉁링시 쭝양현 APSSE"],
      routeTime: "편도 약 2.5시간",
      flex: "현지 기상 / 야드 사정에 따라 Day 1 투어와 일정 맞교환 가능"
    },

    /* 조선소 조직도 — 원본: 조선소 제공 「Shipyard Organization Chart(261016).docx」 (2026.10.16 개정본)
       직함 · 부서명은 중문 원문 기준 한국어 번역, 인원은 개략치(約) */
    org: {
      asOf: "2026.10.16",
      company: "안휘항항육해장비유한공사",
      companyEn: "Anhui Port & Shipping Sealand Equipment Co., Ltd.",
      chair: { ko: "회장 (이사회 의장)", zh: "董事长" },
      gm: { ko: "총경리 (사장)", zh: "总经理", name: "Zhang Nian", tel: "+86-186-6339-3018", mail: "zhangnian0921@163.com" },
      dgm: { ko: "부총경리 (부사장)", zh: "副总经理", name: "Xu Lei", tel: "+86-189-0633-5985", mail: "18906335985@163.com", note: "본 출장 현지 접견 · 의전 담당" },
      pm: { ko: "프로젝트 매니저", zh: "项目经理", name: "Que Jun", tel: "18818877103", mail: "99740903@qq.com", note: "원본 조직도에는 없고 연락처 목록에만 기재 · 10.16 개정 시 Shen Songhong → Que Jun 변경" },
      centers: [
        { c: 1, ko: "경영관리센터", zh: "企业管理中心", depts: [
          { ko: "총무부", zh: "综合部", n: 5, head: "Hu Tiansheng", tel: "19956266282" },
          { ko: "재무부", zh: "财务部", n: 3, head: "Tao Wenting", tel: "18756206703" }
        ] },
        { c: 2, ko: "안전센터", zh: "安全中心", depts: [
          { ko: "안전환경부", zh: "安全环保部", n: 8, head: "Yang Haijun", tel: "15605452217", pm: "He Zhen", pmTel: "13034061134" },
          { ko: "품질관리부", zh: "质量部", n: 8, head: "Li Ming", tel: "13705535271", pm: "Zhou Yang", pmTel: "18855616717", mail: "13035480827@163.com" },
          { ko: "지원부", zh: "保障部", n: 9, head: "Yao Chunfeng", tel: "13780993680" }
        ] },
        { c: 3, ko: "구매영업센터", zh: "采购营销中心", depts: [
          { ko: "구매부", zh: "采购部", n: 13, head: "Fang Jun", tel: "15005625652", pm: "Luo Jiahao", pmTel: "19156207049", mail: "pd@ahsealand.com" },
          { ko: "영업부", zh: "经营部", n: 3, head: "Zhao Yucheng", tel: "18263341393", pm: "Zhu Zhuo", pmTel: "17754118976", mail: "anhuisealand_bd@163.com" }
        ] },
        { c: 4, ko: "생산기술센터", zh: "生产技术中心", depts: [
          { ko: "생산부", zh: "生产部", n: 36, head: "Hu Xiaoming", tel: "13376332722", pm: "Yang Wei", pmTel: "18908632998" },
          { ko: "기술부", zh: "技术部", n: 9, head: "Huang Xiaochuan", tel: "17729633790", pm: "Wang Kunjun", pmTel: "19163379651", mail: "dd@ahsealand.com" },
          { ko: "선체 작업장", zh: "船体车间", n: 28, head: "Ji Dabin", tel: "18763358877", pm: "Xue Guofeng", pmTel: "18067190995" },
          { ko: "기전 작업장", zh: "机电车间", n: 19, head: "Lai Qingzhong", tel: "18063392398" },
          { ko: "도장 작업장", zh: "涂装车间", n: 17, head: "Liang Junhua", tel: "13857221622" }
        ] }
      ],
      notes: [
        "한국어 직함 · 부서명은 중문 원문(董事长 · 总经理 · 副总经理 등) 기준 번역이며, 중국 기업 관행상 总经理는 '총경리(사장)'로 표기함.",
        "부서별 인원은 원본 기재 개략치(約)임.",
        "프로젝트 매니저(项目经理)는 원본 조직도에는 없고 연락처 목록에만 기재되어 있어 연락처 표에만 반영함."
      ]
    },

    checklist: [
      { id: "c1", cat: "안전", name: "보호장구 (PPE)", detail: "도크 진입용 안전모 (스틸토 안전화, 반사조끼는 현장 착용 필수 요구사항 아님)", status: "준비완료" },
      { id: "c2", cat: "보안", name: "야드 촬영 및 보안", detail: "도크 및 제작시설 내 사진 / 영상 촬영 승인 및 보안서약서(NDA) 준비", status: "준비완료" },
      { id: "c3", cat: "시찰", name: "브리핑 및 현장 자료", detail: "신조선 건조 현황표, 현장 감리(SMC) 보고서, 회사 소개서(중 · 영문본)", status: "확인필요" },
      { id: "c4", cat: "의전", name: "명함 및 기념품", detail: "중문 / 영문 비즈니스 명함(충분량), 경영진 증정용 공식 기념품", status: "확인필요" },
      { id: "c5", cat: "결제", name: "모바일 페이 · 통신 · 현금", detail: "알리페이 / 위챗페이 해외카드 등록 완료, 로밍 / 데이터 eSIM 점검, 비상용 현금(위안화 CNY) 환전 · 준비", status: "확인필요" }
    ],

    emergency: {
      consulate: { name: "주상하이 대한민국 총영사관", tel: "+86-21-6295-5000", fn: 5 },
      local: { name: "Xu Lei (슈레이)", role: "APSSE 부총경리 · 현지 접견 의전 담당", tel: "+86-189-0633-5985" },
      swap: "현지 기상 악화(폭우, 안개 등) 시 조선소 야드 실사가 어려울 수 있으므로, Day 1과 Day 2의 순서를 상호 스왑(Swap)하여 진행"
    },

    sources: [
      { n: 1, t: "Google Flights — ICN ↔ HFE 왕복 항공편 조회 결과", u: "https://www.google.com/travel/flights/s/eHGTD66wDYmVztSE8" },
      { n: 2, t: "Marriott — The Westin Hefei Baohe", u: "https://www.marriott.com/en-us/hotels/hfewi-the-westin-hefei-baohe/overview" },
      { n: 3, t: "Marriott — Four Points by Sheraton Hefei, Baohe", u: "https://marriott.com/HFEHF" },
      { n: 4, t: "Shangri-La — Shangri-La Hefei", u: "https://www.shangri-la.com/hefei/shangrila/about" },
      { n: 5, t: "외교부 — 주상하이 대한민국 총영사관", u: "https://overseas.mofa.go.kr/cn-shanghai-ko/index.do" },
      { n: 7, t: "조선소 제공 원본 — Shipyard Organization Chart(261016).docx (사내 수령 문서, 접근 권한 필요)", u: "https://drive.google.com/file/d/13rPqBZ6IKu5Xi5WQQLcEZCRVE7LHW-II/view?usp=drivesdk" },
      { n: 8, t: "NB25K 신조 대시보드 — 조직도 탭 (조직도 업데이트 이력)", u: "https://int-megaline.github.io/NB25K/" },
      { n: 6, t: "원본 여정표 — Google Sheets (업데이트 R02)", u: "https://docs.google.com/spreadsheets/d/18G8vPgRr7d0uz90ywfMK6sg9JoocS1nMksOqfvnTdlU/edit?gid=1867012816#gid=1867012816" }
    ]
  };
})();
