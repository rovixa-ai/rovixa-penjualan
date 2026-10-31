/*======================================
REPORT MODULE
======================================*/



const Report = {

    data: [],

    filtered: [],


    /*==================================
    INIT
    ==================================*/

    init() {

        

        this.render();

        this.setDefaultDate();

        this.event();

        this.load();

    },


    /*==================================
    RENDER
    ==================================*/

    /*==================================
RENDER
DESKTOP & MOBILE
==================================*/

render() {

    const existing =
        document.getElementById(
            "reportModalOverlay"
        );

    if (existing) {

        existing.remove();

    }


    const wrapper =
        document.createElement(
            "div"
        );


    const isMobile =
        window.matchMedia(
            "(max-width: 768px)"
        ).matches;


    wrapper.innerHTML =
        isMobile
            ? ReportMobileRender.render()
            : ReportDesktopRender.render();


    const modal =
        wrapper.firstElementChild;


    document.body.appendChild(
        modal
    );


    const closeButton =
        document.getElementById(
            "reportModalClose"
        );


    if (closeButton) {

        closeButton.addEventListener(
            "click",
            () => {

                this.closeModal();

            }
        );

    }


    modal.addEventListener(
        "click",
        event => {

            if (
                event.target ===
                modal
            ) {

                this.closeModal();

            }

        }
    );


    this.modalKeydown =
        event => {

            if (
                event.key ===
                "Escape"
            ) {

                this.closeModal();

            }

        };


    document.addEventListener(
        "keydown",
        this.modalKeydown
    );

},


    /*==================================
    CLOSE MODAL
    ==================================*/

    closeModal() {

        const modal =
            document.getElementById(
                "reportModalOverlay"
            );


        if (modal) {

            modal.remove();

        }


        if (
            this.modalKeydown
        ) {

            document.removeEventListener(
                "keydown",
                this.modalKeydown
            );

            this.modalKeydown =
                null;

        }

    },


    /*======================================
    SUMMARY
    ======================================*/

    renderSummary() {

        let totalTransaksi = 0;

        let totalItem = 0;

        let subtotal = 0;

        let discount = 0;

        let total = 0;

        let cash = 0;

        let qris = 0;

        let debit = 0;

        let transfer = 0;


        this.filtered.forEach(
            item => {


                /* ======================================
                   TOTAL TRANSAKSI
                   RETUR tetap dihitung
                ====================================== */

                totalTransaksi += 1;


                /* ======================================
                   PEMBAYARAN
                   RETUR tetap dihitung
                ====================================== */

                cash +=
                    Number(
                        item.CASH || 0
                    ) -
                    Number(
                        item.change || 0
                    );


                qris +=
                    Number(
                        item.QRIS || 0
                    );


                debit +=
                    Number(
                        item.DEBIT || 0
                    );


                transfer +=
                    Number(
                        item.TRANSFER || 0
                    );


                /* ======================================
                   DATA PENJUALAN
                   RETUR tidak dihitung
                ====================================== */

                const status =
                    String(
                        item.status || ""
                    )
                    .trim()
                    .toUpperCase();


                if (
                    status ===
                    "RETUR"
                ) {

                    return;

                }


                /* ======================================
                   TOTAL ITEM
                ====================================== */

                totalItem +=
                    Number(
                        item.totalItem ??
                        item.qty ??
                        0
                    );


                /* ======================================
                   SUBTOTAL
                ====================================== */

                subtotal +=
                    Number(
                        item.subtotal || 0
                    );


                /* ======================================
                   DISCOUNT
                ====================================== */

                discount +=
                    Number(
                        item.disc || 0
                    );


                /* ======================================
                   TOTAL PENJUALAN
                ====================================== */

                total +=
                    Number(
                        item.total || 0
                    );

            }
        );


        /* ======================================
           TOTAL PEMBAYARAN
        ====================================== */

        const totalPayment =
            cash +
            qris +
            debit +
            transfer;


        /* ======================================
           RENDER SUMMARY
        ====================================== */

        const totalTransaksiElement =
            document.getElementById(
                "reportTotalTransaksi"
            );


        const totalItemElement =
            document.getElementById(
                "reportTotalItem"
            );


        const subtotalElement =
            document.getElementById(
                "reportSubtotal"
            );


        const discountElement =
            document.getElementById(
                "reportDiscount"
            );


        const totalElement =
            document.getElementById(
                "reportTotal"
            );


        const cashElement =
            document.getElementById(
                "reportCash"
            );


        const qrisElement =
            document.getElementById(
                "reportQRIS"
            );


        const debitElement =
            document.getElementById(
                "reportDebit"
            );


        const transferElement =
            document.getElementById(
                "reportTransfer"
            );


        const totalPaymentElement =
            document.getElementById(
                "reportTotalPayment"
            );


        if (
            totalTransaksiElement
        ) {

            totalTransaksiElement.textContent =
                totalTransaksi;

        }


        if (
            totalItemElement
        ) {

            totalItemElement.textContent =
                totalItem;

        }


        if (
            subtotalElement
        ) {

            subtotalElement.textContent =
                this.formatRupiah(
                    subtotal
                );

        }


        if (
            discountElement
        ) {

            discountElement.textContent =
                this.formatRupiah(
                    discount
                );

        }


        if (
            totalElement
        ) {

            totalElement.textContent =
                this.formatRupiah(
                    total
                );

        }


        if (
            cashElement
        ) {

            cashElement.textContent =
                this.formatRupiah(
                    cash
                );

        }


        if (
            qrisElement
        ) {

            qrisElement.textContent =
                this.formatRupiah(
                    qris
                );

        }


        if (
            debitElement
        ) {

            debitElement.textContent =
                this.formatRupiah(
                    debit
                );

        }


        if (
            transferElement
        ) {

            transferElement.textContent =
                this.formatRupiah(
                    transfer
                );

        }


        if (
            totalPaymentElement
        ) {

            totalPaymentElement.textContent =
                this.formatRupiah(
                    totalPayment
                );

        }

    },


  

    /*==================================
    DETAIL
    ==================================*/

    detail(id) {

       

        /*
         * Detail transaksi akan
         * disambungkan ke modal
         * berikutnya.
         */

    },


    /*==================================
    LAPORAN
    ==================================*/

    laporan() {

       

    },


    /*==================================
    SET TEXT
    ==================================*/

    setText(
        id,
        value
    ) {

        const element =
            document.getElementById(
                id
            );


        if (element) {

            element.textContent =
                value;

        }

    },


    /*==================================
    FORMAT RUPIAH
    ==================================*/

    formatRupiah(
        value
    ) {

        const number =
            Number(
                value || 0
            );


        return (
            "Rp " +
            number.toLocaleString(
                "id-ID"
            )
        );

    },


    /*==================================
    FORMAT NUMBER
    ==================================*/

    formatNumber(
        value
    ) {

        return Number(
            value || 0
        ).toLocaleString(
            "id-ID"
        );

    },


    /*==================================
    FORMAT DATE
    ==================================*/

    formatDate(
        value
    ) {

        if (!value) {

            return "-";

        }


        if (
            typeof value ===
            "string"
        ) {

            const match =
                value.trim().match(
                    /^(\d{1,2})\/(\d{1,2})\/(\d{2}|\d{4})(?:\s|$)/
                );


            if (match) {

                const day =
                    String(
                        match[1]
                    ).padStart(
                        2,
                        "0"
                    );


                const month =
                    String(
                        match[2]
                    ).padStart(
                        2,
                        "0"
                    );


                let year =
                    String(
                        match[3]
                    );


                if (
                    year.length === 2
                ) {

                    year =
                        "20" +
                        year;

                }


                return (
                    `${day}/${month}/${year.slice(-2)}`
                );

            }


            if (
                /^\d{4}-\d{2}-\d{2}$/
                    .test(value)
            ) {

                const [
                    year,
                    month,
                    day
                ] =
                    value.split("-");


                return (
                    `${day}/${month}/${year.slice(-2)}`
                );

            }

        }


        if (
            Object.prototype.toString.call(
                value
            ) ===
            "[object Date]"
        ) {

            if (
                isNaN(
                    value.getTime()
                )
            ) {

                return "-";

            }


            return (
                String(
                    value.getDate()
                ).padStart(
                    2,
                    "0"
                )
                +
                "/"
                +
                String(
                    value.getMonth() + 1
                ).padStart(
                    2,
                    "0"
                )
                +
                "/"
                +
                String(
                    value.getFullYear()
                ).slice(-2)
            );

        }


        return String(
            value
        );

    },


    /*==================================
    ESCAPE HTML
    ==================================*/

    escapeHTML(
        value
    ) {

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