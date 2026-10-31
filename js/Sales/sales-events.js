
 // ======================================
 // SALES
 // EVENTS
 // ======================================

Object.assign(
    Sales,
    {
        eventsBoundElement: null,

        /* ==================================
           EVENT
        ================================== */

        event() {
            const search =
                document.getElementById(
                    "searchProduct"
                );

            if (!search) {
                return;
            }

            // Hindari pemasangan event berulang
            // pada elemen render yang sama.
            if (this.eventsBoundElement === search) {
                return;
            }

            /* ==================================
               SEARCH
            ================================== */

            search.addEventListener(
                "input",
                e => {
                    this.search(e.target.value);
                }
            );

            search.addEventListener(
                "keydown",
                e => {
                    if (e.key !== "Enter") {
                        return;
                    }

                    e.preventDefault();
                    this.handleBarcode(search.value);
                }
            );

            /* ==================================
               DISCOUNT
            ================================== */

            const discount =
                document.getElementById("discount");

            if (discount) {
                discount.addEventListener(
                    "input",
                    e => {
                        this.discount =
                            Number(e.target.value) || 0;

                        Cart.render();

                        if (
                            typeof CustScreen !== "undefined" &&
                            typeof CustScreen.send === "function"
                        ) {
                            CustScreen.send();
                        }
                    }
                );
            }

            /* ==================================
               BARCODE BUTTON
            ================================== */

            const barcodeButton =
                document.getElementById("barcodeButton");

            if (barcodeButton) {
                barcodeButton.addEventListener(
                    "click",
                    () => {
                        this.clearSearch();
                        search.focus();
                    }
                );
            }

            /* ==================================
               CAMERA BARCODE
            ================================== */

            const cameraButton =
                document.getElementById("cameraButton");

            if (cameraButton) {
                cameraButton.addEventListener(
                    "click",
                    () => {
                        if (
                            typeof SalesBarcodeScanner ===
                            "undefined"
                        ) {
                            console.error(
                                "SalesBarcodeScanner tidak tersedia."
                            );
                            return;
                        }

                        SalesBarcodeScanner.open();
                    }
                );
            }

            /* ==================================
               PAYMENT
            ================================== */

            const paymentButton =
                document.getElementById("paymentButton");

            if (paymentButton) {
                paymentButton.addEventListener(
                    "click",
                    () => {
                        PaymentModal.open();
                    }
                );
            }

            /* ==================================
               RELOAD STOK BARANG
            ================================== */

            const reloadStockButton =
                document.getElementById(
                    "sales-reload-stock"
                );

            if (reloadStockButton) {
                reloadStockButton.addEventListener(
                    "click",
                    async () => {
                        if (reloadStockButton.disabled) {
                            return;
                        }

                        if (
                            typeof LocalSync === "undefined" ||
                            typeof LocalSync.syncProducts !== "function"
                        ) {
                            Dialog.error(
                                "Fungsi sinkronisasi barang tidak tersedia."
                            );
                            return;
                        }

                        if (
                            typeof this.loadProducts !== "function"
                        ) {
                            Dialog.error(
                                "Fungsi pemuatan daftar barang tidak tersedia."
                            );
                            return;
                        }

                        const originalContent =
                            reloadStockButton.innerHTML;

                        reloadStockButton.disabled = true;

                        reloadStockButton.classList.add(
                            "is-reloading"
                        );

                        reloadStockButton.setAttribute(
                            "aria-busy",
                            "true"
                        );

                        try {
                            const result =
                                await LocalSync.syncProducts();

                            if (
                                !result ||
                                result.success !== true
                            ) {
                                throw new Error(
                                    result?.error?.message ||
                                    result?.error ||
                                    "Sinkronisasi barang gagal."
                                );
                            }

                            await this.loadProducts();

                            const searchInput =
                                document.getElementById(
                                    "searchProduct"
                                );

                            if (
                                typeof this.search === "function"
                            ) {
                                this.search(
                                    searchInput?.value || ""
                                );
                            }

                            Dialog.success(
                                "Sinkronisasi berhasil.\n" +
                                result.barang.length +
                                " barang dan " +
                                result.satuan.length +
                                " satuan barang diperbarui."
                            );
                        } catch (error) {
                            console.error(
                                "Gagal reload stok barang:",
                                error
                            );

                            Dialog.error(
                                "Gagal menyinkronkan stok barang.\n\n" +
                                (
                                    error.message ||
                                    "Terjadi kesalahan."
                                )
                            );
                        } finally {
                            reloadStockButton.disabled = false;

                            reloadStockButton.classList.remove(
                                "is-reloading"
                            );

                            reloadStockButton.removeAttribute(
                                "aria-busy"
                            );

                            reloadStockButton.innerHTML =
                                originalContent;
                        }
                    }
                );
            }

            /* ==================================
               PRODUCT LIST
            ================================== */

            const productList =
                document.getElementById("productList");

            if (productList) {
                productList.addEventListener(
                    "click",
                    e => {
                        const card =
                            e.target.closest(".product-card");

                        if (!card) {
                            return;
                        }

                        if (
                            card.classList.contains(
                                "product-disabled"
                            )
                        ) {
                            return;
                        }

                        const kode = card.dataset.kode;
                        UnitModal.open(kode);
                    }
                );
            }

            /* ==================================
               MOBILE CART ELEMENTS
            ================================== */

            const mobileCartButton =
                document.getElementById(
                    "mobileCartButton"
                );

            const mobileSalesCartButton =
                document.getElementById(
                    "mobileSalesCartButton"
                );

            const mobileSalesCartCount =
                document.getElementById(
                    "mobileSalesCartCount"
                );

            const mobileCartBack =
                document.getElementById(
                    "mobileCartBack"
                );

            const cartPanel =
                document.getElementById("cartPanel");

            const pos =
                document.querySelector(".pos");

            /* ==================================
               MOBILE CART BUTTON STATE
            ================================== */

            if (this.renderObserver) {
                this.renderObserver.disconnect();
                this.renderObserver = null;
            }

            if (
                mobileSalesCartButton &&
                mobileSalesCartCount
            ) {
                const updateMobileCartButton = () => {
                    const count =
                        Number(
                            mobileSalesCartCount.textContent
                        ) || 0;

                    mobileSalesCartButton.classList.toggle(
                        "cart-has-items",
                        count > 0
                    );
                };

                updateMobileCartButton();

                this.renderObserver =
                    new MutationObserver(
                        updateMobileCartButton
                    );

                this.renderObserver.observe(
                    mobileSalesCartCount,
                    {
                        childList: true,
                        characterData: true,
                        subtree: true
                    }
                );
            }

            /* ==================================
               CUSTOMER SCREEN
            ================================== */

            const customerScreenButton =
                document.getElementById(
                    "customerScreenButton"
                );

            if (customerScreenButton) {
                customerScreenButton.addEventListener(
                    "click",
                    () => {
                        if (
                            typeof CustScreen === "undefined" ||
                            typeof CustScreen.open !== "function"
                        ) {
                            console.error(
                                "CustScreen tidak tersedia."
                            );
                            return;
                        }

                        CustScreen.open();
                    }
                );
            }

            /* ==================================
               TOGGLE MOBILE CART
            ================================== */

            const toggleMobileCart = () => {
                if (!pos) {
                    return;
                }

                const isCartOpen =
                    pos.classList.contains(
                        "mobile-cart-open"
                    );

                if (isCartOpen) {
                    pos.classList.remove(
                        "mobile-cart-open"
                    );
                } else {
                    pos.classList.add(
                        "mobile-cart-open"
                    );

                    if (cartPanel) {
                        cartPanel.scrollTop = 0;
                    }
                }
            };

            /* ==================================
               CART BUTTON
            ================================== */

            if (mobileCartButton) {
                mobileCartButton.addEventListener(
                    "click",
                    toggleMobileCart
                );
            }

            if (mobileSalesCartButton) {
                mobileSalesCartButton.addEventListener(
                    "click",
                    toggleMobileCart
                );
            }

            /* ==================================
               CART BACK BUTTON
            ================================== */

            if (mobileCartBack) {
                mobileCartBack.addEventListener(
                    "click",
                    () => {
                        if (!pos) {
                            return;
                        }

                        pos.classList.remove(
                            "mobile-cart-open"
                        );
                    }
                );
            }

            // Simpan elemen render yang sudah dipasangi event.
            this.eventsBoundElement = search;
        }
    }
);
