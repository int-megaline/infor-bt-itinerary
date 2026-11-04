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
  var THEMES = ["system", "light", "dark"];
  var TLABEL = { system: "시스템", light: "라이트", dark: "다크" };
  function applyTheme(t) {
    var r = document.documentElement;
    if (t === "system") r.removeAttribute("data-theme"); else r.setAttribute("data-theme", t);
    var b = $("#themeBtn");
    if (b) {
      var dark = t === "dark" || (t === "system" && window.matchMedia && matchMedia("(prefers-color-scheme: dark)").matches);
      b.innerHTML = (dark
        ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 14.5A8 8 0 0 1 9.5 4 8 8 0 1 0 20 14.5z"/></svg>'
        : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>')
        + "<span>" + TLABEL[t] + "</span>";
      b.setAttribute("aria-label", "테마 전환 (현재: " + TLABEL[t] + ")");
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
        d: d.toLocaleDateString("ko-KR", { timeZone: tz, month: "long", day: "numeric", weekday: "short" })
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
    var svg = '<svg viewBox="0 0 ' + W + ' 64" role="img" aria-label="' + esc(day.label) + ' 시간대별 일정 막대">';
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
      var it = day.items[+el.getAttribute("data-i")];
      var show = function (e) {
        var tip = $("#gtip") || document.body.appendChild(Object.assign(document.createElement("div"), { id: "gtip" }));
        tip.hidden = false;
        tip.innerHTML = "<b>" + esc(it.t) + "</b> · " + esc(it.tag) + "<br>" + esc(it.place);
        var r = el.getBoundingClientRect();
        var x = Math.min(Math.max(8, r.left + r.width / 2 - 120), window.innerWidth - 268);
        tip.style.left = x + "px"; tip.style.top = Math.max(8, r.top - tip.offsetHeight - 8) + "px";
      };
      var hide = function () { var t = $("#gtip"); if (t) t.hidden = true; };
      el.addEventListener("mouseenter", show); el.addEventListener("focus", show);
      el.addEventListener("mouseleave", hide); el.addEventListener("blur", hide);
      el.addEventListener("click", function () {
        var target = $("#ev-" + day.id + "-" + el.getAttribute("data-i"));
        if (target) { target.scrollIntoView({ behavior: "smooth", block: "center" }); target.querySelector("details") && (target.querySelector("details").open = true); }
      });
    });
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
      '<div class="main"><div class="label">Confirmed · 숙소 확정 (2박)</div><h3>' + esc(p.name) + fn(p.fn) + '</h3><div class="en">' + esc(p.en) + "</div>" +
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
    $("#priceChart").innerHTML = "<h4>1박 예상 요금 범위 비교</h4><p>단위: 천원(₩k) · 시트 기재 예상 요금 기준 · 녹색 = 확정 숙소</p><div style=\"overflow-x:auto\">" + svg + "</div>";
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
      '<div class="card"><span class="k">현지 접견 의전 담당자</span><b>핫라인 확보 필요</b><span class="small muted">' + esc(e.local) + "</span></div>" +
      '<div class="card warn-card"><span class="k">일정 탄력 운영 가이드</span><span class="small">' + esc(e.swap) + "</span></div>";
    $("#footnotes").innerHTML = '<ol>' + T.sources.map(function (s) {
      return '<li id="fn' + s.n + '">' + esc(s.t) + ' — <a href="' + s.u + '" target="_blank" rel="noopener">' + esc(s.u) + "</a></li>";
    }).join("") + "</ol>";
    $("#rev").textContent = "Rev. " + T.revision + " · 데이터 기준일 " + T.updated;
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
  function jump(id) {
    var el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  /* ---------- Nav spy ---------- */
  function spy() {
    var ids = ["overview", "flight", "schedule", "hotel", "site", "check"];
    var cur = ids[0], y = window.innerHeight * 0.3;
    ids.forEach(function (id) { var el = document.getElementById(id); if (el && el.getBoundingClientRect().top < y) cur = id; });
    $$("[data-nav]").forEach(function (a) { a.classList.toggle("on", a.getAttribute("data-nav") === cur); });
  }

  /* ---------- Boot ---------- */
  function boot() {
    renderHero(); tickHero();
    renderFlights();
    var auto = autoDay(); if (auto) curDay = auto;
    renderDayTabs(); renderDay();
    renderHotels(); renderSite(); renderChecks(); renderEmergency();
    applyTheme(theme);

    $("#themeBtn").addEventListener("click", function () {
      theme = THEMES[(THEMES.indexOf(theme) + 1) % THEMES.length];
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
    if (window.matchMedia) {
      var mq = matchMedia("(prefers-color-scheme: dark)");
      (mq.addEventListener ? mq.addEventListener.bind(mq, "change") : mq.addListener.bind(mq))(function () { applyTheme(theme); });
    }
    setInterval(function () { tickHero(); markNow(); }, 30000);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot); else boot();
})();
