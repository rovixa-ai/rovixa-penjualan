// ======================================
// TREEHOUSE POS
// API
// MULTI-CLIENT CONFIGURATION
// ======================================

const API = {

    URL: null,

    initialized: false,

    initPromise: null,

    /* ==================================
       BOOTSTRAP CACHE
       ================================== */

    bootstrapCache:
        null,

    bootstrapPromise:
        null,


    /* ==================================
       INITIALIZE CLIENT API
       ================================== */

    async init() {

        if (
            this.initialized &&
            this.URL
        ) {

            return this.URL;

        }

        if (
            this.initPromise
        ) {

            return this.initPromise;

        }

        this.initPromise =
            (async () => {

                if (
                    !window.API_CONFIG ||
                    typeof window.API_CONFIG.init !== "function"
                ) {

                    throw new Error(
                        "Konfigurasi pelanggan belum tersedia."
                    );

                }

                await window.API_CONFIG.init();

                const scriptUrl =
                    String(
                        window.API_CONFIG.SCRIPT_URL || ""
                    ).trim();

                if (
                    !/^https:\/\/script\.google\.com\/macros\/s\/[^/]+\/exec$/
                        .test(scriptUrl)
                ) {

                    throw new Error(
                        "URL Web App pelanggan tidak valid."
                    );

                }

                this.URL =
                    scriptUrl;

                this.initialized =
                    true;

                return this.URL;

            })();

        try {

            return await this.initPromise;

        } catch (error) {

            this.URL =
                null;

            this.initialized =
                false;

            this.initPromise =
                null;

            throw error;

        }

    },


    /* ==================================
       GET
       ================================== */

    async get(action, params = {}) {

        const baseUrl =
            await this.init();

        const query =
            new URLSearchParams({

                action:
                    action,

                ...params

            });

        const response =
            await fetch(
                `${baseUrl}?${query.toString()}`
            );

        const text =
            await response.text();

        let result;

        try {

            result =
                JSON.parse(text);

        } catch (error) {

            throw new Error(
                "Response API bukan JSON."
            );

        }

        if (
            !result.success
        ) {

            throw new Error(
                result.message ||
                "API gagal."
            );

        }

        return result;

    },


    /* ==================================
       POST
       ================================== */

    async post(action, data = {}) {

        const baseUrl =
            await this.init();

        const payload = {

            action:
                action,

            ...data

        };

        const response =
            await fetch(
                baseUrl,
                {

                    method:
                        "POST",

                    headers: {

                        "Content-Type":
                            "text/plain;charset=utf-8"

                    },

                    body:
                        JSON.stringify(
                            payload
                        )

                }
            );

        const text =
            await response.text();

        let result;

        try {

            result =
                JSON.parse(text);

        } catch (error) {

            throw new Error(
                "Response API POST bukan JSON."
            );

        }

        if (
            !result.success
        ) {

            throw new Error(
                result.message ||
                "API POST gagal."
            );

        }

        return result;

    },


    /* ==================================
       POS BOOTSTRAP
       BARANG + SATUAN BARANG
       + STORE CONFIG

       CACHE:
       Satu kali request ke server
       untuk seluruh aplikasi.
       ================================== */

    async bootstrap() {

        /* ==============================
           HASIL SUDAH TERSIMPAN
        ============================== */

        if (
            this.bootstrapCache
        ) {

            return this.bootstrapCache;

        }


        /* ==============================
           REQUEST SEDANG BERJALAN

           Beberapa module menggunakan
           request bootstrap yang sama.
        ============================== */

        if (
            this.bootstrapPromise
        ) {

            return await this.bootstrapPromise;

        }


        /* ==============================
           REQUEST BARU
        ============================== */

        this.bootstrapPromise =
            (async () => {

                try {

                    const response =
                        await this.get(
                            "bootstrap"
                        );

                    const data =
                        response.data ||
                        {};

                    const result = {

                        barang:
                            Array.isArray(
                                data.barang
                            )
                                ? data.barang
                                : [],

                        satuan:
                            Array.isArray(
                                data.satuan
                            )
                                ? data.satuan
                                : [],

                        storeConfig:
                            data.storeConfig ||
                            {}

                    };

                    this.bootstrapCache =
                        result;

                    return result;

                } catch (error) {

                    console.error(
                        "API.bootstrap ERROR:",
                        error
                    );

                    throw error;

                } finally {

                    this.bootstrapPromise =
                        null;

                }

            })();

        return await this.bootstrapPromise;

    },


    /* ==================================
       CLEAR BOOTSTRAP CACHE
       ================================== */

    clearBootstrapCache() {

        this.bootstrapCache =
            null;

        this.bootstrapPromise =
            null;

    },


    /* ==================================
       RESOLVE DATABASE PENJUALAN
       BERDASARKAN TAHUN
       ================================== */

    async resolvePenjualanDatabase(year) {

        return this.get(
            "resolvePenjualanDatabase",
            {

                year:
                    Number(year)

            }
        );

    },


    /* ==================================
       DOWNLOAD DATABASE PENJUALAN
       BERDASARKAN TAHUN
       ================================== */

    async getDownloadPenjualan(database) {

        database =
            database || {};

        return this.get(
            "downloadPenjualan",
            {

                year:
                    Number(
                        database.year
                    ),

                penjualanId:
                    String(
                        database.penjualanId ||
                        ""
                    ).trim(),

                detailPenjualanId:
                    String(
                        database.detailPenjualanId ||
                        ""
                    ).trim(),

                pembayaranId:
                    String(
                        database.pembayaranId ||
                        ""
                    ).trim()

            }
        );

    }

};