// ======================================
// TREEHOUSE POS
// SALES
// MOBILE RENDER
// ======================================
const SalesMobileRender = {
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

        <div class="pos sales-mobile-page">

            <!-- ==============================
                 HEADER
            ============================== -->

            <header class="sales-mobile-header">

                <div class="sales-mobile-brand">

                    <button
                        type="button"
                        class="sales-mobile-logo"
                        id="floatingMenuButton"
                        aria-label="Buka menu"
                    >
                        ${logoHtml}
                    </button>

                    <div class="sales-mobile-title">

                        <strong id="storeName">
                            ${storeName}
                        </strong>

                        <span>
                            Penjualan / Kasir
                        </span>

                    </div>

                        <span
                            id="salesKasirName"
                            class="sales-mobile-user-name"
                        >
                            ${kasirName}
                        </span>

                    <button
                        type="button"
                        class="sidebar-mobile-item"
                        data-action="logout"
                    >
                        
                        <span class="sidebar-mobile-icon">
                            <img
                                src="icons/logout.png"
                                alt="Logout"
                            >
                        </span>
                        
                    </button>

                </div>

                <div class="sales-mobile-user">

                    

                    

                </div>

                <!-- ==============================
                     SEARCH / BARCODE / CAMERA
                     TETAP TAMPIL SAAT CART TERBUKA
                ============================== -->

                <div class="sales-mobile-search-area">

                    <div class="sales-mobile-search-wrapper">

                        <input
                            type="text"
                            id="searchProduct"
                            class="sales-mobile-search-input"
                            placeholder="Cari kode, barcode, atau nama barang..."
                            autocomplete="off"
                        >

                        <button
                            type="button"
                            id="cameraButton"
                            class="sales-mobile-camera-button"
                            aria-label="Scan barcode"
                            title="Scan barcode"
                        >
                            <img
                                src="icons/camera.png"
                                alt="Camera"
                            >
                        </button>

                    </div>

                    <button
                        type="button"
                        id="customerScreenButton"
                        class="sales-mobile-customer-button"
                    >
                        Customer Screen
                    </button>

                </div>

                
            </header>

            <!-- ==============================
                 MAIN
            ============================== -->

            <main class="sales-mobile-main">

                <!-- ==============================
                     PRODUCT PANEL
                ============================== -->

                <section
                    class="sales-mobile-product-panel"
                >

                    <div
                        class="sales-mobile-product-header"
                    >

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
                        class="sales-mobile-product-list"
                    ></div>

                </section>

                <!-- ==============================
                     CART PANEL
                ============================== -->

                <aside
                    id="cartPanel"
                    class="sales-mobile-cart-panel"
                >

                    <div
                        class="sales-mobile-cart-header"
                    >

                        
                        <strong>Keranjang</strong>

                        <span
                            id="mobileCartHeaderCount"
                            class="sales-mobile-cart-header-count"
                        >
                            0 item
                        </span>

                        <span
                            id="cartCount"
                            hidden
                        >
                            0 item
                        </span>

                    </div>

                    <div
                        id="cartItems"
                        class="sales-mobile-cart-items"
                    ></div>

                    <!-- ==========================
                         SUMMARY
                    ========================== -->

                    <div
                        class="sales-mobile-cart-summary"
                    >

                        <div
                            class="sales-mobile-summary-row"
                        >

                            <span>Subtotal</span>

                            <strong id="subtotal">
                                Rp 0
                            </strong>

                        </div>

                        <div
                            class="sales-mobile-summary-row"
                        >

                            <span>Disc</span>

                            <input
                                type="text"
                                id="discount"
                                class="sales-mobile-discount-input"
                                value=""
                                inputmode="numeric"
                                autocomplete="off"
                                placeholder="0"
                            >

                        </div>

                        <div
                            class="sales-mobile-total-row"
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
                        class="sales-mobile-payment-area"
                    >

                        <button
                            type="button"
                            id="paymentButton"
                            class="sales-mobile-payment-button"
                            disabled
                        >
                            BAYAR
                        </button>

                    </div>

                </aside>

            </main>

            <!-- ==============================
                 MOBILE BOTTOM BAR
            ============================== -->

            <div
                id="mobileSalesBottom"
                class="sales-mobile-bottom"
            >

                <div
                    class="sales-mobile-bottom-total"
                >

                    <strong id="mobileSalesTotal">
                        Rp 0
                    </strong>

                </div>

                <button
                    type="button"
                    id="mobileSalesCartButton"
                    class="sales-mobile-cart-button"
                    aria-label="Buka keranjang"
                >

                    <span aria-hidden="true">
                        <img
                            src="icons/cart.png"
                            alt="Cart"
                        >
                    </span>

                    <span
                        id="mobileSalesCartCount"
                        class="sales-mobile-cart-count"
                    >
                        0
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
                </button>

            </div>

        </div>

    `;

}

};