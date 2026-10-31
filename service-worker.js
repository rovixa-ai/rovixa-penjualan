
/* ======================================
   ROVIXA KASIR PENJUALAN PWA
   SERVICE WORKER
====================================== */

"use strict";

/* ======================================
   CACHE CONFIGURATION
====================================== */

const CACHE_PREFIX =
    "rovixa-sales-pwa";

const CACHE_VERSION =
    "v1";

const STATIC_CACHE =
    `${CACHE_PREFIX}-static-${CACHE_VERSION}`;

const RUNTIME_CACHE =
    `${CACHE_PREFIX}-runtime-${CACHE_VERSION}`;


/* ======================================
   APP SHELL
====================================== */

const APP_SHELL = [
    "./",
    "./index.html",
    "./manifest.json",
    "./css/style.css"
];


/* ======================================
   INSTALL
====================================== */

self.addEventListener("install", event => {

    event.waitUntil((async () => {

        const cache =
            await caches.open(STATIC_CACHE);

        await Promise.all(

            APP_SHELL.map(async path => {

                try {

                    await cache.add(
                        new Request(path, {
                            cache: "reload"
                        })
                    );

                } catch (error) {

                    console.warn(
                        "Gagal menyimpan app shell:",
                        path
                    );

                }

            })

        );

        await self.skipWaiting();

    })());

});


/* ======================================
   ACTIVATE
====================================== */

self.addEventListener("activate", event => {

    event.waitUntil((async () => {

        const keys =
            await caches.keys();

        await Promise.all(

            keys

                .filter(key =>
                    key.startsWith(CACHE_PREFIX) &&
                    key !== STATIC_CACHE &&
                    key !== RUNTIME_CACHE
                )

                .map(key =>
                    caches.delete(key)
                )

        );

        await self.clients.claim();

    })());

});


/* ======================================
   FETCH
====================================== */

self.addEventListener("fetch", event => {

    const request =
        event.request;

    if (request.method !== "GET") {
        return;
    }

    const url =
        new URL(request.url);

    // Hanya request dari origin sendiri.
    if (
        url.origin !== self.location.origin
    ) {
        return;
    }

    // Batasi request pada folder aplikasi.
    if (
        !url.pathname.startsWith(
            new URL(
                self.registration.scope
            ).pathname
        )
    ) {
        return;
    }


    /* ==================================
       NAVIGATION - NETWORK FIRST
    ================================== */

    if (request.mode === "navigate") {

        event.respondWith((async () => {

            const cacheUrl =
                new URL(request.url);

            cacheUrl.search = "";
            cacheUrl.hash = "";

            const cacheRequest =
                new Request(cacheUrl.href);

            try {

                const response =
                    await fetch(request);

                if (
                    response &&
                    response.ok
                ) {

                    const cache =
                        await caches.open(
                            RUNTIME_CACHE
                        );

                    await cache.put(
                        cacheRequest,
                        response.clone()
                    );

                }

                return response;

            } catch (error) {

                const runtimeCache =
                    await caches.open(
                        RUNTIME_CACHE
                    );

                const staticCache =
                    await caches.open(
                        STATIC_CACHE
                    );

                const cached =
                    await runtimeCache.match(
                        cacheRequest
                    ) ||
                    await staticCache.match(
                        "./index.html"
                    ) ||
                    await staticCache.match(
                        "./"
                    );

                if (cached) {
                    return cached;
                }

                return new Response(
                    "Kasir Penjualan belum tersedia secara offline.",
                    {
                        status: 503,
                        headers: {
                            "Content-Type":
                                "text/plain; charset=utf-8"
                        }
                    }
                );

            }

        })());

        return;
    }


    /* ==================================
       STATIC ASSETS - CACHE FIRST
    ================================== */

    event.respondWith((async () => {

        const staticCache =
            await caches.open(
                STATIC_CACHE
            );

        const runtimeCache =
            await caches.open(
                RUNTIME_CACHE
            );

        const cached =
            await staticCache.match(request) ||
            await runtimeCache.match(request);

        if (cached) {

            fetch(request)

                .then(async response => {

                    if (
                        response &&
                        response.ok
                    ) {

                        await runtimeCache.put(
                            request,
                            response.clone()
                        );

                    }

                })

                .catch(() => {});

            return cached;

        }

        try {

            const response =
                await fetch(request);

            if (
                response &&
                response.ok
            ) {

                await runtimeCache.put(
                    request,
                    response.clone()
                );

            }

            return response;

        } catch (error) {

            return new Response("", {
                status: 504,
                statusText: "Offline"
            });

        }

    })());

});
