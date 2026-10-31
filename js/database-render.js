/* ======================================
   TREEHOUSE POS
   DATABASE RENDER
   CREATE DATABASE SPREADSHEET
====================================== */

const DatabaseRender = {

    initializedButtons:
        new WeakSet(),


    /* ==================================
       CONFIG
    ================================== */

    config: {

        penjualan: {

            input:
                "configPenjualan",

            button:
                "configRenderPenjualan",

            type:
                "penjualan"

        },


        detailPenjualan: {

            input:
                "configDetailPenjualan",

            button:
                "configRenderDetailPenjualan",

            type:
                "detailpenjualan"

        },


        pembayaran: {

            input:
                "configPembayaran",

            button:
                "configRenderPembayaran",

            type:
                "pembayaran"

        }

    },


    /* ==================================
       INIT
    ================================== */

    init() {

        this.bind();

    },


    /* ==================================
       BIND
    ================================== */

    bind() {

        Object.keys(
            this.config
        ).forEach(
            type => {

                const config =
                    this.config[type];


                const input =
                    document.getElementById(
                        config.input
                    );


                const button =
                    document.getElementById(
                        config.button
                    );


                if (
                    !input ||
                    !button
                ) {

                    return;

                }


                /*
                 * Jangan pasang event
                 * lebih dari satu kali.
                 */

                if (
                    this.initializedButtons.has(
                        button
                    )
                ) {

                    this.updateButton(
                        type
                    );

                    return;

                }


                this.initializedButtons.add(
                    button
                );


                /* ==========================
                   BUTTON
                =========================== */

                button.addEventListener(
                    "click",
                    () => {

                        this.render(
                            type
                        );

                    }
                );


                /* ==========================
                   INPUT
                =========================== */

                input.addEventListener(
                    "input",
                    () => {

                        this.updateButton(
                            type
                        );

                    }
                );


                /*
                 * Kondisi awal
                 */

                this.updateButton(
                    type
                );

            }
        );


        /*
         * Pastikan event dropdown
         * tahun juga terpasang.
         */

        this.bindYear();

    },


    /* ==================================
       BIND YEAR
    ================================== */

    bindYear() {

        const yearInput =
            document.getElementById(
                "configYear"
            );


        if (!yearInput) {

            return;

        }


        /*
         * Jangan pasang listener
         * lebih dari satu kali.
         */

        if (
            this.yearInput ===
            yearInput
        ) {

            return;

        }


        this.yearInput =
            yearInput;


        yearInput.addEventListener(
            "change",
            () => {

                /*
                 * DatabaseConfig sudah
                 * menangani pergantian tahun
                 * dan loadForm().
                 *
                 * Tunggu sebentar agar
                 * textbox selesai diisi.
                 */

                setTimeout(
                    () => {

                        this.checkDatabases();

                    },
                    0
                );

            }
        );

    },


    /* ==================================
       UPDATE BUTTON
    ================================== */

    updateButton(type) {

        const config =
            this.config[type];


        if (!config) {

            return;

        }


        const input =
            document.getElementById(
                config.input
            );


        const button =
            document.getElementById(
                config.button
            );


        if (
            !input ||
            !button
        ) {

            return;

        }


        /*
         * Jika ID sudah ada
         * tombol disabled.
         *
         * Jika ID kosong
         * tombol aktif.
         */

        button.disabled =
            input.value.trim() !== "";

    },


    /* ==================================
       UPDATE ALL BUTTON
    ================================== */

    updateButtons() {

        Object.keys(
            this.config
        ).forEach(
            type => {

                this.updateButton(
                    type
                );

            }
        );

    },


    /* ==================================
       GET YEAR
    ================================== */

    getYear() {

        const yearInput =
            document.getElementById(
                "configYear"
            );


        if (!yearInput) {

            return null;

        }


        const year =
            Number(
                yearInput.value
            );


        return year || null;

    },


    /* ==================================
       CHECK DATABASES
    ================================== */

    async checkDatabases() {

    const year = this.getYear();

    if (!year) {
        return;
    }


    const penjualanInput =
        document.getElementById(
            "configPenjualan"
        );

    const detailInput =
        document.getElementById(
            "configDetailPenjualan"
        );

    const pembayaranInput =
        document.getElementById(
            "configPembayaran"
        );


    if (
        !penjualanInput ||
        !detailInput ||
        !pembayaranInput
    ) {
        return;
    }


    const penjualan =
        penjualanInput.value.trim();

    const detailPenjualan =
        detailInput.value.trim();

    const pembayaran =
        pembayaranInput.value.trim();


    /*
     * Tidak ada database yang perlu diperiksa.
     */

    if (
        !penjualan &&
        !detailPenjualan &&
        !pembayaran
    ) {

        this.updateButtons();

        return;

    }


    try {

        this.status(
            "Memeriksa database tahun " +
            year +
            "...",
            "info"
        );


        const response =
            await API.post(
                "checkDatabaseSpreadsheet",
                {
                    year: year,

                    penjualan:
                        penjualan,

                    detailPenjualan:
                        detailPenjualan,

                    pembayaran:
                        pembayaran
                }
            );


      

        if (
            !response ||
            response.success !== true
        ) {

            throw new Error(
                response &&
                response.message
                    ? response.message
                    : "Gagal memeriksa database."
            );

        }


        /*
         * Tentukan ID yang masih valid.
         */

        const validPenjualan =
            response.penjualan === true
                ? penjualan
                : "";

        const validDetailPenjualan =
            response.detailPenjualan === true
                ? detailPenjualan
                : "";

        const validPembayaran =
            response.pembayaran === true
                ? pembayaran
                : "";


        /*
         * Hapus ID yang sudah tidak valid
         * dari textbox.
         */

        penjualanInput.value =
            validPenjualan;

        detailInput.value =
            validDetailPenjualan;

        pembayaranInput.value =
            validPembayaran;


        /*
         * ==================================
         * SINKRONKAN KE LOCAL STORAGE
         * ==================================
         *
         * Ini penting.
         *
         * Jika file sudah dihapus dari Google Drive,
         * ID lama juga langsung dihapus dari konfigurasi
         * tahun tersebut.
         */

        if (
            typeof DatabaseConfig !==
            "undefined"
        ) {

            DatabaseConfig.saveYearDatabase(
                year,
                {
                    penjualan:
                        validPenjualan,

                    detailPenjualan:
                        validDetailPenjualan,

                    pembayaran:
                        validPembayaran
                }
            );

        }


        /*
         * Update tombol Render.
         */

        this.updateButtons();


        /*
         * Tentukan database yang hilang.
         */

        let removed = [];


        if (
            penjualan &&
            response.penjualan !== true
        ) {

            removed.push(
                "Penjualan"
            );

        }


        if (
            detailPenjualan &&
            response.detailPenjualan !== true
        ) {

            removed.push(
                "Detail Penjualan"
            );

        }


        if (
            pembayaran &&
            response.pembayaran !== true
        ) {

            removed.push(
                "Pembayaran"
            );

        }


        /*
         * Semua database valid.
         */

        if (
            response.complete === true
        ) {

            this.status(
                "3 database tahun " +
                year +
                " tersedia.",
                "success"
            );

            return;

        }


        /*
         * Ada database yang sudah dihapus.
         */

        if (
            removed.length > 0
        ) {

            this.status(
                "Database tahun " +
                year +
                " belum lengkap. " +
                removed.join(", ") +
                " tidak ditemukan. ID lama telah dihapus.",
                "error"
            );

            return;

        }


        /*
         * Belum lengkap tetapi tidak ada
         * ID invalid yang ditemukan.
         */

        this.status(
            "Database tahun " +
            year +
            " belum memiliki 3 file database.",
            "info"
        );

    }
    catch (error) {

        console.error(
            "DATABASE CHECK ERROR:",
            error
        );


        this.updateButtons();


        this.status(
            error.message ||
            "Gagal memeriksa database.",
            "error"
        );

    }

},


    /* ==================================
       RENDER
    ================================== */

    async render(type) {

        const config =
            this.config[type];


        if (!config) {

            return;

        }


        const input =
            document.getElementById(
                config.input
            );


        const button =
            document.getElementById(
                config.button
            );


        if (
            !input ||
            !button
        ) {

            return;

        }


        /*
         * Jangan render jika
         * ID sudah tersedia.
         */

        if (
            input.value.trim()
        ) {

            this.updateButton(
                type
            );

            return;

        }


        const year =
            this.getYear();


        /*
         * Validasi tahun
         */

        if (!year) {

            this.status(

                "Tahun belum dipilih.",

                "error"

            );

            return;

        }


        /*
         * Simpan text asli
         */

        const originalText =
            button.textContent;


        try {

            /*
             * Disable sementara
             */

            button.disabled =
                true;


            button.textContent =
                "Rendering...";


            this.status(

                "Membuat database " +
                this.getDatabaseName(type) +
                " tahun " +
                year +
                "...",

                "info"

            );


            /*
             * REQUEST KE APPS SCRIPT
             */

            const response =
                await API.post(

                    "createDatabaseSpreadsheet",

                    {

                        type:
                            config.type,

                        year:
                            year

                    }

                );


           


            /*
             * VALIDASI RESPONSE
             */

            if (
                !response ||
                response.success !== true
            ) {

                throw new Error(

                    response &&
                    response.message

                        ? response.message

                        : "Gagal membuat database."

                );

            }


            /*
             * VALIDASI ID
             */

            if (
                !response.id
            ) {

                throw new Error(

                    "Spreadsheet ID tidak diterima."

                );

            }


            /*
             * MASUKKAN ID
             */

            input.value =
                String(
                    response.id
                ).trim();


            /*
             * Tombol otomatis disabled
             */

            this.updateButton(
                type
            );


            /*
             * Status sukses
             */

            this.status(

                "Database " +
                this.getDatabaseName(type) +
                " tahun " +
                year +
                " berhasil dibuat.",

                "success"

            );

        }

        catch (error) {

            console.error(

                "DATABASE RENDER ERROR:",

                error

            );


            /*
             * Jika gagal,
             * tombol kembali aktif.
             */

            button.disabled =
                false;


            button.textContent =
                originalText;


            this.status(

                error.message ||
                "Gagal membuat database.",

                "error"

            );

        }

    },


    /* ==================================
       DATABASE NAME
    ================================== */

    getDatabaseName(type) {

        const names = {

            penjualan:
                "Penjualan",

            detailPenjualan:
                "Detail Penjualan",

            pembayaran:
                "Pembayaran"

        };


        return (

            names[type] ||

            type

        );

    },


    /* ==================================
       STATUS
    ================================== */

    status(
        message,
        type = "info"
    ) {

        const element =
            document.getElementById(
                "configStatus"
            );


        if (!element) {

            return;

        }


        element.className =
            "config-status config-status-" +
            type;


        element.textContent =
            message;

    }

};


/* ======================================
   AUTO INIT
====================================== */

(function() {

    /*
     * Coba bind langsung.
     */

    DatabaseRender.init();


    /*
     * Karena aplikasi menggunakan
     * render halaman secara dinamis,
     * MutationObserver akan mendeteksi
     * tombol Config ketika muncul.
     */

    if (
        document.body
    ) {

        const observer =
            new MutationObserver(
                () => {

                    DatabaseRender.bind();

                }
            );


        observer.observe(

            document.body,

            {

                childList:
                    true,

                subtree:
                    true

            }

        );

    }

})();
