// ======================================
// TREEHOUSE POS
// GLOBAL LOADING
// FILE: js/loading.js
// ======================================

const Loading = {

    element: null,

    styleElement: null,

    counter: 0,

    initialized: false,

    // ==================================
    // INIT
    // ==================================

    init() {

        if (this.initialized) {
            return;
        }

        this.injectStyle();

        this.createElement();

        this.initialized = true;

    },

    // ==================================
    // STYLE
    // ==================================

    injectStyle() {

        if (
            document.getElementById(
                "treehouse-global-loading-style"
            )
        ) {
            return;
        }

        this.styleElement =
            document.createElement("style");

        this.styleElement.id =
            "treehouse-global-loading-style";

        this.styleElement.textContent = `

            .treehouse-loading-overlay {
                position: fixed;
                inset: 0;
                z-index: 2147483647;

                display: flex;
                align-items: center;
                justify-content: center;

                padding: 20px;

                background: rgba(15, 23, 42, 0.32);
                backdrop-filter: blur(3px);
                -webkit-backdrop-filter: blur(3px);

                opacity: 0;
                visibility: hidden;
                pointer-events: none;

                transition:
                    opacity 0.2s ease,
                    visibility 0.2s ease;
            }

            .treehouse-loading-overlay.is-visible {
                opacity: 1;
                visibility: visible;
                pointer-events: auto;
            }

            .treehouse-loading-card {
                width: 100%;
                max-width: 300px;

                display: flex;
                flex-direction: column;
                align-items: center;

                padding: 30px 24px;

                background:
                    linear-gradient(
                        145deg,
                        #ffffff 0%,
                        #f8fbfa 100%
                    );

                border: 1px solid #d6e2dd;
                border-radius: 20px;

                box-shadow:
                    0 20px 60px rgba(15, 23, 42, 0.16),
                    0 4px 12px rgba(15, 23, 42, 0.06);

                text-align: center;

                transform: translateY(8px) scale(0.98);

                transition:
                    transform 0.2s ease;
            }

            .treehouse-loading-overlay.is-visible
            .treehouse-loading-card {
                transform: translateY(0) scale(1);
            }

            .treehouse-loading-indicator {
                position: relative;

                width: 58px;
                height: 58px;

                display: flex;
                align-items: center;
                justify-content: center;

                margin-bottom: 20px;
            }

            .treehouse-loading-ring {
                position: absolute;
                inset: 0;

                border: 4px solid #d6f5e8;
                border-top-color: #10b981;
                border-right-color: #059669;

                border-radius: 50%;

                animation:
                    treehouse-loading-spin 0.85s
                    linear infinite;
            }

            .treehouse-loading-center {
                width: 13px;
                height: 13px;

                background: #10b981;
                border-radius: 50%;

                box-shadow:
                    0 0 0 6px rgba(16, 185, 129, 0.12);
            }

            .treehouse-loading-title {
                margin: 0;

                color: #17221e;

                font-family:
                    Inter,
                    system-ui,
                    -apple-system,
                    BlinkMacSystemFont,
                    "Segoe UI",
                    sans-serif;

                font-size: 16px;
                font-weight: 700;
                line-height: 1.5;
            }

            .treehouse-loading-message {
                margin: 7px 0 0;

                color: #68766f;

                font-family:
                    Inter,
                    system-ui,
                    -apple-system,
                    BlinkMacSystemFont,
                    "Segoe UI",
                    sans-serif;

                font-size: 13px;
                font-weight: 400;
                line-height: 1.6;

                overflow-wrap: anywhere;
            }

            .treehouse-loading-progress {
                width: 100%;
                height: 4px;

                margin-top: 22px;

                overflow: hidden;

                background: #e4eee9;
                border-radius: 999px;
            }

            .treehouse-loading-progress-bar {
                width: 38%;
                height: 100%;

                background:
                    linear-gradient(
                        90deg,
                        #10b981,
                        #34d399
                    );

                border-radius: 999px;

                animation:
                    treehouse-loading-progress 1.4s
                    ease-in-out infinite;
            }

            @keyframes treehouse-loading-spin {
                to {
                    transform: rotate(360deg);
                }
            }

            @keyframes treehouse-loading-progress {
                0% {
                    transform: translateX(-110%);
                }

                100% {
                    transform: translateX(370%);
                }
            }

            @media (max-width: 768px) {

                .treehouse-loading-card {
                    max-width: 270px;
                    padding: 26px 22px;
                    border-radius: 18px;
                }

                .treehouse-loading-indicator {
                    width: 52px;
                    height: 52px;
                    margin-bottom: 18px;
                }

                .treehouse-loading-title {
                    font-size: 15px;
                }

                .treehouse-loading-message {
                    font-size: 12px;
                }

            }

            @media (prefers-reduced-motion: reduce) {

                .treehouse-loading-ring,
                .treehouse-loading-progress-bar {
                    animation-duration: 3s;
                }

                .treehouse-loading-overlay,
                .treehouse-loading-card {
                    transition: none;
                }

            }

        `;

        document.head.appendChild(
            this.styleElement
        );

    },

    // ==================================
    // CREATE ELEMENT
    // ==================================

    createElement() {

        if (
            document.getElementById(
                "treehouse-global-loading"
            )
        ) {

            this.element =
                document.getElementById(
                    "treehouse-global-loading"
                );

            return;

        }

        this.element =
            document.createElement("div");

        this.element.id =
            "treehouse-global-loading";

        this.element.className =
            "treehouse-loading-overlay";

        this.element.setAttribute(
            "role",
            "status"
        );

        this.element.setAttribute(
            "aria-live",
            "polite"
        );

        this.element.setAttribute(
            "aria-atomic",
            "true"
        );

        this.element.setAttribute(
            "aria-hidden",
            "true"
        );

        this.element.innerHTML = `

            <div class="treehouse-loading-card">

                <div
                    class="treehouse-loading-indicator"
                    aria-hidden="true"
                >

                    <div
                        class="treehouse-loading-ring"
                    ></div>

                    <div
                        class="treehouse-loading-center"
                    ></div>

                </div>

                <h3
                    class="treehouse-loading-title"
                    id="treehouse-loading-title"
                >
                    Memproses...
                </h3>

                <p
                    class="treehouse-loading-message"
                    id="treehouse-loading-message"
                >
                    Mohon tunggu sebentar.
                </p>

                <div
                    class="treehouse-loading-progress"
                    aria-hidden="true"
                >

                    <div
                        class="treehouse-loading-progress-bar"
                    ></div>

                </div>

            </div>

        `;

        document.body.appendChild(
            this.element
        );

    },

    // ==================================
    // SHOW
    // ==================================

    show(
        message = "Mohon tunggu sebentar.",
        title = "Memproses..."
    ) {

        this.init();

        this.counter++;

        const titleElement =
            document.getElementById(
                "treehouse-loading-title"
            );

        const messageElement =
            document.getElementById(
                "treehouse-loading-message"
            );

        if (titleElement) {

            titleElement.textContent =
                title;

        }

        if (messageElement) {

            messageElement.textContent =
                message;

        }

        this.element.classList.add(
            "is-visible"
        );

        this.element.setAttribute(
            "aria-hidden",
            "false"
        );

    },

    // ==================================
    // UPDATE MESSAGE
    // ==================================

    update(
        message,
        title
    ) {

        this.init();

        const titleElement =
            document.getElementById(
                "treehouse-loading-title"
            );

        const messageElement =
            document.getElementById(
                "treehouse-loading-message"
            );

        if (
            title &&
            titleElement
        ) {

            titleElement.textContent =
                title;

        }

        if (
            message &&
            messageElement
        ) {

            messageElement.textContent =
                message;

        }

    },

    // ==================================
    // HIDE
    // ==================================

    hide() {

        if (!this.element) {
            return;
        }

        this.counter = Math.max(
            0,
            this.counter - 1
        );

        if (this.counter > 0) {
            return;
        }

        this.element.classList.remove(
            "is-visible"
        );

        this.element.setAttribute(
            "aria-hidden",
            "true"
        );

    },

    // ==================================
    // RESET
    // ==================================

    reset() {

        this.counter = 0;

        if (!this.element) {
            return;
        }

        this.element.classList.remove(
            "is-visible"
        );

        this.element.setAttribute(
            "aria-hidden",
            "true"
        );

    },

    // ==================================
    // WRAP ASYNC PROCESS
    // ==================================

    async run(
        callback,
        message = "Mohon tunggu sebentar.",
        title = "Memproses..."
    ) {

        this.show(
            message,
            title
        );

        try {

            return await callback();

        } finally {

            this.hide();

        }

    }

};

// ======================================
// AUTO INITIALIZE
// ======================================

if (document.readyState === "loading") {

    document.addEventListener(
        "DOMContentLoaded",
        () => Loading.init(),
        { once: true }
    );

} else {

    Loading.init();

}