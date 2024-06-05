/// <reference lib="webworker" />
/* eslint-disable no-restricted-globals */

// This service worker can be customized!
// See https://developers.google.com/web/tools/workbox/modules
// for the list of available Workbox modules, or add any other
// code you'd like.
// You can also remove this file if you'd prefer not to use a
// service worker, and the Workbox build step will be skipped.

import { clientsClaim } from "workbox-core";
import { ExpirationPlugin } from "workbox-expiration";
import { createHandlerBoundToURL, precacheAndRoute } from "workbox-precaching";
import { registerRoute } from "workbox-routing";
import { StaleWhileRevalidate } from "workbox-strategies";

declare const self: ServiceWorkerGlobalScope;

clientsClaim();

// Precache all of the assets generated by your build process.
// Their URLs are injected into the manifest variable below.
// This variable must be present somewhere in your service worker file,
// even if you decide not to use precaching. See https://cra.link/PWA
precacheAndRoute([
  ...self.__WB_MANIFEST,
  { url: "/web-ide/root.css", revision: null },
  { url: "/web-ide/pico.min.css", revision: null },
  // { url: "https://fonts.googleapis.com/css2?family=JetBrains+Mono&family=Poppins:wght@400;700&display=swap", revision: null, },
  { url: "/web-ide/poppins_400.ttf", revision: null },
  { url: "/web-ide/poppins_700.ttf", revision: null },
  { url: "/web-ide/jet_brains_mono.ttf", revision: null },
  { url: "/web-ide/manifest.json", revision: null },
  { url: "/web-ide/favicon.svg", revision: null },
  { url: "/web-ide/logo_192.png", revision: null },
  { url: "/web-ide/logo_512.png", revision: null },
  {
    url: "https://fonts.gstatic.com/s/materialsymbolsoutlined/v179/kJEhBvYX7BgnkSrUwT8OhrdQw4oELdPIeeII9v6oFsLjBuVY.woff2",
    revision: null,
  },
  {
    url: "https://cdn.jsdelivr.net/npm/monaco-editor@0.43.0/min/vs/loader.js",
    revision: null,
  },
  {
    url: "https://cdn.jsdelivr.net/npm/monaco-editor@0.43.0/min/vs/editor/editor.main.js",
    revision: null,
  },
  {
    url: "https://cdn.jsdelivr.net/npm/monaco-editor@0.43.0/min/vs/editor/editor.main.css",
    revision: null,
  },
  {
    url: "https://cdn.jsdelivr.net/npm/monaco-editor@0.43.0/min/vs/editor/editor.main.nls.js",
    revision: null,
  },

  {
    url: "user_guide/chip.pdf",
    revision: null,
  },
  {
    url: "user_guide/cpu.pdf",
    revision: null,
  },
  {
    url: "user_guide/asm.pdf",
    revision: null,
  },
  {
    url: "user_guide/vm.pdf",
    revision: null,
  },
  {
    url: "user_guide/compiler.pdf",
    revision: null,
  },
]);

// Set up App Shell-style routing, so that all navigation requests
// are fulfilled with your index.html shell. Learn more at
// https://developers.google.com/web/fundamentals/architecture/app-shell
const fileExtensionRegexp = new RegExp("/[^/?]+\\.[^/]+$");
registerRoute(
  // Return false to exempt requests from being fulfilled by index.html.
  ({ request, url }: { request: Request; url: URL }) => {
    // If this isn't a navigation, skip.
    if (request.mode !== "navigate") {
      return false;
    }

    // If this is a URL that starts with /_, skip.
    if (url.pathname.startsWith("/_")) {
      return false;
    }

    // If this looks like a URL for a resource, because it contains
    // a file extension, skip.
    if (url.pathname.match(fileExtensionRegexp)) {
      return false;
    }

    // Return true to signal that we want to use the handler.
    return true;
  },
  createHandlerBoundToURL(process.env.PUBLIC_URL + "/index.html"),
);

// An example runtime caching route for requests that aren't handled by the
// precache, in this case same-origin .png requests like those from in public/
registerRoute(
  // Add in any other file extensions or routing criteria as needed.
  ({ url }) =>
    url.origin === self.location.origin && url.pathname.endsWith(".png"),
  // Customize this strategy as needed, e.g., by changing to CacheFirst.
  new StaleWhileRevalidate({
    cacheName: "images",
    plugins: [
      // Ensure that once this runtime cache reaches a maximum size the
      // least-recently used images are removed.
      new ExpirationPlugin({ maxEntries: 50 }),
    ],
  }),
);

// This allows the web app to trigger skipWaiting via
// registration.waiting.postMessage({type: 'SKIP_WAITING'})
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

// Any other custom service worker logic can go here.
