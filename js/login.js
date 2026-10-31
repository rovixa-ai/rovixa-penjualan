// ======================================
// TREEHOUSE POS
// LOGIN KASIR
// ======================================

const Login = {

    /* ==================================
       INIT
    ================================== */

    async init() {

      

        try {

            await this.prepareUsers();

            this.render();

            this.event();

        } catch (error) {

            console.error(
                "LOGIN INIT ERROR:",
                error
            );

            this.render();

            this.showMessage(
                error.message ||
                "Gagal menyiapkan login."
            );

        }

    },


    /* ==================================
       PREPARE USERS
    ================================== */

    async prepareUsers() {

        if (typeof LocalDB === "undefined") {
            throw new Error("LocalDB tidak tersedia.");
        }

        let users = await LocalDB.getAll("users");

        if (Array.isArray(users) && users.length) {
            return users;
        }

        if (
            typeof DownloadUsers !== "undefined" &&
            typeof DownloadUsers.download === "function"
        ) {

            const result = await DownloadUsers.download();

            if (!result || result.success !== true) {
                throw new Error(
                    result?.message ||
                    "Data user belum tersedia."
                );
            }

            users = await LocalDB.getAll("users");

        }

        if (!Array.isArray(users) || !users.length) {
            throw new Error("Data user kasir belum tersedia.");
        }

        return users;

    },


    /* ==================================
       STORE INFORMATION
    ================================== */

    getStoreInfo() {

        let storeName = "Treehouse POS";
        let logo = "";

        if (
            typeof StoreConfig !== "undefined"
        ) {

            if (
                typeof StoreConfig.getStoreName === "function"
            ) {

                storeName =
                    StoreConfig.getStoreName() ||
                    storeName;

            }

            if (
                typeof StoreConfig.getLogo === "function"
            ) {

                logo =
                    StoreConfig.getLogo() || "";

            }

        }

        return {
            storeName,
            logo
        };

    },


    /* ==================================
       RENDER
    ================================== */

    render() {

        const container =
            document.getElementById("pageContent");

        if (!container) {
            console.error("pageContent tidak ditemukan.");
            return;
        }

        const store = this.getStoreInfo();

        const storeName = this.escapeHTML(
            store.storeName
        );

        const logoContent = store.logo
            ? `
                <img
                    src="${this.escapeHTML(store.logo)}"
                    alt="Logo ${storeName}"
                    onerror="this.style.display='none';this.nextElementSibling.style.display='flex';"
                >
                <span style="display:none;">
                    ${this.escapeHTML(
                        String(store.storeName).charAt(0).toUpperCase()
                    )}
                </span>
            `
            : `
                <span>
                    ${this.escapeHTML(
                        String(store.storeName).charAt(0).toUpperCase()
                    )}
                </span>
            `;

        container.innerHTML = `

            <div
                class="login-page"
                id="loginPage"
            >

                <div class="login-card">

                    <div class="login-logo">
                        ${logoContent}
                    </div>

                    <div class="login-header">

                        <h1>
                            ${storeName}
                        </h1>

                        <p>Login Kasir</p>

                    </div>

                    <form
                        class="login-form"
                        id="loginForm"
                        autocomplete="off"
                    >

                        <div class="login-field">

                            <label for="loginUsername">
                                Username
                            </label>

                            <input
                                type="text"
                                id="loginUsername"
                                name="username"
                                placeholder="Masukkan username"
                                autocomplete="username"
                                spellcheck="false"
                                autocapitalize="off"
                            >

                        </div>

                        <div class="login-field">

                            <label for="loginPIN">
                                PIN
                            </label>

                            <input
                                type="password"
                                id="loginPIN"
                                name="pin"
                                placeholder="Masukkan PIN"
                                inputmode="numeric"
                                autocomplete="current-password"
                                maxlength="20"
                            >

                        </div>

                        <div
                            class="login-message"
                            id="loginMessage"
                            hidden
                        ></div>

                        <button
                            type="submit"
                            class="login-button"
                            id="loginButton"
                        >
                            LOGIN
                        </button>

                    </form>

                </div>

            </div>

        `;

    },


    /* ==================================
       ESCAPE HTML
    ================================== */

    escapeHTML(value) {

        return String(value ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#39;");

    },


    /* ==================================
       EVENT
    ================================== */

    event() {

        const form =
            document.getElementById("loginForm");

        const username =
            document.getElementById("loginUsername");

        const pin =
            document.getElementById("loginPIN");

        if (!form) {
            return;
        }

        form.addEventListener(
            "submit",
            async event => {

                event.preventDefault();

                await this.submit();

            }
        );

        if (pin) {

            pin.addEventListener(
                "input",
                () => {

                    pin.value = pin.value.replace(/\D/g, "");

                }
            );

        }

        if (username) {

            setTimeout(() => {
                username.focus();
            }, 50);

        }

    },


    /* ==================================
       SUBMIT
    ================================== */

    async submit() {

        const username =
            document.getElementById("loginUsername");

        const pin =
            document.getElementById("loginPIN");

        const button =
            document.getElementById("loginButton");

        if (!username || !pin) {
            return;
        }

        const usernameValue = username.value.trim();
        const pinValue = pin.value.trim();

        this.clearMessage();

        if (!usernameValue) {

            this.showMessage("Username belum diisi.");

            username.focus();

            return;

        }

        if (!pinValue) {

            this.showMessage("PIN belum diisi.");

            pin.focus();

            return;

        }

        if (button) {

            button.disabled = true;
            button.textContent = "Memeriksa...";

        }

        try {

            if (typeof Auth === "undefined") {
                throw new Error("Auth tidak tersedia.");
            }

            const result = await Auth.login(
                usernameValue,
                pinValue
            );

            if (!result || result.success !== true) {
                throw new Error(
                    result?.message ||
                    "Username atau PIN tidak valid."
                );
            }


            /*
             * PERSIAPAN APLIKASI SUDAH DILAKUKAN
             * SEBELUM LOGIN.
             *
             * Panggil alur pembukaan aplikasi agar
             * App tidak melakukan download dan
             * sinkronisasi ulang.
             */

            if (
                typeof App !== "undefined" &&
                typeof App.startAuthenticatedApp === "function"
            ) {

                await App.startAuthenticatedApp();

                return;

            }

            /*
             * Fallback jika App.startAuthenticatedApp
             * tidak tersedia.
             */

            if (
                typeof Router !== "undefined" &&
                typeof Router.go === "function"
            ) {

                Router.go("penjualan");

                return;

            }

            throw new Error(
                "Fungsi untuk membuka aplikasi tidak tersedia."
            );

        } catch (error) {

            console.error("LOGIN ERROR:", error);

            this.showMessage(
                error.message || "Login gagal."
            );

            const currentPin =
                document.getElementById("loginPIN");

            if (currentPin) {

                currentPin.value = "";
                currentPin.focus();

            }

        } finally {

            const currentButton =
                document.getElementById("loginButton");

            if (currentButton) {

                currentButton.disabled = false;
                currentButton.textContent = "LOGIN";

            }

        }

    },


    /* ==================================
       SHOW MESSAGE
    ================================== */

    showMessage(message) {

        const element =
            document.getElementById("loginMessage");

        if (!element) {
            return;
        }

        element.textContent = message || "";
        element.hidden = false;

    },


    /* ==================================
       CLEAR MESSAGE
    ================================== */

    clearMessage() {

        const element =
            document.getElementById("loginMessage");

        if (!element) {
            return;
        }

        element.textContent = "";
        element.hidden = true;

    }

};