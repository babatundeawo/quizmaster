// QuizMaster service worker: keeps a copy of the app so it opens without internet.
// Strategy: try the network first (so updates show up), fall back to the saved copy.
const CACHE_NAME = "quizmaster-v4";

const FILES_TO_CACHE = [
  "./",
  "index.html",
  "privacy.html",
  "manifest.json",
  "css/tokens.css",
  "css/style.css",
  "js/theme-init.js",
  "js/effects.js",
  "js/app.js",
  "js/periods.js",
  "js/questions.js",
  "js/static-page.js",
  "js/firebase-config.js",
  "js/firebase-env.js",
  "assets/images/icons/favicon.svg",
  "assets/images/icons/favicon-32.png",
  "assets/images/icons/apple-touch-icon.png",
  "assets/images/icons/icon-192.png",
  "assets/images/icons/icon-512.png"
];

// Hosts whose files we also keep: the Firebase scripts and the fonts
const EXTRA_HOSTS = [
  { host: "www.gstatic.com", prefix: "/firebasejs/" },
  { host: "fonts.googleapis.com", prefix: "/" },
  { host: "fonts.gstatic.com", prefix: "/" }
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

function offlinePage() {
  const home = self.registration.scope;
  const html =
    '<!DOCTYPE html><html lang="en"><head><meta charset="utf-8">' +
    '<meta name="viewport" content="width=device-width, initial-scale=1">' +
    "<title>Offline | QuizMaster</title></head>" +
    '<body style="font-family:system-ui,sans-serif;text-align:center;padding:4rem 1.5rem;color:#13132a">' +
    "<h1>You are offline</h1><p>This page is not saved on your device yet.</p>" +
    '<p><a href="' + home + '">Back to QuizMaster</a></p></body></html>';
  return new Response(html, {
    status: 503,
    statusText: "Offline",
    headers: { "Content-Type": "text/html; charset=utf-8" }
  });
}

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
    if (request.mode === "navigate") {
      return offlinePage();
    }
    return new Response("You are offline.", { status: 503, statusText: "Offline" });
  }
}

self.addEventListener("fetch", function (event) {
  const request = event.request;
  if (request.method !== "GET") {
    return;
  }

  const url = new URL(request.url);
  const isOurFile = url.origin === self.location.origin;
  const isExtra = EXTRA_HOSTS.some(function (item) {
    return url.hostname === item.host && url.pathname.startsWith(item.prefix);
  });

  if (!isOurFile && !isExtra) {
    return; // leave all other requests (like the database) alone
  }

  event.respondWith(internetFirst(request));
});
