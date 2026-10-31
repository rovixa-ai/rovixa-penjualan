// ======================================
// REPORT DETAIL
// ======================================

Object.assign(Report, {

    /*==================================
      DETAIL
    ==================================*/

    async detail(id) {

        try {

            /*==================================
              DATABASE LOKAL
            ==================================*/

            if (
                typeof LocalDB ===
                "undefined"
            ) {

                throw new Error(
                    "LocalDB tidak tersedia."
                );

            }


            /*==================================
              TRANSAKSI
            ==================================*/

            const transaction =
                await LocalDB.get(
                    "penjualan",
                    id
                );


            if (!transaction) {

                throw new Error(
                    "Data transaksi tidak ditemukan."
                );

            }


            /*==================================
              DETAIL BARANG
            ==================================*/

            const allDetails =
                await LocalDB.getAll(
                    "detailPenjualan"
                );


            const items =
                allDetails.filter(
                    item =>
                        String(
                            item.id || ""
                        ).trim()
                        ===
                        String(
                            id
                        ).trim()
                );


            /*==================================
              PEMBAYARAN
            ==================================*/

            const allPayments =
                await LocalDB.getAll(
                    "pembayaran"
                );


            const payments =
                allPayments.filter(
                    payment =>
                        String(
                            payment.id || ""
                        ).trim()
                        ===
                        String(
                            id
                        ).trim()
                );


            /*==================================
              DATA DETAIL
            ==================================*/

            const data = {

                id:
                    transaction.id,

                tanggal:
                    transaction.tanggal,

                kasir:
                    transaction.kasir,

                subtotal:
                    Number(
                        transaction.subtotal
                    ) || 0,

                /*
                 * DISC HEADER
                 *
                 * Nilai diambil langsung
                 * dari penjualan.disc.
                 *
                 * Tidak ada perkalian
                 * atau penjumlahan.
                 */

                disc:
                    Number(
                        transaction.disc
                    ) || 0,

                total:
                    Number(
                        transaction.total
                    ) || 0,

                status:
                    transaction.status,

                items:
                    items,

                payments:
                    payments,

                database:
                    transaction.database

            };


            


            /*==================================
              TAMPILKAN MODAL
            ==================================*/

            this.showDetail(
                data
            );

        }

        catch (error) {

            console.error(
                "DETAIL REPORT ERROR:",
                error
            );


            Notification.error(
                "Gagal mengambil detail transaksi.\n\n" +
                error.message
            );

        }

    },


       /*==================================
      SHOW DETAIL
    ==================================*/

    showDetail(data) {

        
        
        const items =
            Array.isArray(
                data.items
            )
                ?
                data.items
                :
                [];


        const payments =
            Array.isArray(
                data.payments
            )
                ?
                data.payments
                :
                [];


        /*==================================
          DATA TRANSAKSI
        ==================================*/

        const id =
            data.id || "-";


        const tanggal =
            this.date(
                data.tanggal
            );


        const kasir =
            data.kasir || "-";


        const status =
            data.status || "-";


        const statusUpper =
            String(
                status
            )
            .trim()
            .toUpperCase();


        const subtotal =
            Number(
                data.subtotal
            ) || 0;


        /*==================================
          DISCOUNT TRANSAKSI
        ==================================*/

        const transactionDiscount =
            Number(
                data.disc
            ) || 0;


        const total =
            Number(
                data.total
            ) || 0;


        /*==================================
          TOTAL PEMBAYARAN
        ==================================*/

        const totalPayment =
            payments.reduce(
                (
                    sum,
                    payment
                ) => {

                    return (
                        sum +
                        (
                            Number(
                                payment.nominal
                            ) || 0
                        )
                    );

                },
                0
            );


        /*==================================
          CASH DIKEMBALIKAN
        ==================================*/

        const cashReturn =
            Math.max(
                0,
                totalPayment -
                total
            );


        /*==================================
          ESCAPE HTML
        ==================================*/

        const escapeHTML =
            value => {

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

            };


        /*==================================
          ITEM HTML
        ==================================*/

        const itemHTML =
            items.length

                ?

                items.map(
                    item => {

                        const nama =
                            escapeHTML(
                                item.nama
                            );


                        const kode =
                            escapeHTML(
                                item.kode
                            );


                        const satuan =
                            escapeHTML(
                                item.satuan
                            );


                        const qty =
                            Number(
                                item.qty
                            ) || 0;


                        const harga =
                            Number(
                                item.harga
                            ) || 0;


                        const itemDiscount =
                            Number(
                                item.disc ??
                                item.discount
                            ) || 0;


                        const itemSubtotal =
                            Number(
                                item.subtotal ??
                                item.total
                            ) || 0;


                        return `

                            <tr>

                                <td>

                                    <strong>
                                        ${nama}
                                    </strong>

                                    <small>
                                        ${kode}
                                    </small>

                                </td>


                                <td>
                                    ${satuan}
                                </td>


                                <td>
                                    ${qty}
                                </td>


                                <td>
                                    ${this.money(
                                        harga
                                    )}
                                </td>


                                <td>
                                    ${this.money(
                                        itemDiscount
                                    )}
                                </td>


                                <td>
                                    ${this.money(
                                        itemSubtotal
                                    )}

                                </td>

                            </tr>

                        `;

                    }
                ).join("")

                :

                `

                    <tr>

                        <td
                            colspan="6"
                            class="empty-detail"
                        >

                            Tidak ada detail barang.

                        </td>

                    </tr>

                `;

                


        /*==================================
          PAYMENT HTML
        ==================================*/

        const paymentHTML =
            payments.length

                ?

                payments.map(
                    payment => {

                        const metode =
                            String(
                                payment.metode || "-"
                            )
                            .trim()
                            .toUpperCase();


                        const nominal =
                            Number(
                                payment.nominal
                            ) || 0;


                        return `

                            <div class="payment-row">

                                <span>
                                    ${escapeHTML(
                                        metode
                                    )}
                                </span>


                                <strong>
                                    ${this.money(
                                        nominal
                                    )}

                                </strong>

                            </div>

                        `;

                    }
                ).join("")

                :

                `

                    <div class="payment-empty">

                        Tidak ada data pembayaran.

                    </div>

                `;


        /*==================================
          TOMBOL RETUR
        ==================================*/

        const returnButtonHTML =
            statusUpper === "RETUR"

                ?

                ""

                :

                `

                    <button
                        type="button"
                        class="report-detail-return"
                    >

                        ↩️
                        Retur

                    </button>

                `;


        /*==================================
          MODAL
        ==================================*/

        const modal =
            document.createElement("div");

        modal.className =
            "report-detail-overlay" +
            (
                statusUpper === "RETUR"
                    ? " modal-retur"
                    : ""
            );


        modal.className =
            "report-detail-overlay";


        modal.innerHTML = `

            <div class="report-detail-modal">


                <div class="report-detail-header">

                    <div>

                        <h3>
                            Detail Penjualan
                        </h3>


                        <span>
                            ${escapeHTML(id)}
                        </span>

                    </div>


                    <button
                        type="button"
                        class="report-detail-close"
                        aria-label="Tutup"
                    >
                        ×
                    </button>

                </div>


                <div class="report-detail-info">


                    <div>

                        <span>
                            Tanggal
                        </span>


                        <strong>
                            ${escapeHTML(
                                tanggal
                            )}
                        </strong>

                    </div>


                    <div>

                        <span>
                            Kasir
                        </span>


                        <strong>
                            ${escapeHTML(
                                kasir
                            )}

                        </strong>

                    </div>


                    <div>

                        <span>
                            Status
                        </span>

                        <strong
                            class="${
                                statusUpper === "RETUR"
                                    ? "retur"
                                    : ""
                            }"
                        >
                            ${escapeHTML(
                                status
                            )}
                        </strong>

                    </div>


                </div>


                <div class="report-detail-section">


                    <h4>
                        Barang
                    </h4>


                    <div class="report-detail-table">

                        <table>


                            <thead>

                                <tr>

                                    <th>
                                        Barang
                                    </th>


                                    <th>
                                        Satuan
                                    </th>


                                    <th>
                                        Qty
                                    </th>


                                    <th>
                                        Harga
                                    </th>


                                    <th>
                                        Disc
                                    </th>


                                    <th>
                                        Subtotal
                                    </th>

                                </tr>

                            </thead>


                            <tbody>

                                ${itemHTML}

                            </tbody>


                        </table>

                    </div>


                </div>


                <div class="report-detail-payment">


                    <div>

                        <h4>
                            Pembayaran
                        </h4>


                        <div class="payment-list">

                            ${paymentHTML}

                        </div>


                        <div class="payment-row payment-total">

                            <span>
                                Total Pembayaran
                            </span>


                            <strong>
                                ${this.money(
                                    totalPayment
                                )}

                            </strong>

                        </div>


                        ${
                            cashReturn > 0

                            ?

                            `

                                <div
                                    class="
                                        payment-row
                                        payment-change
                                    "
                                >

                                    <span>
                                        Cash Dikembalikan
                                    </span>


                                    <strong>
                                        ${this.money(
                                            cashReturn
                                        )}

                                    </strong>

                                </div>

                            `

                            :

                            ""

                        }


                    </div>


                    <div class="report-detail-total">


                        <div>

                            <span>
                                Subtotal
                            </span>


                            <strong>
                                ${this.money(
                                    subtotal
                                )}

                            </strong>


                        </div>


                        <div>

                            <span>
                                Discount
                            </span>


                            <strong>
                                ${this.money(
                                    transactionDiscount
                                )}

                            </strong>


                        </div>


                        <div
                            class="grand-total"
                        >

                            <span>
                                TOTAL
                            </span>


                            <strong>
                                ${this.money(
                                    total
                                )}

                            </strong>


                        </div>


                    </div>


                </div>


                <div class="report-detail-actions">


                    <button
                        type="button"
                        class="report-detail-print"
                    >

                        🖨️
                        Print Struk

                    </button>


                    ${returnButtonHTML}


                </div>


            </div>

        `;

        if (statusUpper === "RETUR") {
    const watermark = document.createElement("div");

    watermark.className = "report-detail-watermark";
    watermark.textContent = "RETUR";
    watermark.setAttribute("aria-hidden", "true");

    const detailModal = modal.querySelector(".report-detail-modal");

    if (detailModal) {
        detailModal.appendChild(watermark);
    }
}


       


        /*==================================
          APPEND DETAIL
        ==================================*/

        document.body.appendChild(
            modal
        );


        /*==================================
          CLOSE MODAL
        ==================================*/

        let closed =
            false;


        function closeModal() {

            if (closed) {
                return;
            }

            closed = true;

            document.removeEventListener(
                "keydown",
                escHandler
            );

            modal.remove();

            if (reportModalOverlay) {
                reportModalOverlay.style.pointerEvents = "auto";
            }

        }


        /*==================================
          ESC KEY
        ==================================*/

        function escHandler(e) {

            if (
                e.key === "Escape"
            ) {

                e.preventDefault();

                e.stopPropagation();

                closeModal();

            }

        }


        /*==================================
          CLOSE BUTTON
        ==================================*/

        const closeButton =
            modal.querySelector(
                ".report-detail-close"
            );


        if (closeButton) {

            closeButton.addEventListener(
                "click",
                e => {

                    e.preventDefault();

                    e.stopPropagation();

                    closeModal();

                }
            );

        }


        /*==================================
          DETAIL MODAL
        ==================================*/

        const detailModal =
            modal.querySelector(
                ".report-detail-modal"
            );


        if (detailModal) {

            detailModal.addEventListener(
                "click",
                e => {

                    e.stopPropagation();

                }
            );

        }


        /*==================================
          PRINT STRUK
        ==================================*/

        const printButton =
            modal.querySelector(
                ".report-detail-print"
            );


        if (printButton) {

            printButton.addEventListener(
                "click",
                e => {

                    e.preventDefault();

                    e.stopPropagation();

                    try {

                        const opened =
                            Receipt.open();


                        if (!opened) {

                            return;

                        }


                        Receipt.render({

                            id:
                                data.id,

                            tanggal:
                                data.tanggal,

                            kasir:
                                data.kasir,

                            subtotal:
                                data.subtotal,

                            discount:
                                transactionDiscount,

                            transactionDiscount:
                                transactionDiscount,

                            total:
                                data.total,

                            items:
                                data.items,

                            pembayaran:
                                data.payments

                        });

                    }

                    catch (error) {

                        console.error(
                            "PRINT DETAIL ERROR:",
                            error
                        );


                        Notification.error(
                            "Gagal mencetak struk.\n\n" +
                            error.message
                        );

                    }

                }
            );

        }


        /*==================================
          RETUR
        ==================================*/

        const returnButton =
            modal.querySelector(
                ".report-detail-return"
            );


        if (returnButton) {

            returnButton.addEventListener(
                "click",
                async e => {

                    e.preventDefault();

                    e.stopPropagation();

                    await this.retur(
                        data,
                        modal
                    );

                }

            );

        }


        /*==================================
          CLOSE OVERLAY
        ==================================*/

        modal.addEventListener(
            "click",
            e => {

                e.preventDefault();

                e.stopPropagation();


                if (
                    e.target === modal
                ) {

                    closeModal();

                }

            }
        );


        /*==================================
          AKTIFKAN ESC
        ==================================*/

        document.addEventListener(
            "keydown",
            escHandler
        );

    }

});