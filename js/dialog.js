
/* ======================================
   TREEHOUSE POS
   GLOBAL DIALOG & NOTIFICATION
====================================== */

const Dialog = {

    root: null,
    overlay: null,
    titleElement: null,
    messageElement: null,
    cancelButton: null,
    confirmButton: null,
    iconElement: null,
    toastContainer: null,

    initialized: false,
    activeDialog: null,
    queue: [],
    toastCounter: 0,

    // ==================================
    // INIT
    // ==================================

    init() {

        if (this.initialized) {
            return;
        }

        this.createElement();
        this.bindEvents();

        this.initialized = true;

        this.processQueue();

    },

    // ==================================
    // CREATE ELEMENT
    // ==================================

    createElement() {

        if (document.getElementById("treehouseDialogRoot")) {

            this.root =
                document.getElementById("treehouseDialogRoot");

            return;

        }

        this.root = document.createElement("div");

        this.root.id = "treehouseDialogRoot";

        this.root.innerHTML = `
            <div
                class="th-dialog-overlay"
                id="thDialogOverlay"
                hidden
            >
                <section
                    class="th-dialog"
                    id="thDialog"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="thDialogTitle"
                    aria-describedby="thDialogMessage"
                    tabindex="-1"
                >
                    <div
                        class="th-dialog-icon"
                        id="thDialogIcon"
                        aria-hidden="true"
                    ></div>

                    <div class="th-dialog-content">

                        <h2
                            class="th-dialog-title"
                            id="thDialogTitle"
                        ></h2>

                        <p
                            class="th-dialog-message"
                            id="thDialogMessage"
                        ></p>

                    </div>

                    <div class="th-dialog-actions">

                        <button
                            type="button"
                            class="th-dialog-button th-dialog-cancel"
                            id="thDialogCancel"
                        >
                            Batal
                        </button>

                        <button
                            type="button"
                            class="th-dialog-button th-dialog-confirm"
                            id="thDialogConfirm"
                        >
                            OK
                        </button>

                    </div>

                </section>
            </div>

            <div
                class="th-toast-container"
                id="thToastContainer"
                aria-live="polite"
                aria-atomic="false"
            ></div>
        `;

        document.body.appendChild(this.root);

        this.overlay =
            this.root.querySelector("#thDialogOverlay");

        this.titleElement =
            this.root.querySelector("#thDialogTitle");

        this.messageElement =
            this.root.querySelector("#thDialogMessage");

        this.cancelButton =
            this.root.querySelector("#thDialogCancel");

        this.confirmButton =
            this.root.querySelector("#thDialogConfirm");

        this.iconElement =
            this.root.querySelector("#thDialogIcon");

        this.toastContainer =
            this.root.querySelector("#thToastContainer");

    },

    // ==================================
    // EVENTS
    // ==================================

    bindEvents() {

        this.cancelButton.onclick = () => {
            this.finishDialog(false);
        };

        this.confirmButton.onclick = () => {
            this.finishDialog(true);
        };

        this.overlay.addEventListener(
            "click",
            event => {

                if (event.target === this.overlay) {

                    if (this.activeDialog?.type === "confirm") {
                        this.finishDialog(false);
                    }

                }

            }
        );

        this.overlay.addEventListener(
            "keydown",
            event => {

                if (!this.activeDialog) {
                    return;
                }

                if (event.key === "Escape") {

                    event.preventDefault();

                    if (this.activeDialog.type === "confirm") {
                        this.finishDialog(false);
                    }

                    return;

                }

                if (event.key === "Enter") {

                    if (
                        event.target === this.cancelButton
                    ) {
                        return;
                    }

                    event.preventDefault();

                    this.finishDialog(true);

                }

                if (event.key === "Tab") {

                    const focusable = [
                        this.cancelButton,
                        this.confirmButton
                    ];

                    const first = focusable[0];
                    const last = focusable[1];

                    if (
                        event.shiftKey &&
                        document.activeElement === first
                    ) {

                        event.preventDefault();
                        last.focus();

                    } else if (
                        !event.shiftKey &&
                        document.activeElement === last
                    ) {

                        event.preventDefault();
                        first.focus();

                    }

                }

            }
        );

    },

    // ==================================
    // ENSURE INITIALIZED
    // ==================================

    ensureInit() {

        if (this.initialized) {
            return;
        }

        if (document.body) {

            this.init();

        } else {

            throw new Error(
                "Dialog harus dipanggil setelah document.body tersedia."
            );

        }

    },

    // ==================================
    // CONFIRM
    // ==================================

    confirm(message, options = {}) {

        return this.show({

            type: "confirm",

            title:
                options.title ||
                "Konfirmasi",

            message:
                message ?? "",

            confirmText:
                options.confirmText ||
                "Ya, Lanjutkan",

            cancelText:
                options.cancelText ||
                "Batal",

            variant:
                options.variant ||
                "default"

        });

    },

    // ==================================
    // ALERT
    // ==================================

    alert(message, options = {}) {

        return this.show({

            type: "alert",

            title:
                options.title ||
                "Informasi",

            message:
                message ?? "",

            confirmText:
                options.confirmText ||
                "Mengerti",

            cancelText: "",

            variant:
                options.variant ||
                "info"

        });

    },

    // ==================================
    // SHOW DIALOG
    // ==================================

    show(config) {

        this.ensureInit();

        return new Promise(resolve => {

            this.queue.push({
                ...config,
                resolve
            });

            this.processQueue();

        });

    },

    // ==================================
    // PROCESS QUEUE
    // ==================================

    processQueue() {

        if (
            this.activeDialog ||
            !this.queue.length
        ) {
            return;
        }

        const config = this.queue.shift();

        this.activeDialog = config;

        this.titleElement.textContent =
            String(config.title);

        this.messageElement.textContent =
            String(config.message);

        this.confirmButton.textContent =
            config.confirmText;

        this.cancelButton.textContent =
            config.cancelText || "Batal";

        this.cancelButton.hidden =
            config.type !== "confirm";

        this.confirmButton.classList.toggle(
            "is-danger",
            config.variant === "danger"
        );

        this.confirmButton.classList.toggle(
            "is-success",
            config.variant === "success"
        );

        this.iconElement.className =
            "th-dialog-icon";

        const icons = {
            confirm: "?",
            alert: "i",
            info: "i",
            success: "✓",
            warning: "!",
            danger: "!"
        };

        const iconType =
            config.variant === "default"
                ? config.type
                : config.variant;

        this.iconElement.textContent =
            icons[iconType] || "i";

        this.iconElement.classList.add(
            `is-${iconType}`
        );

        this.overlay.hidden = false;

        document.body.classList.add(
            "th-dialog-open"
        );

        requestAnimationFrame(() => {

            if (this.activeDialog) {

                this.confirmButton.focus();

            }

        });

    },

    // ==================================
    // FINISH DIALOG
    // ==================================

    finishDialog(result) {

        if (!this.activeDialog) {
            return;
        }

        const dialog = this.activeDialog;

        this.activeDialog = null;

        this.overlay.hidden = true;

        document.body.classList.remove(
            "th-dialog-open"
        );

        dialog.resolve(
            Boolean(result)
        );

        this.processQueue();

    },

    // ==================================
    // NOTIFICATION / TOAST
    // ==================================

    notify(message, type = "success", duration = 3000) {

        this.ensureInit();

        const allowedTypes = [
            "success",
            "error",
            "warning",
            "info"
        ];

        if (!allowedTypes.includes(type)) {
            type = "info";
        }

        const toast = document.createElement("div");

        toast.className =
            `th-toast is-${type}`;

        toast.setAttribute("role", "status");

        const icon = document.createElement("span");

        icon.className = "th-toast-icon";

        icon.textContent = {
            success: "✓",
            error: "!",
            warning: "!",
            info: "i"
        }[type];

        const text = document.createElement("span");

        text.className = "th-toast-message";
        text.textContent = String(message ?? "");

        const close = document.createElement("button");

        close.type = "button";
        close.className = "th-toast-close";
        close.textContent = "×";
        close.setAttribute("aria-label", "Tutup notifikasi");

        toast.append(icon, text, close);

        this.toastContainer.appendChild(toast);

        this.toastCounter++;

        const removeToast = () => {

            if (!toast.isConnected) {
                return;
            }

            toast.classList.add("is-hiding");

            toast.addEventListener(
                "transitionend",
                () => toast.remove(),
                { once: true }
            );

            setTimeout(() => toast.remove(), 300);

        };

        close.onclick = removeToast;

        if (Number(duration) > 0) {

            setTimeout(
                removeToast,
                Number(duration)
            );

        }

        return toast;

    },

    // ==================================
    // SHORTCUTS
    // ==================================

    success(message, duration = 3000) {

        return this.notify(
            message,
            "success",
            duration
        );

    },

    error(message, duration = 4000) {

        return this.notify(
            message,
            "error",
            duration
        );

    },

    warning(message, duration = 4000) {

        return this.notify(
            message,
            "warning",
            duration
        );

    },

    info(message, duration = 3000) {

        return this.notify(
            message,
            "info",
            duration
        );

    }

};

// ======================================
// AUTO INIT
// ======================================

if (document.readyState === "loading") {

    document.addEventListener(
        "DOMContentLoaded",
        () => Dialog.init(),
        { once: true }
    );

} else {

    Dialog.init();

}
