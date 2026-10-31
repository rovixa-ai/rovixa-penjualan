// ======================================
// TREEHOUSE POS
// APP
// ======================================

document.documentElement.classList.add(
    "app-auth-checking"
);

const App = {

    authenticatedBootstrapRunning: false,

    applicationPrepared: false,

    eventsBound: false,

    /* ==================================
       INITIALIZE APPLICATION
    ================================== */

    async init() {

        const loadingAvailable =
            typeof Loading !== "undefined" &&
            typeof Loading.show === "function" &&
            typeof Loading.hide === "function";

        if (loadingAvailable) {

            Loading.show(
                "Menyiapkan database dan memuat data aplikasi..."
            );

        }

        try {

            /* ==================================
               INITIALIZE LOCAL DATABASE
            ================================== */

            if (
                typeof LocalDB === "undefined" ||
                typeof LocalDB.init !== "function"
            ) {

                throw new Error(
                    "LocalDB tidak tersedia."
                );

            }

            this.updateLoading(
                "Menginisialisasi database lokal..."
            );

            await LocalDB.init();

            /* ==================================
               LOAD STORE CONFIG
            ================================== */

            if (
                typeof StoreConfig === "undefined" ||
                typeof StoreConfig.load !== "function"
            ) {

                throw new Error(
                    "StoreConfig tidak tersedia."
                );

            }

            this.updateLoading(
                "Memuat konfigurasi toko..."
            );

            await StoreConfig.load();

            /* ==================================
               RENDER APPLICATION SHELL
            ================================== */

            this.updateLoading(
                "Menyiapkan tampilan aplikasi..."
            );

            this.render();

            /* ==================================
               DOWNLOAD MASTER USER
            ================================== */

            if (
                typeof DownloadUsers === "undefined" ||
                typeof DownloadUsers.download !== "function"
            ) {

                throw new Error(
                    "DownloadUsers tidak tersedia."
                );

            }

            this.updateLoading(
                "Mengunduh data pengguna..."
            );

            let userDownloadError = null;

            if (navigator.onLine) {

                try {

                    const userResult =
                        await DownloadUsers.download();

                    if (
                        !userResult ||
                        userResult.success !== true
                    ) {

                        userDownloadError =
                            new Error(
                                userResult?.message ||
                                "Download data pengguna gagal."
                            );

                    }

                } catch (err) {

                    userDownloadError = err;

                }

            } else {

                userDownloadError =
                    new Error(
                        "Perangkat dalam kondisi offline."
                    );

            }

            if (userDownloadError) {

                console.warn(
                    "Download data pengguna dilewati / offline:",
                    userDownloadError.message || userDownloadError
                );

                const localUsers =
                    await LocalDB.getAll("users");

                if (
                    !Array.isArray(localUsers) ||
                    !localUsers.length
                ) {

                    throw new Error(
                        "Koneksi internet diperlukan untuk mengunduh akun pengguna pada penggunaan pertama kali."
                    );

                }

            }

            /* ==================================
               PERSIAPAN APLIKASI SEBELUM LOGIN
               DOWNLOAD DATABASE DAN SINKRONISASI
            ================================== */

            await this.prepareApplication();

            /* ==================================
               VALIDASI LOGIN SETELAH PERSIAPAN
            ================================== */

            this.updateLoading(
                "Memeriksa sesi login..."
            );

            if (
                typeof Auth === "undefined" ||
                typeof Auth.validateSession !== "function"
            ) {

                throw new Error(
                    "Auth.validateSession tidak tersedia."
                );

            }

            const authResult =
                await Auth.validateSession();

            /* ==================================
               BELUM LOGIN
            ================================== */

            if (
                !authResult ||
                authResult.success !== true ||
                authResult.loggedIn !== true
            ) {

                if (
                    typeof Login === "undefined" ||
                    typeof Login.init !== "function"
                ) {

                    throw new Error(
                        "Login module tidak tersedia."
                    );

                }

                this.updateLoading(
                    "Menyiapkan halaman login..."
                );

                await Login.init();

                document.documentElement.classList.remove(
                    "app-auth-checking"
                );

                return;

            }

            /* ==================================
               USER SUDAH LOGIN
            ================================== */

            document.documentElement.classList.remove(
                "app-auth-checking"
            );

            await this.startAuthenticatedApp();

        } catch (error) {

            console.error(
                "APP INIT ERROR:",
                error
            );

            document.documentElement.classList.remove(
                "app-auth-checking"
            );

            if (
                typeof Dialog !== "undefined" &&
                typeof Dialog.error === "function"
            ) {

                Dialog.error(
                    error.message ||
                    "Gagal memuat aplikasi."
                );

            }

        } finally {

            if (loadingAvailable) {

                Loading.hide();

            }

        }

    },


    /* ==================================
       UPDATE LOADING
    ================================== */

    updateLoading(message) {

        if (
            typeof Loading !== "undefined" &&
            typeof Loading.update === "function"
        ) {

            Loading.update(message);

        }

    },


    /* ==================================
       RENDER APPLICATION SHELL
    ================================== */

    render() {

        const app =
            document.getElementById("app");

        if (!app) {

            console.error(
                "Element #app tidak ditemukan."
            );

            return;

        }

        app.innerHTML = `

            <div class="sidebar-app-layout">

                <!-- ==========================
                     DESKTOP SIDEBAR
                =========================== -->

                ${AppDesktopRender.renderSidebar()}

                <!-- ==========================
                     MAIN FRAME
                =========================== -->

                <div class="app-main-frame">

                    <!-- ======================
                         DESKTOP HEADER
                    ======================= -->

                    ${AppDesktopRender.renderHeader()}

                    <!-- ======================
                         MOBILE RENDER
                    ======================= -->

                    <div class="app-mobile-render-container">

                        ${AppMobileRender.render()}

                    </div>

                    <!-- ======================
                         PAGE CONTENT
                    ======================= -->

                    <main
                        class="sidebar-app-content"
                        id="pageContent"
                    ></main>

                </div>

            </div>

        `;

        this.event();

        this.refreshHeader();

    },


    /* ==================================
       REFRESH HEADER
    ================================== */

    refreshHeader() {

        const storeName =
            typeof StoreConfig !== "undefined" &&
            typeof StoreConfig.getStoreName === "function"
                ? StoreConfig.getStoreName() || "Treehouse POS"
                : "Treehouse POS";

        const logo =
            typeof StoreConfig !== "undefined" &&
            typeof StoreConfig.getLogo === "function"
                ? StoreConfig.getLogo()
                : "";

        const user =
            typeof Auth !== "undefined" &&
            typeof Auth.getCurrentUser === "function"
                ? Auth.getCurrentUser()
                : null;

        const userName =
            user
                ? user.nama || user.username || "ADMIN"
                : "ADMIN";

        document.querySelectorAll(
            ".app-header-store-name"
        ).forEach(element => {

            element.textContent = storeName;

        });

        document.querySelectorAll(
            ".app-header-user"
        ).forEach(element => {

            element.textContent = userName;

        });

        document.querySelectorAll(
            ".app-header-logo"
        ).forEach(element => {

            if (logo) {

                const image =
                    document.createElement("img");

                image.src = logo;
                image.alt = "Logo " + storeName;

                image.onerror = () => {

                    element.textContent =
                        storeName.charAt(0).toUpperCase();

                };

                element.replaceChildren(image);

            } else {

                element.textContent =
                    storeName.charAt(0).toUpperCase();

            }

        });

    },


    /* ==================================
       EVENT
    ================================== */

    event() {

        if (this.eventsBound) {
            return;
        }

        this.eventsBound = true;

        document.addEventListener(
            "click",
            e => {

                const logoutButton =
                    e.target.closest(
                        '[data-action="logout"]'
                    );

                if (logoutButton) {

                    this.logout();

                    return;

                }

                const configButton =
                    e.target.closest(
                        '[data-action="config"]'
                    );

                if (configButton) {

                    if (
                        typeof DatabaseConfig !== "undefined" &&
                        typeof DatabaseConfig.openModal === "function"
                    ) {

                        DatabaseConfig.openModal();

                    }

                    return;

                }

                const pageButton =
                    e.target.closest(
                        '[data-page]'
                    );

                if (!pageButton) {
                    return;
                }

                const page =
                    pageButton.dataset.page;

                if (!page) {
                    return;
                }

                this.open(page);

            }
        );

    },


    /* ==================================
       OPEN PAGE
    ================================== */

    async open(page) {

        this.setActive(page);

        switch (page) {

            case "sales":

                if (
                    typeof Sales !== "undefined" &&
                    typeof Sales.init === "function"
                ) {

                    return await Sales.init();

                }

                console.error(
                    "Sales module tidak tersedia."
                );

                break;

            case "report":

                if (
                    typeof Report !== "undefined" &&
                    typeof Report.init === "function"
                ) {

                    return await Report.init();

                }

                console.error(
                    "Report module tidak tersedia."
                );

                break;

            case "config":

                if (
                    typeof DatabaseConfig !== "undefined" &&
                    typeof DatabaseConfig.openModal === "function"
                ) {

                    return DatabaseConfig.openModal();

                }

                break;

            default:

                console.warn(
                    "Page tidak dikenal:",
                    page
                );

        }

    },


    /* ==================================
       LOGOUT
    ================================== */

    async logout() {

        try {

            const confirmed =
                await Dialog.confirm(
                    "Apakah Anda yakin ingin logout?",
                    {
                        title: "Konfirmasi Logout",
                        confirmText: "Ya, Logout",
                        cancelText: "Batal",
                        variant: "danger"
                    }
                );

            if (!confirmed) {
                return;
            }

            if (
                typeof Auth === "undefined" ||
                typeof Auth.logout !== "function"
            ) {

                throw new Error(
                    "Auth.logout tidak tersedia."
                );

            }

            await Auth.logout();

            document.documentElement.classList.add(
                "app-auth-checking"
            );

            if (
                typeof Loading !== "undefined" &&
                typeof Loading.show === "function"
            ) {

                Loading.show(
                    "Menyiapkan halaman login..."
                );

            }

            if (
                typeof Login === "undefined" ||
                typeof Login.init !== "function"
            ) {

                throw new Error(
                    "Login module tidak tersedia."
                );

            }

            await Login.init();

            document.documentElement.classList.remove(
                "app-auth-checking"
            );

        } catch (error) {

            document.documentElement.classList.remove(
                "app-auth-checking"
            );

            console.error(
                "APP LOGOUT ERROR:",
                error
            );

            if (
                typeof Dialog !== "undefined" &&
                typeof Dialog.error === "function"
            ) {

                Dialog.error(
                    error.message ||
                    "Terjadi kesalahan saat logout. Silakan coba kembali."
                );

            }

        } finally {

            if (
                typeof Loading !== "undefined" &&
                typeof Loading.hide === "function"
            ) {

                Loading.hide();

            }

        }

    },


    /* ==================================
       ACTIVE MENU
    ================================== */

    setActive(page) {

        const buttons =
            document.querySelectorAll(
                ".sidebar-desktop [data-page], " +
                ".sidebar-mobile [data-page]"
            );

        buttons.forEach(button => {

            button.classList.toggle(
                "active",
                button.dataset.page === page
            );

        });

    },


    /* ==================================
       PERSIAPAN APLIKASI
       SEBELUM VALIDASI LOGIN
    ================================== */

    async prepareApplication() {

        if (this.applicationPrepared) {

            return true;

        }

        /* ==================================
           SET ACTIVE YEAR
        ================================== */

        this.updateLoading(
            "Memeriksa konfigurasi database..."
        );

        if (
            typeof DatabaseConfig === "undefined" ||
            typeof DatabaseConfig.getConfig !== "function" ||
            typeof DatabaseConfig.setActiveYear !== "function"
        ) {

            throw new Error(
                "DatabaseConfig tidak tersedia atau belum lengkap."
            );

        }

        const currentYear =
            new Date().getFullYear();

        const databaseConfig =
            DatabaseConfig.getConfig();

        if (
            !databaseConfig ||
            Number(databaseConfig.activeYear) !== currentYear
        ) {

            DatabaseConfig.setActiveYear(
                currentYear
            );

        }

        /* ==================================
           DOWNLOAD DATABASE PENJUALAN
        ================================== */

        if (
            typeof Download === "undefined" ||
            typeof Download.download !== "function"
        ) {

            throw new Error(
                "Download database penjualan tidak tersedia."
            );

        }

        const isYearReady =
            typeof LocalDB !== "undefined" &&
            typeof LocalDB.isYearDownloaded === "function"
                ? await LocalDB.isYearDownloaded(currentYear)
                : false;

        let downloadError = null;

        if (navigator.onLine) {

            try {

                this.updateLoading(
                    "Mengunduh database penjualan..."
                );

                const downloadResult =
                    await Download.download(
                        currentYear
                    );

                if (
                    !downloadResult ||
                    downloadResult.success !== true
                ) {

                    downloadError =
                        new Error(
                            downloadResult?.message ||
                            "Download database penjualan gagal."
                        );

                }

            } catch (err) {

                downloadError = err;

            }

        } else {

            downloadError =
                new Error(
                    "Perangkat dalam kondisi offline."
                );

        }

        if (downloadError) {

            if (isYearReady) {

                console.warn(
                    "Download database penjualan dilewati / offline, menggunakan database lokal tahun " +
                    currentYear + ":",
                    downloadError.message || downloadError
                );

            } else {

                throw new Error(
                    "Database penjualan tahun " +
                    currentYear +
                    " belum tersedia di perangkat. Diperlukan koneksi internet untuk mengunduh data awal tahun ini."
                );

            }

        }

        /* ==================================
           INITIALIZE MODALS
        ================================== */

        this.updateLoading(
            "Menyiapkan komponen aplikasi..."
        );

        if (
            typeof UnitModal !== "undefined" &&
            typeof UnitModal.init === "function"
        ) {

            UnitModal.init();

        }

        if (
            typeof PaymentModal !== "undefined" &&
            typeof PaymentModal.init === "function"
        ) {

            PaymentModal.init();

        }

        /* ==================================
           CUSTOMER SCREEN
        ================================== */

        if (
            typeof CustScreen !== "undefined" &&
            typeof CustScreen.init === "function"
        ) {

            CustScreen.init();

        }

        /* ==================================
           LOCAL SYNC
        ================================== */

        if (
            typeof LocalSync !== "undefined" &&
            typeof LocalSync.startup === "function"
        ) {

            try {

                this.updateLoading(
                    "Menyinkronkan data..."
                );

                const syncResult =
                    await LocalSync.startup();

                if (
                    syncResult &&
                    syncResult.success
                ) {

                } else {

                    console.warn(
                        "BACKGROUND SYNC SELESAI DENGAN HASIL:",
                        syncResult
                    );

                }

            } catch (error) {

                console.error(
                    "BACKGROUND SYNC ERROR:",
                    error
                );

            }

        } else {

            console.warn(
                "LocalSync.startup tidak tersedia."
            );

        }

        this.applicationPrepared = true;

        return true;

    },


    /* ==================================
       BUKA APLIKASI SETELAH LOGIN
    ================================== */

    async startAuthenticatedApp() {

        if (this.authenticatedBootstrapRunning) {

            console.warn(
                "APP BOOTSTRAP SUDAH BERJALAN."
            );

            return;

        }

        this.authenticatedBootstrapRunning = true;

        const needsPreparation =
            !this.applicationPrepared;

        if (
            needsPreparation &&
            typeof Loading !== "undefined" &&
            typeof Loading.show === "function"
        ) {

            Loading.show(
                "Menyiapkan aplikasi..."
            );

        }

        try {

            /* ==================================
               PERSIAPKAN JIKA BELUM SELESAI
            ================================== */

            if (!this.applicationPrepared) {

                if (
                    typeof StoreConfig === "undefined" ||
                    typeof StoreConfig.load !== "function"
                ) {

                    throw new Error(
                        "StoreConfig tidak tersedia."
                    );

                }

                this.updateLoading(
                    "Memuat konfigurasi toko..."
                );

                await StoreConfig.load();

                this.refreshHeader();

                await this.prepareApplication();

            }

            /* ==================================
               REFRESH HEADER SETELAH LOGIN
            ================================== */

            this.refreshHeader();

            /* ==================================
               OPEN SALES
            ================================== */

            this.updateLoading(
                "Membuka halaman penjualan..."
            );

            await this.open("sales");

            document.documentElement.classList.remove(
                "app-auth-checking"
            );

        } catch (error) {

            console.error(
                "APP AUTHENTICATED BOOTSTRAP ERROR:",
                error
            );

            if (
                typeof Dialog !== "undefined" &&
                typeof Dialog.error === "function"
            ) {

                Dialog.error(
                    "Gagal menyiapkan aplikasi penjualan. " +
                    (error.message || "Terjadi kesalahan.")
                );

            }

        } finally {

            if (needsPreparation) {

                if (
                    typeof Loading !== "undefined" &&
                    typeof Loading.hide === "function"
                ) {

                    Loading.hide();

                }

            }

            this.authenticatedBootstrapRunning = false;

        }

    }

};


document.addEventListener(
    "DOMContentLoaded",
    () => {

        App.init();

    }
);