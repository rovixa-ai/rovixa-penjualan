// ======================================
// TREEHOUSE POS
// SALES
// DESKTOP RENDER
// ======================================

const SalesDesktopRender = {

    render() {

        const logo =
            StoreConfig.getLogo() || "";

        const storeName =
            StoreConfig.getStoreName() ||
            "Treehouse POS";

        const logoHtml = logo
            ? `<img src="${logo}" alt="Logo Toko">`
            : "T";

        let kasirName = "ADMIN";

        if (
            typeof Auth !== "undefined" &&
            typeof Auth.getCurrentUser === "function"
        ) {

            const currentUser =
                Auth.getCurrentUser();

            if (currentUser) {

                kasirName = String(
                    currentUser.nama ||
                    currentUser.username ||
                    "ADMIN"
                ).trim();

            }

        }

        return `

            <div class="pos sales-desktop-page">

                <!-- ==============================
                     HEADER
                ============================== -->

                <header class="sales-desktop-header">

                    <div class="sales-desktop-brand">

                        <div class="sales-desktop-logo">
                            ${logoHtml}
                        </div>

                        <div class="sales-desktop-title">

                            <strong id="storeName">
                                ${storeName}
                            </strong>

                            <span>
                                Penjualan / Kasir
                            </span>

                        </div>

                    </div>

                    <div class="sales-desktop-user">

                        <button
                            type="button"
                            class="sidebar-desktop-item"
                            data-page="report"
                        >
                            <span>📊</span>
                            <span>Report</span>
                        </button>

                        <button
                            type="button"
                            id="customerScreenButton"
                            class="sales-desktop-customer-button"
                        >
                            Customer Screen
                        </button>
                        
                        <span>Kasir:</span>

                        <span
                            id="salesKasirName"
                            class="sales-desktop-user-name"
                        >
                            ${kasirName}
                        </span>

                        <button
                            type="button"
                            class="sidebar-desktop-logout"
                            data-action="logout"
                        >
                            <img
                                src="icons/logout.png"
                                alt="Logout"
                            >
                            <span>Logout</span>
                        </button>

                    </div>

                </header>

                <!-- ==============================
                     MAIN
                ============================== -->

                <main class="sales-desktop-main">

                    <!-- ==============================
                         PRODUCT PANEL
                    ============================== -->

                    <section
                        class="sales-desktop-product-panel"
                    >

                       <div class="sales-desktop-search-area">

                            <div class="sales-desktop-search-wrapper">

                                <input
                                    type="text"
                                    id="searchProduct"
                                    class="sales-desktop-search-input"
                                    placeholder="Cari kode, barcode, atau nama barang..."
                                    autocomplete="off"
                                >

                                <button
                                    type="button"
                                    id="cameraButton"
                                    class="sales-desktop-camera-button"
                                    aria-label="Scan barcode"
                                    title="Scan barcode"
                                >
                                    <img
                                        src="icons/camera.png"
                                        alt="Scan barcode"
                                    >
                                </button>

                            </div>

                        </div>

                        <div class="sales-desktop-product-header">

                            <div class="sales-desktop-product-title">

                                <h3>Daftar Barang</h3>

                                <button
                                    type="button"
                                    id="sales-reload-stock"
                                    class="sales-reload-stock-btn"
                                    title="Reload stok barang"
                                    aria-label="Reload stok barang"
                                >
                                <img
                                    src="icons/reload.png"
                                    alt="Scan barcode"
                                >
                                </button>

                            </div>

                            <span id="productCount">
                                0 barang
                            </span>

                        </div>

                        <div
                            id="productList"
                            class="sales-desktop-product-list"
                        ></div>

                    </section>

                    <!-- ==============================
                         CART PANEL
                    ============================== -->

                    <aside
                        id="cartPanel"
                        class="sales-desktop-cart-panel"
                    >

                        <div
                            class="sales-desktop-cart-header"
                        >

                            <img
                                src="icons/cart.png"
                                alt="Cart"
                            >

                            <span id="cartCount">
                                0 item
                            </span>

                        </div>

                        <div
                            id="cartItems"
                            class="sales-desktop-cart-items"
                        ></div>

                        <!-- ==========================
                             SUMMARY
                        ========================== -->

                        <div
                            class="sales-desktop-cart-summary"
                        >

                            <div
                                class="sales-desktop-summary-row"
                            >

                                <span>Subtotal</span>

                                <strong id="subtotal">
                                    Rp 0
                                </strong>

                            </div>

                            <div
                                class="sales-desktop-summary-row"
                            >

                                <span>Disc</span>

                                <input
                                    type="text"
                                    id="discount"
                                    class="sales-desktop-discount-input"
                                    value=""
                                    inputmode="numeric"
                                    autocomplete="off"
                                    placeholder="0"
                                >

                            </div>

                            <div
                                class="sales-desktop-total-row"
                            >

                                <strong>TOTAL</strong>

                                <strong id="total">
                                    Rp 0
                                </strong>

                            </div>

                        </div>

                        <!-- ==========================
                             PAYMENT
                        ========================== -->

                        <div
                            class="sales-desktop-payment-area"
                        >

                            <button
                                type="button"
                                id="paymentButton"
                                class="sales-desktop-payment-button"
                                disabled
                            >
                                BAYAR
                            </button>

                        </div>

                    </aside>

                </main>

            </div>

        `;

    }

};