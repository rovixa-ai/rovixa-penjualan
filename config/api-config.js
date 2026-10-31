/* ======================================
   TREEHOUSE POS
   GOOGLE APPS SCRIPT API CONFIG
   MULTI-CLIENT CONFIGURATION
====================================== */

(function (window, document) {

    "use strict";


    /* ======================================
       CENTRAL CLIENT CONFIGURATION API
    ====================================== */

    const CENTRAL_API_URL =
        "https://script.google.com/macros/s/AKfycbyEGC57wQqgx5LNw_TgfnbFIXPxjrN0H4I_17nT1cI5KOT5UotyBBViOyNTbkAQ8HFD/exec";


  /* ======================================
   CLIENT IDENTIFICATION
====================================== */

const CLIENT_STORAGE_KEY =
    "ROVIXA_CLIENT_ID";

const params =
    new URLSearchParams(
        window.location.search
    );

const urlClientId =
    String(
        params.get("client") || ""
    ).trim();

let clientId = "";

try {

    if (urlClientId) {

        // Simpan Client ID dari URL.
        localStorage.setItem(
            CLIENT_STORAGE_KEY,
            urlClientId
        );

        clientId = urlClientId;

    } else {

        // Gunakan Client ID yang tersimpan.
        clientId = String(
            localStorage.getItem(
                CLIENT_STORAGE_KEY
            ) || ""
        ).trim();

    }

} catch (error) {

    console.error(
        "Gagal membaca Client ID:",
        error
    );

}


    /* ======================================
       CONFIGURATION STATE
    ====================================== */

    let resolvePromise = null;


    const API_CONFIG = {

        SCRIPT_URL: "",

        CENTRAL_API_URL:
            CENTRAL_API_URL,

        CLIENT_ID:
            clientId,

        STORE_NAME: "",

        READY: false,

        ERROR: null,


        /* ======================================
           INITIALIZE CLIENT CONFIGURATION
        ====================================== */

        init() {

            if (
                this.READY &&
                this.SCRIPT_URL
            ) {

                return Promise.resolve(
                    this
                );

            }

            if (resolvePromise) {

                return resolvePromise;

            }

            if (!this.CLIENT_ID) {

                this.ERROR =
                    "ID pelanggan tidak ditemukan pada URL.";

                return Promise.reject(
                    new Error(
                        this.ERROR
                    )
                );

            }

            resolvePromise =
                new Promise((resolve, reject) => {

                    let completed = false;

                    const callbackName =
                        "__treehouseClientConfigCallback";

                    const script =
                        document.createElement("script");

                    const timeoutId =
                        window.setTimeout(() => {

                            finishError(
                                "Waktu pengambilan konfigurasi pelanggan habis."
                            );

                        }, 15000);


                    /* ==============================
                       CLEANUP
                    ============================== */

                    function cleanup() {

                        window.clearTimeout(
                            timeoutId
                        );

                        delete window[
                            callbackName
                        ];

                        if (
                            script.parentNode
                        ) {

                            script.parentNode.removeChild(
                                script
                            );

                        }

                    }


                    /* ==============================
                       HANDLE FAILURE
                    ============================== */

                    function finishError(message) {

                        if (completed) {
                            return;
                        }

                        completed = true;

                        cleanup();

                        API_CONFIG.SCRIPT_URL = "";

                        API_CONFIG.STORE_NAME = "";

                        API_CONFIG.READY = false;

                        API_CONFIG.ERROR = message;

                        resolvePromise = null;

                        reject(
                            new Error(message)
                        );

                    }


                    /* ==============================
                       JSONP CALLBACK
                    ============================== */

                    window[callbackName] = function (result) {

                        if (completed) {
                            return;
                        }

                        if (
                            !result ||
                            result.success !== true ||
                            !result.scriptUrl
                        ) {

                            finishError(
                                result && result.message
                                    ? result.message
                                    : "Konfigurasi pelanggan tidak valid."
                            );

                            return;

                        }

                        const scriptUrl =
                            String(
                                result.scriptUrl
                            ).trim();

                        if (
                            !/^https:\/\/script\.google\.com\/macros\/s\/[^/]+\/exec$/
                                .test(scriptUrl)
                        ) {

                            finishError(
                                "URL Web App pelanggan tidak valid."
                            );

                            return;

                        }

                        completed = true;

                        cleanup();

                        API_CONFIG.SCRIPT_URL =
                            scriptUrl;

                        API_CONFIG.STORE_NAME =
                            String(
                                result.storeName || ""
                            ).trim();

                        API_CONFIG.CLIENT_ID =
                            String(
                                result.clientId ||
                                clientId
                            ).trim();

                        API_CONFIG.READY = true;

                        API_CONFIG.ERROR = null;

                        resolvePromise = null;

                        resolve(
                            API_CONFIG
                        );

                    };


                    /* ==============================
                       JSONP SCRIPT
                    ============================== */

                    script.async = true;

                    script.onerror = function () {

                        finishError(
                            "Gagal menghubungi API konfigurasi pelanggan."
                        );

                    };

                    script.src =
                        CENTRAL_API_URL +
                        "?action=resolveClient" +
                        "&client=" +
                        encodeURIComponent(
                            API_CONFIG.CLIENT_ID
                        ) +
                        "&callback=" +
                        encodeURIComponent(
                            callbackName
                        );

                    document.head.appendChild(
                        script
                    );

                });

            return resolvePromise;

        }

    };


    /* ======================================
       EXPOSE GLOBAL CONFIGURATION
    ====================================== */

    window.API_CONFIG =
        API_CONFIG;


})(window, document);