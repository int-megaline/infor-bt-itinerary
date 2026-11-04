/* APSSE Trip — render & interaction (vanilla JS, 외부 라이브러리 없음) */
(function () {
  "use strict";
  var T = window.TRIP;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var esc = function (s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); };
  var store = {
    get: function (k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set: function (k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  };
  var fn = function (n) { return n ? '<sup class="fn"><a href="#fn' + n + '" data-jump="fn' + n + '">[' + n + "]</a></sup>" : ""; };
  var ICON = {
    pin: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/></svg>',
    car: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 17h14M6 17l1.5-6h9L18 17M7 17v2M17 17v2"/><circle cx="8" cy="14" r=".6"/><circle cx="16" cy="14" r=".6"/></svg>',
    ext: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/></svg>',
    plane: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M2.5 13.5l19-6-6 13-3-6z"/><path d="M12.5 14.5l9-7"/></svg>'
  };

  /* ---------- Theme ---------- */
  /* 현재 "화면에 실제 적용된" 테마를 기준으로 판단
     (data-theme 속성 → 없으면 기기 설정). 미리보기 등 외부 화면이 data-theme을 먼저 지정한 경우에도
     버튼 1회 클릭으로 라이트 ↔ 다크가 전환되도록 함 */
  function sysDark() { return !!(window.matchMedia && matchMedia("(prefers-color-scheme: dark)").matches); }
  function curDark() {
    var a = document.documentElement.getAttribute("data-theme");
    if (a === "dark") return true;
    if (a === "light") return false;
    return sysDark();
  }
  function isDark() { return curDark(); }
  function applyTheme(t) {
    var r = document.documentElement;
    if (t === "light" || t === "dark") r.setAttribute("data-theme", t); /* 저장값 없으면 기존 상태 유지 */
    var b = $("#themeBtn");
    if (b) {
      var dark = curDark();
      b.innerHTML = (dark
        ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 14.5A8 8 0 0 1 9.5 4 8 8 0 1 0 20 14.5z"/></svg>'
        : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>')
        + "<span>" + (dark ? "다크" : "라이트") + "</span>";
      b.setAttribute("aria-label", (dark ? "라이트" : "다크") + " 모드로 전환");
    }
  }
  var theme = store.get("apsse-theme") || "system";
  applyTheme(theme);

  /* ---------- Hero ---------- */
  function renderHero() {
    $("#heroTitle").textContent = T.title;
    $("#heroSub").textContent = T.period.label + " · " + T.period.nights + " · " + T.purpose;
    $("#travelers").innerHTML = T.travelers.map(function (p) {
      return '<span class="traveler">' + esc(p.name) + "<small>" + esc(p.role) + "</small></span>";
    }).join("");
    $("#kpis").innerHTML = T.kpis.map(function (k) {
      return '<div class="card kpi"><div class="k">' + esc(k.label) + fn(k.fn) + '</div><div class="v">' + esc(k.value) + '</div><div class="s">' + esc(k.sub) + "</div></div>";
    }).join("");
  }
  function tickHero() {
    var now = Date.now(), dep = Date.parse(T.departAt), ret = Date.parse(T.returnAt);
    var big = $("#ddayBig"), lbl = $("#ddayLbl"), pill = $("#statusPill");
    if (now < dep) {
      var ms = dep - now, d = Math.floor(ms / 864e5), h = Math.floor((ms % 864e5) / 36e5);
      big.textContent = d > 0 ? "D-" + d : "D-DAY";
      lbl.textContent = "출국까지 " + d + "일 " + h + "시간 (KE 155 · 09:00 KST)";
      pill.textContent = "출발 전";
    } else if (now <= ret) {
      var day = Math.floor((now - Date.parse("2026-12-08T00:00:00+08:00")) / 864e5) + 1;
      big.textContent = "DAY " + Math.min(Math.max(day, 1), 3);
      lbl.textContent = "출장 진행 중";
      pill.textContent = "진행 중";
    } else {
      big.textContent = "완료";
      lbl.textContent = "출장 일정 종료 · 출장 보고 준비";
      pill.textContent = "종료";
    }
    var fmt = function (tz) {
      var d = new Date();
      return {
        t: d.toLocaleTimeString("ko-KR", { timeZone: tz, hour: "2-digit", minute: "2-digit", hour12: false }),
        d: d.toLocaleDateString("ko-KR", { timeZone: tz, month: "numeric", day: "numeric", weekday: "short" })
      };
    };
    var s = fmt("Asia/Seoul"), h2 = fmt("Asia/Shanghai");
    $("#clkSeoul").textContent = s.t; $("#clkSeoulD").textContent = s.d;
    $("#clkHefei").textContent = h2.t; $("#clkHefeiD").textContent = h2.d;
  }

  /* ---------- Flights ---------- */
  function renderFlights() {
    $("#passes").innerHTML = T.flights.map(function (f) {
      return '<article class="card pass">' +
        '<div class="pass-top"><div class="dir"><em>' + esc(f.dir) + "</em>" + esc(f.date) + '</div><div class="fno">' + esc(f.airline) + " " + esc(f.flight) + "</div></div>" +
        '<div class="pass-route">' +
          '<div class="pt"><div class="code">' + f.from.code + '</div><div class="city">' + esc(f.from.city) + '</div><div class="tm">' + f.from.time + "<small>" + f.from.tz + "</small></div></div>" +
          '<div class="mid">' + ICON.plane + esc(f.duration) + "</div>" +
          '<div class="pt r"><div class="code">' + f.to.code + '</div><div class="city">' + esc(f.to.city) + '</div><div class="tm">' + f.to.time + "<small>" + f.to.tz + "</small></div></div>" +
        "</div>" +
        '<dl class="pass-meta">' +
          "<div><dt>기종</dt><dd>" + esc(f.aircraft) + "</dd></div>" +
          "<div><dt>좌석</dt><dd>" + esc(f.cabin) + "</dd></div>" +
          "<div><dt>기내</dt><dd>" + esc(f.amenities) + "</dd></div>" +
          "<div><dt>1인 운임</dt><dd>" + esc(f.fare) + "</dd></div>" +
        "</dl></article>";
    }).join("");
    var t = T.flightTotal;
    $("#flightTotal").innerHTML =
      '<div class="item"><span>왕복 운임 (1인)' + fn(1) + "</span><b>" + t.fare + "</b></div>" +
      '<div class="item"><span>총 비행시간</span><b>' + t.time + "</b></div>" +
      '<div class="item"><span>탄소 배출 <i class="tip" tabindex="0" data-tip="Google Flights 표기 기준 1인 추정 배출량임">?</i></span><b>' + t.co2 + "</b></div>" +
      '<div class="note">' + esc(t.note) + "</div>";
    var vals = T.flights.map(function (f) { return parseFloat(f.co2); }), mx = 200;
    $("#co2").innerHTML = '<div class="small muted">편도별 탄소 배출량 (kg CO2e, 0~200 스케일)</div>' + T.flights.map(function (f, i) {
      return '<div class="row"><span>' + f.flight + '</span><div class="track"><div class="fill" style="width:' + (vals[i] / mx * 100) + '%"></div></div><b>' + vals[i] + " kg</b></div>";
    }).join("");
    $("#flightNotes").innerHTML = T.flightNotes.map(function (n) { return "<li>" + esc(n) + "</li>"; }).join("");
  }

  /* ---------- Schedule ---------- */
  var CAT = { move: "이동", tour: "투어", meal: "식사", work: "업무 · 시찰", rest: "준비" };
  var curDay = store.get("apsse-day") || "d1";
  function placeLinks(it) {
    var out = [];
    if (it.org) out.push('<a class="chip-link" href="#org" data-jump="org">참석 조직 · 조직도 보기 ↓</a>');
    if (it.site) {
      out.push('<a class="chip-link" target="_blank" rel="noopener" href="' + siteLinks().g + '">' + ICON.ext + "Google 지도</a>");
      out.push('<a class="chip-link" target="_blank" rel="noopener" href="' + siteLinks().a + '">' + ICON.ext + "Amap 高德</a>");
    } else {
      if (it.g) out.push('<a class="chip-link" target="_blank" rel="noopener" href="' + it.g + '">' + ICON.ext + "Google 지도</a>");
      if (it.a) out.push('<a class="chip-link" target="_blank" rel="noopener" href="' + it.a + '">' + ICON.ext + "Amap 高德</a>");
    }
    return out.length ? '<div class="links">' + out.join("") + "</div>" : "";
  }
  function renderDayTabs() {
    $("#dayTabs").innerHTML = T.days.map(function (d) {
      return '<button class="day-tab" role="tab" id="tab-' + d.id + '" aria-controls="dayPanel" aria-selected="' + (d.id === curDay) + '" data-day="' + d.id + '"><b>' + d.label + " · " + d.date + "</b><span>" + esc(d.theme) + "</span></button>";
    }).join("");
  }
  function renderGantt(day) {
    var x0 = 6, x1 = 22, W = 720, L = 8, R = 8, top = 18, barH = 30;
    var sx = function (h) { return L + (h - x0) / (x1 - x0) * (W - L - R); };
    var svg = '<svg viewBox="0 0 ' + W + ' 76" role="img" aria-label="' + esc(day.label) + ' 시간대별 일정 막대">';
    for (var h = x0; h <= x1; h += 2) {
      var x = sx(h);
      svg += '<line class="grid" x1="' + x + '" x2="' + x + '" y1="' + (top - 4) + '" y2="' + (top + barH + 4) + '"/>';
      svg += '<text x="' + x + '" y="' + (top + barH + 18) + '" text-anchor="' + (h === x0 ? "start" : h === x1 ? "end" : "middle") + '">' + (h < 10 ? "0" : "") + h + ":00</text>";
    }
    day.items.forEach(function (it, i) {
      var a = sx(it.h[0]), b = sx(it.h[1]);
      svg += '<rect class="seg c-' + it.cat + '" style="fill:var(--c)" x="' + a + '" y="' + top + '" width="' + Math.max(b - a, 2) + '" height="' + barH + '" rx="3" data-i="' + i + '" tabindex="0"><title>' + esc(it.t + " · " + it.tag) + "</title></rect>";
    });
    svg += "</svg>";
    var cats = {};
    day.items.forEach(function (it) { cats[it.cat] = 1; });
    $("#gantt").innerHTML =
      '<div class="gantt-head"><b>' + day.label + " 시간 배분 (06:00 ~ 22:00)</b>" +
      '<div class="legend">' + Object.keys(cats).map(function (c) { return '<span class="c-' + c + '"><i style="background:var(--c)"></i>' + CAT[c] + "</span>"; }).join("") + "</div></div>" +
      '<div class="gantt-wrap">' + svg + "</div>";
    $$(".seg", $("#gantt")).forEach(function (el) {
      var i = el.getAttribute("data-i");
      el.addEventListener("mouseenter", function () { if (!gtipPinned) showGtip(el, day, i, false); });
      el.addEventListener("mouseleave", function () { if (!gtipPinned) hideGtip(); });
      el.addEventListener("click", function (e) { e.stopPropagation(); showGtip(el, day, i, true); });
      el.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); showGtip(el, day, i, true); }
      });
    });
  }

  /* 일정 차트 툴팁 카드: 마우스 오버 = 미리보기, 클릭/탭 = 고정 + "상세 일정 보기" 링크 */
  var gtipPinned = false;
  function gtipEl() {
    var t = $("#gtip");
    if (!t) {
      t = document.createElement("div"); t.id = "gtip"; t.hidden = true; t.setAttribute("role", "dialog"); t.setAttribute("aria-label", "일정 요약");
      document.body.appendChild(t);
      t.addEventListener("click", function (e) {
        e.stopPropagation();
        if (e.target.closest(".gtip-x")) { hideGtip(); return; }
        var go = e.target.closest("[data-goev]");
        if (go) { hideGtip(); goEvent(go.getAttribute("data-goev")); }
      });
    }
    return t;
  }
  function showGtip(el, day, i, pin) {
    var it = day.items[+i], t = gtipEl();
    gtipPinned = pin;
    t.classList.toggle("pinned", pin);
    t.innerHTML =
      '<div class="gtip-hd"><b>' + esc(it.t) + '</b><span class="ev-tag c-' + it.cat + '">' + esc(it.tag) + "</span>" +
        (pin ? '<button type="button" class="gtip-x" aria-label="닫기">×</button>' : "") + "</div>" +
      '<div class="gtip-tt">' + esc(it.title) + "</div>" +
      '<div class="gtip-pl">' + esc(it.place) + "</div>" +
      (pin ? '<button type="button" class="gtip-go" data-goev="ev-' + day.id + "-" + i + '">상세 일정 보기 ↓</button>'
           : '<div class="gtip-hint">클릭하면 상세 일정 보기 링크 표시</div>');
    t.hidden = false;
    var r = el.getBoundingClientRect(), w = t.offsetWidth, h = t.offsetHeight;
    var x = Math.min(Math.max(8, r.left + r.width / 2 - w / 2), window.innerWidth - w - 8);
    var y = r.top - h - 8;
    if (y < 64) y = r.bottom + 8; /* 상단 공간 부족 시 막대 아래에 표시 */
    t.style.left = x + "px"; t.style.top = y + "px";
    if (pin) { var g = t.querySelector(".gtip-go"); g && g.focus({ preventScroll: true }); }
  }
  function hideGtip() { var t = $("#gtip"); if (t) t.hidden = true; gtipPinned = false; }
  function goEvent(id) {
    var target = document.getElementById(id); if (!target) return;
    target.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "center" });
    var d = target.querySelector("details"); if (d) d.open = true;
    target.classList.remove("flash"); void target.offsetWidth; target.classList.add("flash");
  }
  function splitTime(t) {
    var p = t.split("~");
    return "<span>" + p[0].trim() + "</span><span>~ " + (p[1] || "").trim() + "</span>";
  }
  function renderDay() {
    var day = T.days.filter(function (d) { return d.id === curDay; })[0] || T.days[0];
    $$(".day-tab").forEach(function (b) { b.setAttribute("aria-selected", b.getAttribute("data-day") === day.id); });
    renderGantt(day);
    $("#timeline").innerHTML = day.items.map(function (it, i) {
      return '<li class="card ev c-' + it.cat + '" id="ev-' + day.id + "-" + i + '" data-s="' + it.s + '" data-e="' + it.e + '">' +
        '<div class="ev-time"><div class="t">' + splitTime(it.t) + '</div><span class="ev-tag">' + esc(it.tag) + '</span><span class="now-badge" hidden>● NOW</span></div>' +
        '<div class="ev-body"><h3>' + esc(it.title) + "</h3>" +
          '<div class="ev-meta"><span>' + ICON.pin + esc(it.place) + (it.tbd ? ' <em class="tbd">미정</em>' : "") + "</span>" +
          (it.by && it.by !== "-" ? "<span>" + ICON.car + esc(it.by) + "</span>" : "") + "</div>" +
          placeLinks(it) +
          '<details class="memo"><summary>준비사항 · 메모</summary><p>' + esc(it.memo) + "</p></details>" +
        "</div></li>";
    }).join("");
    markNow();
  }
  function markNow() {
    var now = Date.now();
    $$("#timeline .ev").forEach(function (li) {
      var s = Date.parse(li.getAttribute("data-s")), e = Date.parse(li.getAttribute("data-e"));
      var on = now >= s && now < e;
      li.classList.toggle("now", on);
      li.classList.toggle("past", now >= e);
      li.querySelector(".now-badge").hidden = !on;
    });
  }
  function autoDay() {
    var now = Date.now();
    for (var i = 0; i < T.days.length; i++) {
      var its = T.days[i].items, last = its[its.length - 1];
      if (now < Date.parse(last.e) && now >= Date.parse(its[0].s) - 6 * 36e5) return T.days[i].id;
    }
    return null;
  }

  /* ---------- Hotels ---------- */
  function stars(n) { var s = ""; for (var i = 1; i <= 5; i++) s += i <= n ? "★" : '<span class="off">★</span>'; return s; }
  var won = function (n) { return "₩" + n.toLocaleString("ko-KR"); };
  function renderHotels() {
    var p = T.hotels.filter(function (h) { return h.pick; })[0];
    $("#hotelPick").innerHTML =
      '<div class="main"><div class="label">Planned · 숙소 예정 (2박 · 미확정)</div><h3>' + esc(p.name) + fn(p.fn) + '</h3><div class="en">' + esc(p.en) + "</div>" +
      '<div class="facts"><span class="fact">' + p.grade + " · " + p.brand + '</span><span class="fact">1박 ' + won(p.min) + " ~ " + won(p.max) + '</span><span class="fact">' + esc(p.loc) + "</span></div>" +
      '<div class="links"><a class="chip-link" target="_blank" rel="noopener" href="' + p.url + '">' + ICON.ext + "공식 페이지</a>" +
      '<a class="chip-link" target="_blank" rel="noopener" href="https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(p.en) + '">' + ICON.ext + "Google 지도</a>" +
      '<a class="chip-link" target="_blank" rel="noopener" href="' + p.a + '">' + ICON.ext + "Amap 高德</a></div></div>" +
      '<ul class="reasons">' + T.hotelReasons.map(function (r) { return "<li><b>" + esc(r.k) + "</b><span>" + esc(r.v) + "</span></li>"; }).join("") + "</ul>";

    $("#hotelGrid").innerHTML = T.hotels.map(function (h) {
      return '<article class="card hotel' + (h.pick ? " pick" : "") + '"><div class="hd"><span class="tag">' + esc(h.tag) + '</span><span class="stars" aria-label="추천도 ' + h.stars + '/5">' + stars(h.stars) + "</span></div>" +
        "<h4>" + esc(h.name) + fn(h.fn) + "<small>" + esc(h.en) + " · " + h.grade + " (" + h.brand + ")</small></h4>" +
        "<dl><div><dt>위치</dt><dd>" + esc(h.loc) + "</dd></div><div><dt>조선소 이동</dt><dd>" + esc(h.access) + "</dd></div>" +
        "<div><dt>장점</dt><dd>" + esc(h.perks) + '</dd></div><div><dt>1박 요금</dt><dd class="price">' + won(h.min) + " ~ " + won(h.max) + "</dd></div>" +
        "<div><dt>종합 평가</dt><dd>" + esc(h.verdict) + "</dd></div></dl></article>";
    }).join("");

    /* price range chart (floating bars, ₩80k~220k) */
    var lo = 80000, hi = 220000, W = 680, L = 150, R = 20, rowH = 36, top = 8;
    var sx = function (v) { return L + (v - lo) / (hi - lo) * (W - L - R); };
    var H = top + T.hotels.length * rowH + 26;
    var svg = '<svg viewBox="0 0 ' + W + " " + H + '" role="img" aria-label="호텔 1박 예상 요금 범위">';
    for (var v = lo; v <= hi; v += 20000) {
      svg += '<line class="gl" x1="' + sx(v) + '" x2="' + sx(v) + '" y1="' + top + '" y2="' + (H - 22) + '"/>';
      svg += '<text x="' + sx(v) + '" y="' + (H - 6) + '" text-anchor="middle">' + v / 1000 + "k</text>";
    }
    T.hotels.forEach(function (h, i) {
      var y = top + i * rowH + 8;
      svg += '<text class="lbl" x="0" y="' + (y + 14) + '">' + esc(h.name.replace("더 웨스틴 ", "웨스틴 ").replace("포 포인츠 바이 ", "포 포인츠 ")) + "</text>";
      svg += '<rect class="bar' + (h.pick ? " pick" : "") + '" x="' + sx(h.min) + '" y="' + y + '" width="' + (sx(h.max) - sx(h.min)) + '" height="20" rx="3"><title>' + esc(h.name) + ": " + won(h.min) + " ~ " + won(h.max) + "</title></rect>";
      svg += '<text class="val" x="' + (sx(h.max) + 6) + '" y="' + (y + 14) + '" style="font-size:10.5px">' + h.min / 1000 + "–" + h.max / 1000 + "k</text>";
    });
    svg += "</svg>";
    $("#priceChart").innerHTML = "<h4>1박 예상 요금 범위 비교</h4><p>단위: 천원(₩k) · 시트 기재 예상 요금 기준 · 녹색 = 예정 숙소 (후보 1)</p><div style=\"overflow-x:auto\">" + svg + "</div>";
  }

  /* ---------- Site ---------- */
  function siteLinks() {
    var s = T.site;
    return {
      g: "https://www.google.com/maps/search/?api=1&query=" + s.lat + "," + s.lng,
      a: "https://uri.amap.com/marker?position=" + s.lng + "," + s.lat + "&name=" + encodeURIComponent("APSSE " + s.addressCn) + "&coordinate=wgs84&callnative=1"
    };
  }
  function renderSite() {
    var s = T.site, l = siteLinks();
    $("#siteInfo").innerHTML =
      '<div class="hd"><b>' + s.name + "</b><span>" + esc(s.full) + "</span></div>" +
      '<dl class="kv">' +
        "<div><dt>상세 주소</dt><dd>" + esc(s.address) + '<br><span class="muted">' + s.addressCn + "</span></dd></div>" +
        '<div><dt>Plus Code</dt><dd><span class="mono">' + s.plus + '</span><button class="copy-btn" data-copy="' + s.plus + '">복사</button></dd></div>' +
        '<div><dt>좌표 (WGS84)</dt><dd><span class="mono">' + esc(s.dms) + '</span><br><span class="mono muted small">' + s.lat + ", " + s.lng + '</span><button class="copy-btn" data-copy="' + s.lat + "," + s.lng + '">복사</button></dd></div>' +
        '<div><dt>지도 바로가기</dt><dd><div class="links"><a class="chip-link" target="_blank" rel="noopener" href="' + l.g + '">' + ICON.ext + 'Google 지도</a><a class="chip-link" target="_blank" rel="noopener" href="' + l.a + '">' + ICON.ext + 'Amap 高德</a></div>' +
        '<span class="small muted">중국 현지에서는 Google 지도 접속 불가, Amap 사용 권장</span></dd></div>' +
        '<div><dt>현장 조직도</dt><dd><div class="links"><a class="chip-link" href="#org" data-jump="org">조직도 · 연락처 보기 ↓</a></div></dd></div>' +
      "</dl>";
    $("#routeCard").innerHTML = "<h4>허페이 → 조선소 이동 경로</h4>" +
      '<ol class="route-steps">' + s.route.map(function (r, i) { return '<li><span class="dot">' + (i + 1) + "</span><span>" + esc(r) + "</span></li>"; }).join("") + "</ol>" +
      '<div class="route-time">Day 2 · 08:30 출발 → 11:00 도착 · ' + s.routeTime + "</div>" +
      '<div class="flex-note">일정 유동성: ' + esc(s.flex) + "</div>";
  }

  /* ---------- Checklist ---------- */
  var CK = "apsse-check-v1";
  function loadChecks() {
    var raw = store.get(CK);
    if (raw) { try { return JSON.parse(raw); } catch (e) {} }
    var o = {}; T.checklist.forEach(function (c) { o[c.id] = c.status === "준비완료"; }); return o;
  }
  var checks = loadChecks();
  function renderChecks() {
    $("#checks").innerHTML = T.checklist.map(function (c) {
      var ok = c.status === "준비완료";
      return '<li><label class="card chk' + (checks[c.id] ? " done" : "") + '" for="' + c.id + '"><input type="checkbox" id="' + c.id + '"' + (checks[c.id] ? " checked" : "") + ">" +
        '<div><div class="top-row"><span class="cat">[' + c.cat + "]</span><b>" + esc(c.name) + '</b><span class="badge ' + (ok ? "ok" : "warn") + '" title="원본 시트 상태">' + c.status + "</span></div>" +
        "<p>" + esc(c.detail) + "</p></div></label></li>";
    }).join("");
    updateProgress();
  }
  function updateProgress() {
    var n = T.checklist.length, d = T.checklist.filter(function (c) { return checks[c.id]; }).length;
    $("#ckCnt").textContent = d + " / " + n;
    $("#ckBar").style.width = (d / n * 100) + "%";
  }

  /* ---------- Emergency & footnotes ---------- */
  function renderEmergency() {
    var e = T.emergency;
    $("#emg").innerHTML =
      '<div class="card"><span class="k">' + esc(e.consulate.name) + fn(e.consulate.fn) + '</span><span class="tel">' + e.consulate.tel + "</span>" +
      '<div class="actions"><a class="btn primary" href="tel:' + e.consulate.tel.replace(/-/g, "") + '">전화 걸기</a><button class="btn" data-copy="' + e.consulate.tel + '">번호 복사</button></div>' +
      '<span class="small muted">출국 전 휴대폰 연락처 사전 등록 필수</span></div>' +
      '<div class="card"><span class="k">현지 접견 의전 담당자 핫라인</span><b>' + esc(e.local.name) + '</b><span class="small muted">' + esc(e.local.role) + '</span><span class="tel">' + e.local.tel + "</span>" +
      '<div class="actions"><a class="btn primary" href="tel:' + e.local.tel.replace(/-/g, "") + '">전화 걸기</a><button class="btn" data-copy="' + e.local.tel + '">번호 복사</button>' +
      '<a class="btn" href="#org" data-jump="org">조직도 보기</a></div></div>' +
      '<div class="card warn-card"><span class="k">일정 탄력 운영 가이드</span><span class="small">' + esc(e.swap) + "</span></div>";
    $("#footnotes").innerHTML = '<ol>' + T.sources.slice().sort(function (a, b) { return a.n - b.n; }).map(function (s) {
      return '<li id="fn' + s.n + '">' + esc(s.t) + ' — <a href="' + s.u + '" target="_blank" rel="noopener">' + esc(s.u) + "</a></li>";
    }).join("") + "</ol>";
    $("#rev").textContent = "Rev. " + T.revision + " · 데이터 기준일 " + T.updated;
    $("#srcCount").textContent = T.sources.length + "건 · 눌러서 펼치기";
  }

  /* ---------- Utilities ---------- */
  function toast(msg) {
    var t = $("#toast") || document.body.appendChild(Object.assign(document.createElement("div"), { id: "toast" }));
    t.textContent = msg; t.hidden = false;
    clearTimeout(toast._t); toast._t = setTimeout(function () { t.hidden = true; }, 1600);
  }
  function copy(text) {
    var done = function () { toast("복사됨: " + text); };
    var fallback = function () {
      var ta = document.createElement("textarea"); ta.value = text; ta.style.position = "fixed"; ta.style.opacity = "0";
      document.body.appendChild(ta); ta.select();
      try { document.execCommand("copy"); done(); } catch (e) { toast("길게 눌러 직접 복사 필요"); }
      ta.remove();
    };
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(done, fallback); else fallback();
  }
  /* ---------- Tab pages ---------- */
  var PAGES = ["overview", "flight", "schedule", "hotel", "site", "org", "check"];
  var PLABEL = { overview: "개요", flight: "항공", schedule: "일정", hotel: "숙소", site: "조선소", org: "조직도", check: "기타 (점검 · 비상)" };
  var curPage = null, pageScroll = {};
  var reduceMotion = !!(window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches);
  function showPage(id, dir, keepScroll) {
    if (PAGES.indexOf(id) < 0) id = PAGES[0];
    var changed = id !== curPage;
    if (changed && curPage) pageScroll[curPage] = window.scrollY; /* 떠나는 탭의 스크롤 위치 기억 */
    if (changed) hideGtip();
    curPage = id;
    $$("main > .page").forEach(function (s) {
      var on = s.getAttribute("data-page") === id;
      s.hidden = !on;
      s.classList.remove("in-l", "in-r");
      if (on && changed && dir && !reduceMotion) { void s.offsetWidth; s.classList.add(dir > 0 ? "in-r" : "in-l"); }
    });
    $$("[data-nav]").forEach(function (a) {
      var on = a.getAttribute("data-nav") === id;
      a.classList.toggle("on", on);
      if (on) a.setAttribute("aria-current", "page"); else a.removeAttribute("aria-current");
    });
    var act = $("#tabstrip .on");
    if (act && act.scrollIntoView) { var strip = $("#tabstrip"); strip.scrollTo({ left: act.offsetLeft - strip.clientWidth / 2 + act.clientWidth / 2, behavior: reduceMotion ? "auto" : "smooth" }); }
    renderPager();
    try { history.replaceState(null, "", "#" + id); } catch (e) {}
    store.set("apsse-page", id);
    /* 탭별 마지막 위치로 즉시 복원 (처음 여는 탭은 맨 위) — 부드러운 스크롤로 위로 끌려 올라가는 현상 방지 */
    if (changed && !keepScroll) {
      var y = pageScroll[id] || 0;
      var maxY = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
      window.scrollTo({ top: Math.min(y, maxY), left: 0, behavior: "instant" });
    }
  }
  function stepPage(d) {
    var i = PAGES.indexOf(curPage) + d;
    if (i < 0 || i >= PAGES.length) return;
    showPage(PAGES[i], d);
  }
  function renderPager() {
    var i = PAGES.indexOf(curPage), p = PAGES[i - 1], n = PAGES[i + 1];
    $("#pager").innerHTML =
      (p ? '<button type="button" class="pg prev" data-step="-1"><small>← 이전</small><b>' + PLABEL[p] + "</b></button>" : "<span></span>") +
      '<span class="pg-dots">' + PAGES.map(function (x) { return '<i class="' + (x === curPage ? "on" : "") + '"></i>'; }).join("") + "</span>" +
      (n ? '<button type="button" class="pg next" data-step="1"><small>다음 →</small><b>' + PLABEL[n] + "</b></button>" : "<span></span>");
  }
  /* 탭 이름이면 탭 전환, 그 외 요소면 해당 요소가 속한 탭으로 전환 후 위치로 이동 */
  function jump(id) {
    if (PAGES.indexOf(id) > -1) { showPage(id, PAGES.indexOf(id) - PAGES.indexOf(curPage)); return; }
    var el = document.getElementById(id); if (!el) return;
    var pg = el.closest(".page");
    if (pg) showPage(pg.getAttribute("data-page"), 0, true);
    var d = el.closest("details"); if (d) d.open = true;
    if (el.tagName === "DETAILS") el.open = true;
    setTimeout(function () { el.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" }); }, 30);
  }
  /* 좌우 스와이프 → 탭 전환 (가로 스크롤 영역 · 입력창 · 메뉴 열림 상태 제외) */
  function setupSwipe() {
    var sx = 0, sy = 0, st = 0, ok = false;
    var main = $("main");
    main.addEventListener("touchstart", function (e) {
      if (e.touches.length !== 1) { ok = false; return; }
      var t = e.target;
      ok = !t.closest("input, textarea, select, .gantt-wrap, .price-chart, .tabstrip, [data-noswipe]") && !$("#drawer").classList.contains("open");
      if (ok) {
        var sc = t.closest(".ctable-wrap");
        if (sc && sc.scrollWidth > sc.clientWidth) ok = false;
      }
      sx = e.touches[0].clientX; sy = e.touches[0].clientY; st = Date.now();
    }, { passive: true });
    main.addEventListener("touchend", function (e) {
      if (!ok) return; ok = false;
      var dx = e.changedTouches[0].clientX - sx, dy = e.changedTouches[0].clientY - sy;
      if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.6 && Date.now() - st < 800) stepPage(dx < 0 ? 1 : -1);
    }, { passive: true });
    document.addEventListener("keydown", function (e) {
      if (e.target.closest && e.target.closest("input, textarea, select")) return;
      if (e.altKey || e.ctrlKey || e.metaKey) return;
      if (e.key === "ArrowRight") stepPage(1); else if (e.key === "ArrowLeft") stepPage(-1);
    });
    $("#pager").addEventListener("click", function (e) { var b = e.target.closest("[data-step]"); if (b) stepPage(+b.getAttribute("data-step")); });
    window.addEventListener("hashchange", function () {
      var h = location.hash.replace("#", "");
      if (h && h !== curPage) jump(h);
    });
  }
  function spy() {
    var tt = $("#toTop"); if (tt) tt.hidden = window.scrollY < 600;
  }

  /* ---------- Hamburger drawer ---------- */
  function setupMenu() {
    var drawer = $("#drawer"), scrim = $("#scrim"), btn = $("#menuBtn");
    var open = function () {
      scrim.hidden = false; drawer.classList.add("open"); drawer.setAttribute("aria-hidden", "false");
      btn.setAttribute("aria-expanded", "true"); document.body.classList.add("lock");
      setTimeout(function () { var f = $("#menuClose"); f && f.focus(); }, 50);
    };
    var close = function (refocus) {
      scrim.hidden = true; drawer.classList.remove("open"); drawer.setAttribute("aria-hidden", "true");
      btn.setAttribute("aria-expanded", "false"); document.body.classList.remove("lock");
      if (refocus) btn.focus();
    };
    btn.addEventListener("click", open);
    $("#menuClose").addEventListener("click", function () { close(true); });
    scrim.addEventListener("click", function () { close(false); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && drawer.classList.contains("open")) close(true); });
    drawer.addEventListener("click", function (e) {
      var d = e.target.closest("[data-goday]");
      if (d) {
        curDay = d.getAttribute("data-goday"); store.set("apsse-day", curDay); renderDay();
        close(false); jump("schedule"); return;
      }
      if (e.target.closest("[data-jump]")) close(false);
    });
    $("#toTop").addEventListener("click", function () { window.scrollTo({ top: 0, behavior: "smooth" }); });
  }

  /* ---------- Org chart ---------- */
  function cnTel(t) { var d = String(t).replace(/[^\d+]/g, ""); return d.charAt(0) === "+" ? d : "+86" + d; }
  function telHTML(t) { return t ? '<a href="tel:' + cnTel(t) + '">' + esc(t) + "</a>" : ""; }
  function renderOrg() {
    var O = T.org; if (!O) return;
    var all = [], total = 0;
    O.centers.forEach(function (c) { c.sum = 0; c.depts.forEach(function (d) { d.c = c.c; c.sum += d.n; total += d.n; all.push(d); }); });
    var top = all.slice().sort(function (a, b) { return b.n - a.n; })[0];
    $("#orgAsOf").innerHTML = "조선소 제공 조직도 " + O.asOf + " 개정본 기준" + fn(7);
    $("#orgKpis").innerHTML = [
      ["총 인원 (약)", total + "명", "부서 인원 합계 · 개략치"],
      ["센터", O.centers.length + "개", O.centers.map(function (c) { return c.ko.replace("센터", ""); }).join(" · ")],
      ["부서 / 작업장", all.length + "개", "생산기술센터 " + O.centers[3].depts.length + "개 최다"],
      ["최대 부서", top.ko, "약 " + top.n + "명 · 전체의 " + Math.round(top.n / total * 100) + "%"]
    ].map(function (k) {
      return '<div class="card kpi"><div class="k">' + k[0] + '</div><div class="v">' + esc(k[1]) + '</div><div class="s">' + esc(k[2]) + "</div></div>";
    }).join("");

    var node = function (e, cls, extra) {
      return '<div class="onode ' + (cls || "") + '"><div class="t">' + esc(e.ko) + '</div><div class="zh">' + e.zh + "</div>" +
        (e.name ? '<div class="who">' + esc(e.name) + "</div>" : "") + (e.tel ? '<div class="tel">' + esc(e.tel) + "</div>" : "") + (extra || "") + "</div>";
    };
    $("#orgTree").innerHTML =
      node(O.chair, "exec") + '<div class="vl"></div>' +
      '<div class="mgmt"><div class="gm">' + node(O.gm, "exec") + '</div><div class="side"><span class="hl"></span>' +
        node(O.dgm, "", '<span class="host">' + esc(O.dgm.note) + "</span>") + "</div></div>" +
      '<div class="vl"></div>' +
      '<div class="centers">' + O.centers.map(function (c) {
        return '<div class="center oc' + c.c + '"><div class="chead"><b>' + esc(c.ko) + "</b><span>" + c.zh + " · 약 " + c.sum + "명 · " + c.depts.length + "개 부서</span></div>" +
          '<ul class="depts">' + c.depts.map(function (d) {
            var rows = [["부서장", esc(d.head)], ["연락처", '<span class="mono">' + telHTML(d.tel) + "</span>"]];
            if (d.pm) rows.push(["프로젝트", esc(d.pm)], ["PM 연락처", '<span class="mono">' + telHTML(d.pmTel) + "</span>"]);
            if (d.mail) rows.push(["이메일", esc(d.mail)]);
            return '<li><details class="dept"><summary><span class="dn">' + esc(d.ko) + "<small>" + d.zh + '</small></span><span class="dh">' + esc(d.head) + '</span><span class="pill">약 ' + d.n + "명</span></summary>" +
              "<dl>" + rows.map(function (r) { return "<div><dt>" + r[0] + "</dt><dd>" + r[1] + "</dd></div>"; }).join("") + "</dl></details></li>";
          }).join("") + "</ul></div>";
      }).join("") + "</div>" +
      '<div class="org-legend">부서 카드를 누르면 부서장 · 프로젝트 담당 · 연락처 표시</div>';

    /* 부서별 인원 막대 (0~40명 스케일) */
    var mx = 40;
    $("#orgBar").innerHTML = "<h4>부서별 인원</h4><div class=\"cap\">단위: 명(약) · 색상 = 소속 센터</div>" +
      '<div class="hbars">' + all.slice().sort(function (a, b) { return b.n - a.n; }).map(function (d) {
        return '<div class="hbar oc' + d.c + '"><span class="lb">' + esc(d.ko) + '</span><div class="tr"><div class="fl" style="width:' + (d.n / mx * 100) + '%"></div></div><span class="vv">' + d.n + "</span></div>";
      }).join("") + '</div><div class="haxis"><span></span><div class="ticks"><span>0</span><span>10</span><span>20</span><span>30</span><span>40</span></div><span></span></div>';

    $("#orgShare").innerHTML = "<h4>센터별 인원 비중</h4><div class=\"cap\">총 약 " + total + "명 기준</div>" +
      '<div class="stack" role="img" aria-label="센터별 인원 비중">' + O.centers.map(function (c) {
        var p = c.sum / total * 100;
        return '<span class="oc' + c.c + '" style="width:' + p + '%" title="' + esc(c.ko) + " " + c.sum + '명">' + (p >= 9 ? Math.round(p) + "%" : "") + "</span>";
      }).join("") + "</div>" +
      '<ul class="share-list">' + O.centers.map(function (c) {
        return '<li class="oc' + c.c + '"><i></i><span>' + esc(c.ko) + "</span><b>" + c.sum + "명</b><em>" + (c.sum / total * 100).toFixed(1) + "%</em></li>";
      }).join("") + "</ul>";

    /* 연락처 표 */
    var rows = [
      { c: 0, ko: O.gm.ko, zh: O.gm.zh, head: O.gm.name, tel: O.gm.tel, mail: O.gm.mail },
      { c: 0, ko: O.dgm.ko, zh: O.dgm.zh, head: O.dgm.name, tel: O.dgm.tel, mail: O.dgm.mail, hl: true }
    ];
    O.centers.forEach(function (c) { c.depts.forEach(function (d) {
      rows.push(d);
      if (d.zh === "生产部") rows.push({ c: 4, ko: O.pm.ko, zh: O.pm.zh, head: O.pm.name, tel: O.pm.tel, mail: O.pm.mail, pmNote: true });
    }); });
    var td = function (l, v, cls) { return '<td data-l="' + l + '" class="' + (v ? (cls || "") : "empty") + '">' + (v || "–") + "</td>"; };
    $("#orgTable").innerHTML = "<thead><tr><th>조직</th><th>담당자</th><th>연락처</th><th>프로젝트 담당</th><th>연락처</th><th>이메일</th></tr></thead><tbody>" +
      rows.map(function (r) {
        var key = [r.ko, r.zh, r.head, r.tel, r.pm, r.pmTel, r.mail].join(" ").toLowerCase();
        return '<tr class="oc' + (r.c || 1) + (r.hl ? " hl" : "") + '" data-k="' + esc(key) + '">' +
          '<td class="org-cell"><i' + (r.c ? "" : ' style="background:var(--fg)"') + "></i>" + esc(r.ko) + (r.pmNote ? fn(7) : "") + "<small>" + r.zh + "</small></td>" +
          td("담당자", esc(r.head)) + td("연락처", telHTML(r.tel), "ph") +
          td("프로젝트 담당", r.pm ? esc(r.pm) : "") + td("PM 연락처", r.pmTel ? telHTML(r.pmTel) : "", "ph") +
          td("이메일", r.mail ? esc(r.mail) : "", "wide") + "</tr>";
      }).join("") + "</tbody>";
    $("#orgNotes").innerHTML = O.notes.map(function (n) { return "<li>" + esc(n) + "</li>"; }).join("") +
      "<li>" + esc(O.pm.note) + "</li><li>전화번호를 누르면 중국 국가번호(+86)를 붙여 발신됨.</li>";

    $("#orgSearch").addEventListener("input", function () {
      var q = this.value.trim().toLowerCase(), n = 0;
      $$("#orgTable tbody tr").forEach(function (tr) { var on = !q || tr.getAttribute("data-k").indexOf(q) > -1; tr.hidden = !on; if (on) n++; });
      $("#orgEmpty").hidden = n > 0;
    });
  }

  /* ---------- PWA: service worker · 설치 · 네트워크 상태 ---------- */
  function setupPWA() {
    var standalone = (window.matchMedia && matchMedia("(display-mode: standalone)").matches) || window.navigator.standalone === true;
    if ("serviceWorker" in navigator && (location.protocol === "https:" || location.hostname === "localhost")) {
      try {
        navigator.serviceWorker.register("sw.js").catch(function () {});
      } catch (e) {}
    }
    var btn = $("#installBtn"), deferred = null;
    window.addEventListener("beforeinstallprompt", function (e) {
      e.preventDefault(); deferred = e;
      if (!standalone) btn.hidden = false;
    });
    btn.addEventListener("click", function () {
      if (!deferred) return;
      deferred.prompt();
      deferred.userChoice.then(function (r) {
        if (r.outcome === "accepted") toast("앱 설치 진행됨");
        deferred = null; btn.hidden = true;
      });
    });
    window.addEventListener("appinstalled", function () { btn.hidden = true; toast("홈 화면에 설치 완료"); });

    /* iOS Safari: 설치 버튼 이벤트가 없어 안내 카드 표시 */
    var ua = navigator.userAgent || "";
    var isIOS = /iPhone|iPad|iPod/.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
    var isSafari = /Safari/.test(ua) && !/CriOS|FxiOS|EdgiOS/.test(ua);
    if (isIOS && isSafari && !standalone && !store.get("apsse-ioshint") && location.protocol === "https:") {
      $("#iosHint").hidden = false;
    }
    $("#iosHintClose").addEventListener("click", function () { $("#iosHint").hidden = true; store.set("apsse-ioshint", "1"); });

    var net = function () {
      var r = $("#rev"); if (!r) return;
      var tag = $("#netState");
      if (!navigator.onLine) {
        if (!tag) { tag = document.createElement("span"); tag.id = "netState"; tag.className = "net-state"; r.after(tag); }
        tag.textContent = "오프라인 · 저장된 정보 표시 중";
      } else if (tag) tag.remove();
    };
    window.addEventListener("online", function () { net(); toast("온라인 연결됨"); });
    window.addEventListener("offline", function () { net(); toast("오프라인 · 저장된 정보로 표시"); });
    net();
  }

  /* ---------- Boot ---------- */
  function boot() {
    renderHero(); tickHero();
    renderFlights();
    var auto = autoDay(); if (auto) curDay = auto;
    renderDayTabs(); renderDay();
    renderHotels(); renderSite(); renderChecks(); renderEmergency();
    applyTheme(theme);
    renderOrg(); setupMenu();
    setupPWA();

    $("#themeBtn").addEventListener("click", function () {
      theme = isDark(theme) ? "light" : "dark";
      store.set("apsse-theme", theme); applyTheme(theme);
    });
    $("#dayTabs").addEventListener("click", function (e) {
      var b = e.target.closest(".day-tab"); if (!b) return;
      curDay = b.getAttribute("data-day"); store.set("apsse-day", curDay); renderDay();
    });
    $("#checks").addEventListener("change", function (e) {
      if (e.target.type !== "checkbox") return;
      checks[e.target.id] = e.target.checked; store.set(CK, JSON.stringify(checks));
      e.target.closest(".chk").classList.toggle("done", e.target.checked); updateProgress();
    });
    $("#ckReset").addEventListener("click", function () {
      try { localStorage.removeItem(CK); } catch (err) {}
      checks = loadChecks(); renderChecks(); toast("시트 기준 상태로 초기화됨");
    });
    document.addEventListener("click", function (e) {
      var c = e.target.closest("[data-copy]"); if (c) { e.preventDefault(); copy(c.getAttribute("data-copy")); return; }
      var j = e.target.closest("[data-jump]"); if (j) { e.preventDefault(); jump(j.getAttribute("data-jump")); }
    });
    window.addEventListener("scroll", spy, { passive: true }); spy();
    setupSwipe();
    document.addEventListener("click", function () { if (gtipPinned) hideGtip(); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && gtipPinned) hideGtip(); });
    window.addEventListener("scroll", function () { var t = $("#gtip"); if (t && !t.hidden) hideGtip(); }, { passive: true });
    window.addEventListener("resize", hideGtip);
    var h0 = location.hash.replace("#", "");
    if (PAGES.indexOf(h0) > -1) showPage(h0, 0, true);
    else if (h0 && document.getElementById(h0)) { showPage(PAGES[0]); jump(h0); }
    else showPage(store.get("apsse-page") || "overview", 0, true);
    if (window.matchMedia) {
      var mq = matchMedia("(prefers-color-scheme: dark)");
      (mq.addEventListener ? mq.addEventListener.bind(mq, "change") : mq.addListener.bind(mq))(function () { applyTheme(null); });
    }
    /* 외부(미리보기 화면 등)에서 테마 속성을 바꾸면 버튼 표시만 동기화 */
    if (window.MutationObserver) {
      new MutationObserver(function () { applyTheme(null); }).observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    }
    setInterval(function () { tickHero(); markNow(); }, 30000);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot); else boot();
})();
