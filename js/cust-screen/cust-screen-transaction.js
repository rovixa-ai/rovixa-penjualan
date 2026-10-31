// ======================================
// CUSTOMER SCREEN
// TRANSACTION
// TREEHOUSE POS
// ======================================

const CustScreenTransaction = {

    /* ==================================
       RENDER
    ================================== */

    render(data) {

        if (!data) {
            return;
        }


        const main =
            document.getElementById(
                "custMain"
            );


        if (!main) {
            return;
        }


        const items =
            Array.isArray(
                data.items
            )
                ? data.items
                : [];


        const summary =
            data.summary ||
            {};


        /* ==================================
           TRANSACTION LAYOUT
        ================================== */

        main.innerHTML = `

            <section class="cust-items-panel">

                <div class="cust-items-header">

                    <strong>
                        Pesanan Anda
                    </strong>

                </div>


                <div
                    class="cust-items"
                    id="custItems"
                ></div>

            </section>


            <aside class="cust-summary">

                <div class="cust-summary-header">

                    <strong>
                        Ringkasan Pembayaran
                    </strong>

                </div>


                <div class="cust-summary-body">

                    <div class="cust-summary-row">

                        <span>
                            Subtotal
                        </span>

                        <strong id="custSubtotal">
                            Rp 0
                        </strong>

                    </div>


                    <div class="cust-summary-row">

                        <span>
                            Discount
                        </span>

                        <strong id="custDiscount">
                            Rp 0
                        </strong>

                    </div>


                    <div
                        class="cust-summary-row cust-total"
                    >

                        <span>
                            TOTAL
                        </span>

                        <strong id="custTotal">
                            Rp 0
                        </strong>

                    </div>

                </div>

            </aside>

        `;


        const itemsElement =
            document.getElementById(
                "custItems"
            );


        const subtotalElement =
            document.getElementById(
                "custSubtotal"
            );


        const discountElement =
            document.getElementById(
                "custDiscount"
            );


        const totalElement =
            document.getElementById(
                "custTotal"
            );


        /* ==================================
           VALIDASI ELEMENT
        ================================== */

        if (
            !itemsElement ||
            !subtotalElement ||
            !discountElement ||
            !totalElement
        ) {

            return;

        }


        /* ==================================
           ITEMS
        ================================== */

        itemsElement.innerHTML =
            items
                .map(
                    item => {

                        const qty =
                            Number(
                                item.qty
                            ) || 0;


                        const harga =
                            Number(
                                item.harga
                            ) || 0;


                        const discount =
                            Math.max(
                                0,
                                Number(
                                    item.discount
                                ) || 0
                            );


                        const discountTotal =
                            qty *
                            discount;


                        const subtotal =
                            Math.max(
                                0,
                                Number(
                                    item.subtotal
                                ) || 0
                            );


                        return `

                            <div
                                class="cust-item"
                            >

                                <div>

                                    <div
                                        class="cust-item-name"
                                    >
                                        ${this.escape(
                                            item.nama
                                        )}
                                    </div>


                                    <div
                                        class="cust-item-info"
                                    >
                                        ${this.escape(
                                            item.kode
                                        )}
                                        ·
                                        ${this.escape(
                                            item.satuan
                                        )}
                                        ·
                                        ${this.money(
                                            harga
                                        )}
                                    </div>

                                </div>


                                <div
                                    class="cust-item-qty"
                                >
                                    ${qty}
                                </div>


                                <div>

                                    <div
                                        class="cust-item-price"
                                    >
                                        ${this.money(
                                            subtotal
                                        )}
                                    </div>


                                    ${
                                        discountTotal > 0
                                            ? `

                                                <div
                                                    class="cust-item-discount"
                                                >
                                                    Disc
                                                    ${this.money(
                                                        discountTotal
                                                    )}
                                                </div>

                                            `
                                            : ""
                                    }

                                </div>

                            </div>

                        `;

                    }
                )
                .join("");


        /* ==================================
           SUMMARY
        ================================== */

        /*
         * SUBTOTAL SUMMARY
         *
         * Total harga barang sebelum
         * discount item dan discount transaksi.
         *
         * Rumus:
         *
         * Σ (Harga × Qty)
         */

        const subtotal =
            items.reduce(
                (
                    total,
                    item
                ) => {

                    const qty =
                        Number(
                            item.qty
                        ) || 0;


                    const harga =
                        Number(
                            item.harga
                        ) || 0;


                    return (
                        total +
                        (
                            harga *
                            qty
                        )
                    );

                },
                0
            );


        /*
         * DISCOUNT SUMMARY
         *
         * Discount item +
         * Discount transaksi.
         *
         * Tetap mengambil dari
         * Cart.getSummary().
         */

        const discount =
            Number(
                summary.discount
            ) || 0;


        /*
         * TOTAL
         *
         * Tetap mengambil hasil
         * perhitungan Cart.
         */

        const total =
            Number(
                summary.total
            ) || 0;


        subtotalElement.textContent =
            this.money(
                subtotal
            );


        discountElement.textContent =
            this.money(
                discount
            );


        totalElement.textContent =
            this.money(
                total
            );


        /* ==================================
           STATUS
        ================================== */

        const statusElement =
            document.querySelector(
                ".cust-status"
            );


        if (statusElement) {

            statusElement.textContent =
                "Transaksi sedang berlangsung";

        }

    },


    /* ==================================
       MONEY
    ================================== */

    money(value) {

        return (
            "Rp " +
            Number(
                value || 0
            ).toLocaleString(
                "id-ID"
            )
        );

    },


    /* ==================================
       ESCAPE HTML
    ================================== */

    escape(value) {

        return String(
            value ?? ""
        )
            .replace(
                /&/g,
                "&amp;"
            )
            .replace(
                /</g,
                "&lt;"
            )
            .replace(
                />/g,
                "&gt;"
            )
            .replace(
                /"/g,
                "&quot;"
            )
            .replace(
                /'/g,
                "&#039;"
            );

    }

};