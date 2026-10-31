// ======================================
// SALES MODULE
// TREEHOUSE POS
// ======================================

const Sales = {

    /* ==================================
       DATA
    ================================== */

    products: [],


    /* ==================================
       CART
    ================================== */

    cart: [],


    /* ==================================
       DISCOUNT
    ================================== */

    discount: 0,


    /* ==================================
       INIT
    ================================== */

    init() {

        this.render();

        this.event();

        this.loadProducts();

        Cart.init();

        this.watchRenderMode();

    },


    /* ==================================
       RENDER MODE
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
       WATCH ORIENTATION
       TANPA RELOAD HALAMAN
    ================================== */

    watchRenderMode() {

        if (this.renderModeMedia) {

            this.renderModeMedia.removeEventListener(
                "change",
                this.renderModeHandler
            );

        }

        if (this.renderModeHandler) {

            window.removeEventListener(
                "resize",
                this.renderModeHandler
            );

            window.removeEventListener(
                "orientationchange",
                this.renderModeHandler
            );

        }

        if (this.renderModeTimer !== null &&
            this.renderModeTimer !== undefined) {

            clearTimeout(
                this.renderModeTimer
            );

        }

        this.currentRenderMode =
            this.getRenderMode();

        this.renderModeTimer = null;

        this.renderModeHandler = () => {

            if (this.renderModeTimer !== null) {

                clearTimeout(
                    this.renderModeTimer
                );

            }

            this.renderModeTimer =
                setTimeout(() => {

                    this.renderModeTimer = null;

                    const nextMode =
                        this.getRenderMode();

                    if (
                        nextMode ===
                        this.currentRenderMode
                    ) {
                        return;
                    }

                    this.currentRenderMode =
                        nextMode;

                    this.render();

                    this.event();

                    if (
                        typeof Cart !== "undefined" &&
                        typeof Cart.render === "function"
                    ) {
                        Cart.render();
                    }

                    if (
                        typeof Cart !== "undefined" &&
                        typeof Cart.event === "function"
                    ) {
                        Cart.event();
                    }

                }, 200);

        };

        window.addEventListener(
            "resize",
            this.renderModeHandler
        );

        window.addEventListener(
            "orientationchange",
            this.renderModeHandler
        );

    }

};