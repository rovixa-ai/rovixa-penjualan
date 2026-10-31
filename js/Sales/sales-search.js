// ======================================
// SALES
// SEARCH
// ======================================

Object.assign(
    Sales,
    {

        /* ==================================
           SEARCH
        ================================== */

        search(value) {

            const text =
                String(
                    value || ""
                )
                .trim()
                .toLowerCase();

            if (!text) {

                this.renderProducts();

                return;

            }

            const result =
                this.products.filter(
                    product => {

                        const kode =
                            String(
                                product.kode || ""
                            )
                            .toLowerCase();

                        const barcode =
                            String(
                                product.barcode || ""
                            )
                            .toLowerCase();

                        const nama =
                            String(
                                product.nama || ""
                            )
                            .toLowerCase();

                        const foundUnit =
                            Array.isArray(
                                product.satuan
                            )
                            &&
                            product.satuan.some(
                                unit =>

                                    String(
                                        unit.barcodeSatuan || ""
                                    )
                                    .toLowerCase()
                                    .includes(
                                        text
                                    )
                            );

                        return (

                            kode.includes(text)

                            ||

                            barcode.includes(text)

                            ||

                            nama.includes(text)

                            ||

                            foundUnit

                        );

                    }
                );

            this.renderProducts(
                result
            );

        },


        /* ==================================
           HANDLE BARCODE
        ================================== */

        handleBarcode(value, options = {}) {

            const barcode =
                String(
                    value || ""
                ).trim();

            if (!barcode) {
                return;
            }

            const clearOptions = {
                focus: options.focus !== false
            };

            /* ==============================
               BARCODE UTAMA BARANG
            ============================== */

            const product =
                this.products.find(
                    item =>
                        String(
                            item.barcode || ""
                        ).trim() === barcode
                );

            if (product) {

                /* ==========================
                   SATU SATUAN
                ========================== */

                if (
                    Array.isArray(
                        product.satuan
                    ) &&
                    product.satuan.length === 1
                ) {

                    Cart.addItem(
                        product,
                        product.satuan[0]
                    );

                    this.clearSearch(
                        clearOptions
                    );

                    return;

                }

                /* ==========================
                   BANYAK SATUAN
                ========================== */

                if (
                    Array.isArray(
                        product.satuan
                    ) &&
                    product.satuan.length > 1
                ) {

                    UnitModal.open(
                        product.kode
                    );

                    this.clearSearch(
                        clearOptions
                    );

                    return;

                }

                /* ==========================
                   SATUAN TIDAK TERSEDIA
                ========================== */

                Notification.warning(
                    "Satuan barang tidak tersedia"
                );

                this.clearSearch(
                    clearOptions
                );

                return;

            }


            /* ==============================
               BARCODE SATUAN
            ============================== */

            for (
                const item of
                this.products
            ) {

                const unit =
                    Array.isArray(
                        item.satuan
                    )
                        ? item.satuan.find(
                            satuan =>

                                String(
                                    satuan.barcodeSatuan || ""
                                ).trim() === barcode
                        )
                        : null;

                if (unit) {

                    Cart.addItem(
                        item,
                        unit
                    );

                    this.clearSearch(
                        clearOptions
                    );

                    return;

                }

            }


            /* ==============================
               BARCODE TIDAK DITEMUKAN
            ============================== */

            Notification.warning(
                "Barcode tidak ditemukan"
            );

            this.clearSearch(
                clearOptions
            );

        },


        /* ==================================
           CLEAR SEARCH
        ================================== */

        clearSearch(options = {}) {

            const search =
                document.getElementById(
                    "searchProduct"
                );

            if (!search) {
                return;
            }

            search.value = "";

            this.renderProducts();

            if (options.focus !== false) {
                search.focus();
            }

        }

    }
);