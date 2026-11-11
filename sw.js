/* APSSE Trip — Service Worker
   - 앱 셸 사전 캐시 → 중국 현지 등 오프라인 / 불안정 네트워크에서도 열람 가능
   - 페이지 · data.js: 네트워크 우선(3초 제한) → 실패 시 캐시
   - 그 외 정적 파일: 캐시 우선 + 백그라운드 갱신
   배포 시 데이터나 파일을 바꾸면 VERSION 값을 올릴 것 */
var VERSION = "apsse-trip-v9";
var SHELL = [
  "./",
  "./index.html",
  "./styles.css",
  "./data.js",
  "./app.js",
  "./manifest.json",
  "./icons/icon.svg",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/icon-maskable-512.png",
  "./icons/apple-touch-icon.png",
  "./icons/favicon-32.png",
  "./images/hotel-shangrila.jpg",
  "./images/apsse-aerial.jpg",
  "./images/apsse-gantry.jpg"
];

self.addEventListener("install", function (e) {
  e.waitUntil(caches.open(VERSION).then(function (c) { return c.addAll(SHELL); }).then(function () { return self.skipWaiting(); }));
});

self.addEventListener("activate", function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.filter(function (k) { return k !== VERSION; }).map(function (k) { return caches.delete(k); }));
    }).then(function () { return self.clients.claim(); })
  );
});

function networkFirst(req) {
  return new Promise(function (resolve) {
    var done = false;
    var fromCache = function () {
      return caches.match(req, { ignoreSearch: true }).then(function (r) { return r || caches.match("./index.html"); });
    };
    var timer = setTimeout(function () {
      fromCache().then(function (r) { if (!done && r) { done = true; resolve(r); } });
    }, 3000);
    fetch(req).then(function (res) {
      if (res && res.ok) {
        var copy = res.clone();
        caches.open(VERSION).then(function (c) { c.put(req, copy); });
      }
      if (!done) { done = true; clearTimeout(timer); resolve(res); }
    }).catch(function () {
      clearTimeout(timer);
      fromCache().then(function (r) { if (!done) { done = true; resolve(r || Response.error()); } });
    });
  });
}

function cacheFirst(req) {
  return caches.match(req, { ignoreSearch: true }).then(function (hit) {
    var net = fetch(req).then(function (res) {
      if (res && res.ok) { var copy = res.clone(); caches.open(VERSION).then(function (c) { c.put(req, copy); }); }
      return res;
    }).catch(function () { return hit; });
    return hit || net;
  });
}

self.addEventListener("fetch", function (e) {
  var req = e.request;
  if (req.method !== "GET") return;
  var url = new URL(req.url);
  if (url.origin !== self.location.origin) return; /* 외부 링크(지도 등)는 관여하지 않음 */
  if (req.mode === "navigate" || /\/data\.js$/.test(url.pathname)) { e.respondWith(networkFirst(req)); return; }
  e.respondWith(cacheFirst(req));
});
