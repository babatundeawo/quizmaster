// QuizMaster service worker: keeps a copy of the app for offline use
const CACHE_NAME = "quizmaster-v1";

const FILES_TO_CACHE = [
  "./",
  "index.html",
  "manifest.json",
  "css/style.css",
  "js/app.js",
  "js/questions.js",
  "js/firebase-config.js",
  "assets/images/icons/icon-192.png",
  "assets/images/icons/icon-512.png"
];

async function saveFiles() {
  const cache = await caches.open(CACHE_NAME);
  await cache.addAll(FILES_TO_CACHE);
}

async function removeOldCaches() {
  const names = await caches.keys();
  for (let i = 0; i < names.length; i++) {
    if (names[i] !== CACHE_NAME) {
      await caches.delete(names[i]);
    }
  }
}

self.addEventListener("install", function (event) {
  event.waitUntil(saveFiles());
  self.skipWaiting();
});

self.addEventListener("activate", function (event) {
  event.waitUntil(removeOldCaches());
  self.clients.claim();
});

async function internetFirst(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    const saved = await caches.match(request);
    if (saved) {
      return saved;
    }
    return new Response("You are offline.", { status: 503 });
  }
}

self.addEventListener("fetch", function (event) {
  const request = event.request;
  if (request.method !== "GET") {
    return;
  }

  const url = new URL(request.url);
  const isOurFile = url.origin === self.location.origin;
  const isFirebaseScript =
    url.hostname === "www.gstatic.com" && url.pathname.startsWith("/firebasejs/");

  if (!isOurFile && !isFirebaseScript) {
    return; // leave all other requests (like the database) alone
  }

  event.respondWith(internetFirst(request));
});
