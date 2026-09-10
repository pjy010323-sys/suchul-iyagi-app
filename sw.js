// 수출이야기 PWA 서비스워커 (2026-09-10 추가)
// 목적: 홈 화면 추가(설치) 가능하게 하고, 오프라인/전파 약할 때 최소한 앱 껍데기가 뜨게 함.
// 데이터(Supabase)는 항상 네트워크 우선 -- 캐시는 어디까지나 오프라인 대비 백업일 뿐,
// 절대 최신 데이터보다 우선하지 않음.
var CACHE_NAME = 'suchul-iyagi-shell-v1';
var APP_SHELL = ['./', './index.html', './manifest.json', './icon-192.png', './icon-512.png'];

self.addEventListener('install', function (e) {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE_NAME).then(function (c) { return c.addAll(APP_SHELL); }).catch(function () {})
  );
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.filter(function (k) { return k !== CACHE_NAME; }).map(function (k) { return caches.delete(k); }));
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', function (e) {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request).then(function (res) {
      var resClone = res.clone();
      caches.open(CACHE_NAME).then(function (c) { c.put(e.request, resClone); }).catch(function () {});
      return res;
    }).catch(function () {
      return caches.match(e.request).then(function (cached) {
        return cached || Promise.reject('no-cache-and-offline');
      });
    })
  );
});
