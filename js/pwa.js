
/* ======================================
   ROVIXA KASIR PENJUALAN PWA
   REGISTRATION
====================================== */

(function () {

    "use strict";

    function registerServiceWorker() {

        if (!("serviceWorker" in navigator)) {
            return;
        }

        window.addEventListener("load", function () {

            navigator.serviceWorker.register(
                "./service-worker.js",
                {
                    scope: "./"
                }
            ).catch(function (error) {

                console.error(
                    "Rovixa Kasir Penjualan Service Worker gagal:",
                    error
                );

            });

        });

    }

    registerServiceWorker();

})();
