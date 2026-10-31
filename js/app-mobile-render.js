/* ======================================
   TREEHOUSE POS
   APP MOBILE RENDER
====================================== */

const AppMobileRender = {

    /* ==================================
       MOBILE NAVIGATION
    ================================== */

    renderNavigation() {

        return `

            <div class="sidebar-mobile">

                <button
                    type="button"
                    class="sidebar-mobile-toggle"
                    aria-label="Buka menu navigasi"
                    aria-expanded="false"
                    aria-controls="sidebarMobileMenu"
                >
                    <span></span>
                    <span></span>
                    <span></span>
                </button>

                <div
                    class="sidebar-mobile-menu"
                    id="sidebarMobileMenu"
                    hidden
                >

                    <button
                        type="button"
                        class="sidebar-mobile-item"
                        data-page="sales"
                    >
                        <span class="sidebar-mobile-icon">
                            🛒
                        </span>

                        <span class="sidebar-mobile-label">
                            Kasir
                        </span>
                    </button>

                    <button
                        type="button"
                        class="sidebar-mobile-item"
                        data-page="report"
                    >
                        <span class="sidebar-mobile-icon">
                            📊
                        </span>

                        <span class="sidebar-mobile-label">
                            Report
                        </span>
                    </button>

                    <button
                        type="button"
                        class="sidebar-mobile-item"
                        data-action="logout"
                    >
                        <span class="sidebar-mobile-icon">
                            ⎋
                        </span>

                        <span class="sidebar-mobile-label">
                            Logout
                        </span>
                    </button>

                </div>

            </div>

        `;

    },


    /* ======================================
       RENDER
    ====================================== */

    render() {

        return `
            ${this.renderNavigation()}
        `;

    }

};


/* ======================================
   MOBILE MENU EVENTS
====================================== */

document.addEventListener("click", function (event) {

    const toggle = event.target.closest(
        ".sidebar-mobile-toggle"
    );

    const menuContainer = document.querySelector(
        ".sidebar-mobile"
    );

    if (!menuContainer) {
        return;
    }

    const menu = menuContainer.querySelector(
        ".sidebar-mobile-menu"
    );

    const button = menuContainer.querySelector(
        ".sidebar-mobile-toggle"
    );

    if (!menu || !button) {
        return;
    }

    if (toggle) {

        const isOpen =
            button.getAttribute("aria-expanded") === "true";

        button.setAttribute(
            "aria-expanded",
            String(!isOpen)
        );

        button.setAttribute(
            "aria-label",
            isOpen
                ? "Buka menu navigasi"
                : "Tutup menu navigasi"
        );

        menu.hidden = isOpen;

        menuContainer.classList.toggle(
            "menu-open",
            !isOpen
        );

        return;
    }

    if (
        !event.target.closest(".sidebar-mobile-menu") ||
        event.target.closest(
            ".sidebar-mobile-item"
        )
    ) {

        menu.hidden = true;

        button.setAttribute(
            "aria-expanded",
            "false"
        );

        button.setAttribute(
            "aria-label",
            "Buka menu navigasi"
        );

        menuContainer.classList.remove(
            "menu-open"
        );

    }

});