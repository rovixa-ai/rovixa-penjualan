// ======================================
// TREEHOUSE POS
// SALES
// RENDER SELECTOR
// RESPONSIVE TANPA RELOAD
// ======================================

Object.assign(
    Sales,
    {

        /* ==================================
           STATUS RENDER
        ================================== */

        currentRenderMode: null,

        renderResizeHandler: null,

        renderResizeTimer: null,

        renderObserver: null,


        /* ==================================
           DETEKSI MODE TAMPILAN
        ================================== */

        getRenderMode() {

            const isMobile =
                window.innerWidth <= 768;

            const isPortrait =
                window.matchMedia(
                    "(orientation: portrait)"
                ).matches;

            if (isMobile && isPortrait) {
                return "mobile";
            }

            return "desktop";

        },


        /* ==================================
           RENDER HALAMAN SALES
        ================================== */

        render() {

            const container =
                document.getElementById(
                    "pageContent"
                );

            if (!container) {

                console.error(
                    "pageContent tidak ditemukan."
                );

                return;

            }

            const renderMode =
                this.getRenderMode();

            let html = "";

            if (renderMode === "mobile") {

                if (
                    typeof SalesMobileRender ===
                    "undefined"
                ) {

                    console.error(
                        "SalesMobileRender tidak tersedia."
                    );

                    return;

                }

                html =
                    SalesMobileRender.render();

            } else {

                if (
                    typeof SalesDesktopRender ===
                    "undefined"
                ) {

                    console.error(
                        "SalesDesktopRender tidak tersedia."
                    );

                    return;

                }

                html =
                    SalesDesktopRender.render();

            }

            container.innerHTML = html;

            this.currentRenderMode =
                renderMode;

            if (
                typeof this.renderProducts ===
                "function"
            ) {

                this.renderProducts();

            }

            if (
                typeof Cart !== "undefined" &&
                typeof Cart.render === "function"
            ) {

                Cart.render();

            }

            if (
                typeof this.event === "function"
            ) {

                this.event();

            }

            if (
                typeof Cart !== "undefined" &&
                typeof Cart.event === "function"
            ) {

                Cart.event();

            }

        },


        /* ==================================
           PANTAU PERUBAHAN MODE
           TANPA RELOAD HALAMAN
        ================================== */

        watchRenderMode() {

            if (this.renderResizeHandler) {

                window.removeEventListener(
                    "resize",
                    this.renderResizeHandler
                );

                window.removeEventListener(
                    "orientationchange",
                    this.renderResizeHandler
                );

            }

            if (this.renderResizeTimer !== null) {

                clearTimeout(
                    this.renderResizeTimer
                );

                this.renderResizeTimer = null;

            }

            this.currentRenderMode =
                this.getRenderMode();

            this.renderResizeHandler = () => {

                if (
                    this.renderResizeTimer !== null
                ) {

                    clearTimeout(
                        this.renderResizeTimer
                    );

                }

                this.renderResizeTimer =
                    setTimeout(() => {

                        this.renderResizeTimer = null;

                        const nextMode =
                            this.getRenderMode();

                        if (
                            nextMode ===
                            this.currentRenderMode
                        ) {

                            return;

                        }

                        this.render();

                    }, 200);

            };

            window.addEventListener(
                "resize",
                this.renderResizeHandler
            );

            window.addEventListener(
                "orientationchange",
                this.renderResizeHandler
            );

        }

    }
);