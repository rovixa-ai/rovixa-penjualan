/* ======================================
   TREEHOUSE POS
   DATABASE CONFIGURATION
====================================== */

const DatabaseConfig = {

    STORAGE_KEY:
        "TREEHOUSE_POS_DATABASE_CONFIG",


    /* ==================================
       DEFAULT CONFIG
    ================================== */

    defaultConfig() {

        return {

            activeYear:
                new Date().getFullYear(),

            databases: {}

        };

    },


    /* ==================================
       GET CONFIG
    ================================== */

    getConfig() {

        try {

            const saved =
                localStorage.getItem(
                    this.STORAGE_KEY
                );


            if (!saved) {

                const config =
                    this.defaultConfig();

                this.saveConfig(
                    config
                );

                return config;

            }


            const config =
                JSON.parse(saved);


            return this.normalize(
                config
            );

        }

        catch (error) {

            console.error(
                "DATABASE CONFIG ERROR:",
                error
            );


            return this.defaultConfig();

        }

    },


    /* ==================================
       SAVE CONFIG
    ================================== */

    saveConfig(config) {

        const normalized =
            this.normalize(
                config
            );


        localStorage.setItem(

            this.STORAGE_KEY,

            JSON.stringify(
                normalized
            )

        );


        return normalized;

    },


    /* ==================================
       NORMALIZE
    ================================== */

    normalize(config) {

        const result =
            config || {};


        if (
            !result.databases ||
            typeof result.databases !== "object"
        ) {

            result.databases = {};

        }


        if (!result.activeYear) {

            result.activeYear =
                new Date().getFullYear();

        }


        Object.keys(
            result.databases
        ).forEach(
            year => {

                const database =
                    result.databases[year] || {};


                result.databases[year] = {

                    penjualan:
                        String(
                            database.penjualan || ""
                        ).trim(),

                    detailPenjualan:
                        String(
                            database.detailPenjualan || ""
                        ).trim(),

                    pembayaran:
                        String(
                            database.pembayaran || ""
                        ).trim()

                };

            }
        );


        return result;

    },


    /* ==================================
       GET ACTIVE YEAR
    ================================== */

    getActiveYear() {

        const config =
            this.getConfig();


        return Number(
            config.activeYear
        );

    },


    /* ==================================
       GET ACTIVE DATABASE
    ================================== */

    getActiveDatabase() {

        const config =
            this.getConfig();


        const year =
            Number(
                config.activeYear
            );


        const database =
            config.databases[year] || {

                penjualan: "",

                detailPenjualan: "",

                pembayaran: ""

            };


        return {

            year: year,

            penjualan:
                database.penjualan || "",

            detailPenjualan:
                database.detailPenjualan || "",

            pembayaran:
                database.pembayaran || ""

        };

    },


    /* ==================================
       SET ACTIVE YEAR
    ================================== */

    setActiveYear(year) {

        const config =
            this.getConfig();


        config.activeYear =
            Number(year);


        this.saveConfig(
            config
        );


        return this.getActiveDatabase();

    },


    /* ==================================
       GET DATABASE PER TAHUN
    ================================== */

    getYearDatabase(year) {

        const config =
            this.getConfig();


        year =
            Number(year);


        return config.databases[year] || {

            penjualan: "",

            detailPenjualan: "",

            pembayaran: ""

        };

    },


    /* ==================================
       SAVE DATABASE PER TAHUN
    ================================== */

    saveYearDatabase(
        year,
        database
    ) {

        const config =
            this.getConfig();


        year =
            Number(year);


        if (
            !config.databases[year]
        ) {

            config.databases[year] = {};

        }


        config.databases[year] = {

            penjualan:
                String(
                    database.penjualan || ""
                ).trim(),

            detailPenjualan:
                String(
                    database.detailPenjualan || ""
                ).trim(),

            pembayaran:
                String(
                    database.pembayaran || ""
                ).trim()

        };


        this.saveConfig(
            config
        );


        return this.getYearDatabase(
            year
        );

    },


    /* ==================================
       MODAL
    ================================== */

    openModal() {

        /*
         * Jika modal sudah ada,
         * jangan membuat modal baru.
         */

        const existing =
            document.getElementById(
                "configModalOverlay"
            );


        if (existing) {

            this.init();

            return;

        }


        /*
         * Buat modal.
         */

        const wrapper =
            document.createElement(
                "div"
            );


        wrapper.innerHTML =
            this.page();


        const modal =
            wrapper.firstElementChild;


        if (!modal) {

            return;

        }


        document.body.appendChild(
            modal
        );


        document.body.classList.add(
            "menu-open"
        );


        this.init();

    },


    /* ==================================
       CLOSE MODAL
    ================================== */

    closeModal() {

        const modal =
            document.getElementById(
                "configModalOverlay"
            );


        if (modal) {

            modal.remove();

        }


        document.body.classList.remove(
            "menu-open"
        );

    },


    /* ==================================
       PAGE / MODAL
    ================================== */

    page() {

        return `

            <div
                class="config-modal-overlay"
                id="configModalOverlay"
            >

                <div
                    class="config-modal"
                    id="configModal"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="configModalTitle"
                >


                    <!-- ==========================
                         MODAL HEADER
                    =========================== -->

                    <div class="config-modal-header">

                        <h2 id="configModalTitle">
                            Config
                        </h2>


                        <button
                            type="button"
                            class="config-modal-close"
                            id="configModalClose"
                            aria-label="Tutup Config"
                        >
                            ×
                        </button>

                    </div>



                    <!-- ==========================
                         CONFIG CONTENT
                    =========================== -->

                    <div class="config-page">

                        <div class="config-header">

                            <div>

                                <h2>
                                    Config
                                </h2>

                                <p>
                                    Pengaturan database transaksi kasir
                                </p>

                            </div>

                        </div>


                        <div class="config-card">


                            <!-- ==========================
                                 DATABASE TAHUN AKTIF
                            =========================== -->

                            <div class="config-section">

                                <div class="config-section-title">

                                    <strong>
                                        Database Tahun Aktif
                                    </strong>

                                    <span>
                                        Semua transaksi dan laporan
                                        menggunakan tahun ini.
                                    </span>

                                </div>


                                <div class="config-field">

                                    <label>
                                        Tahun Aktif
                                    </label>


                                    <select
                                        id="configYear"
                                        class="config-input"
                                    ></select>

                                </div>

                            </div>



                            <!-- ==========================
                                 DATABASE TRANSAKSI
                            =========================== -->

                            <div class="config-section">

                                <div class="config-section-title">

                                    <strong>
                                        Database Transaksi
                                    </strong>

                                    <span>
                                        Setiap tahun menggunakan
                                        tiga Spreadsheet terpisah.
                                    </span>

                                </div>


                                <div class="config-field">

                                    <label>
                                        Spreadsheet Penjualan
                                    </label>


                                    <div class="config-input-row">

                                        <input
                                            type="text"
                                            id="configPenjualan"
                                            class="config-input"
                                            placeholder="Masukkan Spreadsheet ID"
                                        />


                                        <button
                                            type="button"
                                            id="configRenderPenjualan"
                                            class="config-button config-button-secondary"
                                        >
                                            Render
                                        </button>

                                    </div>


                                    <small>
                                        Database untuk tabel Penjualan
                                    </small>

                                </div>



                                <div class="config-field">

                                    <label>
                                        Spreadsheet Detail Penjualan
                                    </label>


                                    <div class="config-input-row">

                                        <input
                                            type="text"
                                            id="configDetailPenjualan"
                                            class="config-input"
                                            placeholder="Masukkan Spreadsheet ID"
                                        />


                                        <button
                                            type="button"
                                            id="configRenderDetailPenjualan"
                                            class="config-button config-button-secondary"
                                        >
                                            Render
                                        </button>

                                    </div>


                                    <small>
                                        Database untuk tabel DetailPenjualan
                                    </small>

                                </div>



                                <div class="config-field">

                                    <label>
                                        Spreadsheet Pembayaran
                                    </label>


                                    <div class="config-input-row">

                                        <input
                                            type="text"
                                            id="configPembayaran"
                                            class="config-input"
                                            placeholder="Masukkan Spreadsheet ID"
                                        />


                                        <button
                                            type="button"
                                            id="configRenderPembayaran"
                                            class="config-button config-button-secondary"
                                        >
                                            Render
                                        </button>

                                    </div>


                                    <small>
                                        Database untuk tabel Pembayaran
                                    </small>

                                </div>

                            </div>



                            <!-- ==========================
                                 MASTER DATABASE
                            =========================== -->

                            <div class="config-section config-master-info">

                                <div class="config-section-title">

                                    <strong>
                                        Master Database
                                    </strong>

                                    <span>
                                        Barang dan Satuan Barang
                                        tetap menggunakan Master Database.
                                    </span>

                                </div>


                                <div class="config-info">

                                    <span class="config-info-icon">
                                        ✓
                                    </span>


                                    <div>

                                        <strong>
                                            Master Database tetap
                                        </strong>


                                        <p>
                                            Perubahan tahun tidak
                                            mengubah sumber data
                                            Barang dan Satuan Barang.
                                        </p>

                                    </div>

                                </div>

                            </div>



                            <!-- ==========================
                                 STATUS
                            =========================== -->

                            <div
                                id="configStatus"
                                class="config-status"
                            ></div>


                        </div>

                    </div>

                </div>

            </div>

        `;

    },


    /* ==================================
       INIT
    ================================== */

    init() {

        this.renderYears();

        this.loadForm();

        this.event();

    },


    /* ==================================
       RENDER YEARS
    ================================== */

    renderYears() {

        const select =
            document.getElementById(
                "configYear"
            );


        if (!select) {

            return;

        }


        const currentYear =
            new Date().getFullYear();


        const config =
            this.getConfig();


        const activeYear =
            Number(
                config.activeYear
            );


        const years = [];


        for (
            let year = currentYear - 2;
            year <= currentYear + 5;
            year++
        ) {

            years.push(
                year
            );

        }


        select.innerHTML =

            years.map(
                year => `

                    <option
                        value="${year}"
                        ${
                            year === activeYear
                                ? "selected"
                                : ""
                        }
                    >
                        ${year}
                    </option>

                `
            ).join("");

    },


    /* ==================================
       LOAD FORM
    ================================== */

    loadForm() {

        const yearInput =
            document.getElementById(
                "configYear"
            );


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
            !yearInput ||
            !penjualanInput ||
            !detailInput ||
            !pembayaranInput
        ) {

            return;

        }


        const year =
            Number(
                yearInput.value
            );


        const database =
            this.getYearDatabase(
                year
            );


        /*
         * ==================================
         * ISI DATABASE
         * ==================================
         */

        penjualanInput.value =
            database.penjualan || "";


        detailInput.value =
            database.detailPenjualan || "";


        pembayaranInput.value =
            database.pembayaran || "";


        /*
         * ==================================
         * TEXTBOX SELALU READ ONLY
         * ==================================
         */

        penjualanInput.readOnly =
            true;


        detailInput.readOnly =
            true;


        pembayaranInput.readOnly =
            true;


        /*
         * ==================================
         * TAHUN TETAP BISA DIPILIH
         * ==================================
         */

        yearInput.disabled =
            false;


        /*
         * ==================================
         * UPDATE RENDER BUTTON
         * ==================================
         */

        if (
            typeof DatabaseRender !==
            "undefined"
        ) {

            DatabaseRender.updateButtons();

        }


        /*
         * ==================================
         * STATUS DATABASE
         * ==================================
         */

        const complete =

            Boolean(
                database.penjualan
            ) &&

            Boolean(
                database.detailPenjualan
            ) &&

            Boolean(
                database.pembayaran
            );


        if (complete) {

            this.status(
                "Database tahun " +
                year +
                " tersedia dan aktif.",
                "success"
            );

        }
        else {

            this.status(
                "Database tahun " +
                year +
                " belum lengkap.",
                "info"
            );

        }

    },


    /* ==================================
       EVENT
    ================================== */

    event() {

        const yearInput =
            document.getElementById(
                "configYear"
            );


        const closeButton =
            document.getElementById(
                "configModalClose"
            );


        const overlay =
            document.getElementById(
                "configModalOverlay"
            );


        /*
         * ==================================
         * CLOSE BUTTON
         * ==================================
         */

        if (closeButton) {

            closeButton.onclick =
                () => {

                    this.closeModal();

                };

        }


        /*
         * ==================================
         * CLICK OVERLAY
         * ==================================
         */

        if (overlay) {

            overlay.onclick =
                event => {

                    if (
                        event.target ===
                        overlay
                    ) {

                        this.closeModal();

                    }

                };

        }


        /*
         * ==================================
         * ESC
         * ==================================
         */

        this.modalKeydown =
            event => {

                if (
                    event.key ===
                    "Escape"
                ) {

                    this.closeModal();

                }

            };


        document.addEventListener(
            "keydown",
            this.modalKeydown
        );


        /*
         * ==================================
         * YEAR
         * ==================================
         */

        if (yearInput) {

            yearInput.addEventListener(
                "change",
                () => {

                    const year =
                        Number(
                            yearInput.value
                        );


                    /*
                     * Jadikan tahun aktif
                     * secara langsung.
                     */

                    this.setActiveYear(
                        year
                    );


                    /*
                     * Load database
                     * tahun tersebut.
                     */

                    this.loadForm();


                    /*
                     * Update tombol Render
                     */

                    if (
                        typeof DatabaseRender !==
                        "undefined"
                    ) {

                        DatabaseRender.updateButtons();

                    }


                  

                }
            );

        }

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