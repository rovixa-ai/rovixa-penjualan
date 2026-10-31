// ======================================
// PAYMENT MODAL
// TREEHOUSE POS
// ======================================

const PaymentModal = {

    /* ==================================
       DATA
    ================================== */

    payment: {

        CASH: 0,
        QRIS: 0,
        DEBIT: 0,
        TRANSFER: 0

    },


    /* ==================================
       INIT
    ================================== */

    init() {

        this.render();

        this.event();

    },


    /* ==================================
       RENDER
    ================================== */

    render() {

        if (
            document.getElementById(
                "paymentModal"
            )
        ) {

            return;

        }


        document.body.insertAdjacentHTML(
            "beforeend",
            `

            <div
                class="payment-modal-overlay"
                id="paymentModal"
            >

                <div
                    class="payment-modal"
                >

                    <div
                        class="payment-modal-header"
                    >

                        <div>

                            <div
                                class="payment-modal-title"
                            >
                                Pembayaran
                            </div>

                            <div
                                class="payment-modal-subtitle"
                            >
                                Selesaikan transaksi
                            </div>

                        </div>

                        <button
                            type="button"
                            class="payment-modal-close"
                            id="paymentModalClose"
                        >
                            ×
                        </button>

                    </div>


                    <!-- ==========================
                         SUMMARY
                    =========================== -->

                    <div
                        class="payment-summary"
                    >

                        <div
                            class="payment-summary-row"
                        >

                            <span>
                                Subtotal
                            </span>

                            <strong
                                id="paymentSubtotal"
                            >
                                Rp 0
                            </strong>

                        </div>


                        <div
                            class="payment-summary-row"
                        >

                            <span>
                                Discount
                            </span>

                            <strong
                                id="paymentDiscount"
                            >
                                Rp 0
                            </strong>

                        </div>


                        <div
                            class="payment-total-row"
                        >

                            <span>
                                TOTAL
                            </span>

                            <strong
                                id="paymentTotal"
                            >
                                Rp 0
                            </strong>

                        </div>

                    </div>


                    <!-- ==========================
                         PAYMENT
                    =========================== -->

                    <div
                        class="payment-section"
                    >

                        <label>
                            Pembayaran
                        </label>


                        <div
                            class="split-payment-list"
                        >

                            <!-- CASH -->

                            <div
                                class="split-payment-row"
                            >

                                <div
                                    class="split-payment-label"
                                >
                                    CASH
                                </div>

                                <div
                                    class="split-payment-input-wrap"
                                >

                                    <input
                                        type="number"
                                        class="split-payment-input"
                                        data-method="CASH"
                                        id="paymentCash"
                                        min="0"
                                        value=""
                                        placeholder="0"
                                        inputmode="numeric"
                                        autocomplete="off"
                                    >

                                    <button
                                        type="button"
                                        class="payment-money-button"
                                        data-money-method="CASH"
                                        title="Input total pembayaran"
                                        aria-label="Input total pembayaran CASH"
                                    >
                                        💵
                                    </button>

                                </div>

                            </div>


                            <!-- QRIS -->

                            <div
                                class="split-payment-row"
                            >

                                <div
                                    class="split-payment-label"
                                >
                                    QRIS
                                </div>

                                <div
                                    class="split-payment-input-wrap"
                                >

                                    <input
                                        type="number"
                                        class="split-payment-input"
                                        data-method="QRIS"
                                        id="paymentQris"
                                        min="0"
                                        value=""
                                        placeholder="0"
                                        inputmode="numeric"
                                        autocomplete="off"
                                    >

                                    <button
                                        type="button"
                                        class="payment-money-button"
                                        data-money-method="QRIS"
                                        title="Input total pembayaran"
                                        aria-label="Input total pembayaran QRIS"
                                    >
                                        💵
                                    </button>

                                </div>

                            </div>


                            <!-- DEBIT -->

                            <div
                                class="split-payment-row"
                            >

                                <div
                                    class="split-payment-label"
                                >
                                    DEBIT
                                </div>

                                <div
                                    class="split-payment-input-wrap"
                                >

                                    <input
                                        type="number"
                                        class="split-payment-input"
                                        data-method="DEBIT"
                                        id="paymentDebit"
                                        min="0"
                                        value=""
                                        placeholder="0"
                                        inputmode="numeric"
                                        autocomplete="off"
                                    >

                                    <button
                                        type="button"
                                        class="payment-money-button"
                                        data-money-method="DEBIT"
                                        title="Input total pembayaran"
                                        aria-label="Input total pembayaran DEBIT"
                                    >
                                        💵
                                    </button>

                                </div>

                            </div>


                            <!-- TRANSFER -->

                            <div
                                class="split-payment-row"
                            >

                                <div
                                    class="split-payment-label"
                                >
                                    TRANSFER
                                </div>

                                <div
                                    class="split-payment-input-wrap"
                                >

                                    <input
                                        type="number"
                                        class="split-payment-input"
                                        data-method="TRANSFER"
                                        id="paymentTransfer"
                                        min="0"
                                        value=""
                                        placeholder="0"
                                        inputmode="numeric"
                                        autocomplete="off"
                                    >

                                    <button
                                        type="button"
                                        class="payment-money-button"
                                        data-money-method="TRANSFER"
                                        title="Input total pembayaran"
                                        aria-label="Input total pembayaran TRANSFER"
                                    >
                                        💵
                                    </button>

                                </div>

                            </div>

                        </div>

                    </div>


                    <!-- ==========================
                         RESULT
                    =========================== -->

                    <div
                        class="payment-result"
                    >

                        <div
                            class="payment-result-row"
                        >

                            <span>
                                Total Pembayaran
                            </span>

                            <strong
                                id="paymentTotalPayment"
                            >
                                Rp 0
                            </strong>

                        </div>


                        <div
                            class="payment-result-row"
                        >

                            <span>
                                Sisa Pembayaran
                            </span>

                            <strong
                                id="paymentRemaining"
                            >
                                Rp 0
                            </strong>

                        </div>


                        <div
                            class="payment-result-row payment-change"
                        >

                            <span>
                                Kembalian CASH
                            </span>

                            <strong
                                id="paymentChange"
                            >
                                Rp 0
                            </strong>

                        </div>

                    </div>


                    <!-- ==========================
                         PROCESS
                    =========================== -->

                    <button
                        type="button"
                        class="payment-process-button"
                        id="paymentProcess"
                        disabled
                    >
                        PROSES PEMBAYARAN
                    </button>

                </div>

            </div>

            `
        );

    },


    /* ==================================
       EVENT
    ================================== */

    event() {

        const closeButton =
            document.getElementById(
                "paymentModalClose"
            );


        const modal =
            document.getElementById(
                "paymentModal"
            );


        const processButton =
            document.getElementById(
                "paymentProcess"
            );


        const inputs =
            document.querySelectorAll(
                ".split-payment-input"
            );


        const moneyButtons =
            document.querySelectorAll(
                ".payment-money-button"
            );


        if (
            !closeButton ||
            !modal ||
            !processButton
        ) {

            console.error(
                "PAYMENT MODAL ELEMENT TIDAK DITEMUKAN"
            );

            return;

        }


        /* ==============================
           CLOSE
        ============================== */

        closeButton.addEventListener(
            "click",
            () => {

                this.close();

            }
        );


        /* ==============================
           OVERLAY
        ============================== */

        modal.addEventListener(
            "click",
            e => {

                if (
                    e.target === modal
                ) {

                    this.close();

                }

            }
        );


        /* ==============================
           PAYMENT INPUT
        ============================== */

        inputs.forEach(
            input => {

                input.addEventListener(
                    "focus",
                    () => {

                        if (
                            input.value === "0"
                        ) {

                            input.value = "";

                        }

                    }
                );


                input.addEventListener(
                    "input",
                    () => {

                        this.updatePayment(
                            input
                        );

                    }
                );

            }
        );


        /* ==============================
           MONEY BUTTON
           INPUT TOTAL PEMBAYARAN
        ============================== */

        moneyButtons.forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        this.inputTotalPayment(
                            button.dataset.moneyMethod
                        );

                    }
                );

            }
        );


        document.addEventListener(
            "wheel",
            e => {

                if (
                    document.activeElement &&
                    document.activeElement.classList.contains(
                        "split-payment-input"
                    )
                ) {

                    e.preventDefault();

                }

            },
            {
                passive: false
            }
        );


        /* ==============================
           PROCESS
        ============================== */

        processButton.addEventListener(
            "click",
            () => {

                this.process();

            }
        );


        /* ==============================
           KEYBOARD
        ============================== */

        document.addEventListener(
            "keydown",
            e => {

                const modal =
                    document.getElementById(
                        "paymentModal"
                    );


                if (
                    !modal ||
                    !modal.classList.contains(
                        "show"
                    )
                ) {

                    return;

                }


                if (
                    e.key === "Escape"
                ) {

                    this.close();

                    return;

                }


                if (
                    e.key === "Enter"
                ) {

                    e.preventDefault();

                    this.process();

                }

            }
        );

    },


    /* ==================================
       INPUT TOTAL PAYMENT
    ================================== */

    inputTotalPayment(method) {

        if (!method) {

            return;

        }


        const data =
            Cart.getSummary();


        if (!data) {

            return;

        }


        const total =
            Number(
                data.total
            ) || 0;


        if (total <= 0) {

            return;

        }


        const input =
            document.querySelector(
                `.split-payment-input[data-method="${method}"]`
            );


        if (!input) {

            return;

        }


        input.value =
            total;


        this.payment[
            method
        ] = total;


        this.calculate();


        input.focus();


        input.select();

    },


    /* ==================================
       OPEN
    ================================== */

    open() {

        if (
            !document.getElementById(
                "paymentModal"
            )
        ) {

            this.render();

            this.event();

        }


        const data =
            Cart.getSummary();


        if (
            !data ||
            Number(data.total) <= 0
        ) {

            console.warn(
                "TOTAL PENJUALAN TIDAK VALID"
            );

            return;

        }


        /* ==============================
           RESET PEMBAYARAN
        ============================== */

        this.payment = {

            CASH: 0,
            QRIS: 0,
            DEBIT: 0,
            TRANSFER: 0

        };


        /* ==============================
           SUMMARY
        ============================== */

        this.renderSummary(
            data
        );


        /* ==============================
           RESET INPUT
        ============================== */

        const inputs =
            document.querySelectorAll(
                ".split-payment-input"
            );


        inputs.forEach(
            input => {

                input.value = "";

            }
        );


        /* ==============================
           CALCULATE
        ============================== */

        this.calculate();


        /* ==============================
           SHOW
        ============================== */

        const modal =
            document.getElementById(
                "paymentModal"
            );


        if (!modal) {

            return;

        }


        modal.classList.add(
            "show"
        );


        /* ==============================
           FOCUS CASH
        ============================== */

        setTimeout(
            () => {

                const cash =
                    document.getElementById(
                        "paymentCash"
                    );


                if (cash) {

                    cash.focus();

                }

            },
            100
        );

    },


    /* ==================================
       CLOSE
    ================================== */

    close() {

        const modal =
            document.getElementById(
                "paymentModal"
            );


        if (!modal) {

            return;

        }


        modal.classList.remove(
            "show"
        );

    },


    /* ==================================
       SUMMARY
    ================================== */

    renderSummary(data) {

        const subtotal =
            document.getElementById(
                "paymentSubtotal"
            );


        const discount =
            document.getElementById(
                "paymentDiscount"
            );


        const total =
            document.getElementById(
                "paymentTotal"
            );


        if (subtotal) {

            subtotal.textContent =
                Sales.money(
                    Number(
                        data.grossSubtotal
                    ) || 0
                );

        }


        if (discount) {

            discount.textContent =
                Sales.money(
                    Number(
                        data.discount
                    ) || 0
                );

        }


        if (total) {

            total.textContent =
                Sales.money(
                    Number(
                        data.total
                    ) || 0
                );

        }

    },


    /* ==================================
       UPDATE PAYMENT
    ================================== */

    updatePayment(input) {

        const method =
            input.dataset.method;


        if (!method) {

            return;

        }


        let value =
            Number(
                input.value
            ) || 0;


        if (value < 0) {

            value = 0;

            input.value = "";

        }


        this.payment[
            method
        ] = value;


        this.calculate();

    },


    /* ==================================
       TOTAL PAYMENT
    ================================== */

    getTotalPayment() {

        return (

            Number(
                this.payment.CASH
            ) +

            Number(
                this.payment.QRIS
            ) +

            Number(
                this.payment.DEBIT
            ) +

            Number(
                this.payment.TRANSFER
            )

        );

    },


    /* ==================================
       CALCULATE
    ================================== */

    calculate() {

        const data =
            Cart.getSummary();


        if (!data) {

            return;

        }


        const total =
            Number(
                data.total
            ) || 0;


        /* ==============================
           TOTAL PEMBAYARAN
        ============================== */

        const totalPayment =
            this.getTotalPayment();


        /* ==============================
           SISA PEMBAYARAN
        ============================== */

        const remaining =
            Math.max(
                0,
                total -
                totalPayment
            );


        /* ==============================
           KEMBALIAN
        ============================== */

        const change =
            Math.max(
                0,
                totalPayment -
                total
            );


        /* ==============================
           ELEMENT
        ============================== */

        const totalPaymentElement =
            document.getElementById(
                "paymentTotalPayment"
            );


        const remainingElement =
            document.getElementById(
                "paymentRemaining"
            );


        const changeElement =
            document.getElementById(
                "paymentChange"
            );


        const processButton =
            document.getElementById(
                "paymentProcess"
            );


        /* ==============================
           TOTAL PAYMENT
        ============================== */

        if (totalPaymentElement) {

            totalPaymentElement.textContent =
                Sales.money(
                    totalPayment
                );

        }


        /* ==============================
           REMAINING
        ============================== */

        if (remainingElement) {

            remainingElement.textContent =
                Sales.money(
                    remaining
                );

        }


        /* ==============================
           CHANGE
        ============================== */

        if (changeElement) {

            changeElement.textContent =
                Sales.money(
                    change
                );

        }


        /* ==============================
           VALIDATION
        ============================== */

        if (processButton) {

            processButton.disabled =
                totalPayment < total;

        }

    },


    /* ==================================
       PROCESS
    ================================== */

    process() {

        const data =
            Cart.getSummary();


        if (
            !data ||
            Number(data.total) <= 0
        ) {

            return;

        }


        const total =
            Number(
                data.total
            ) || 0;


        const totalPayment =
            this.getTotalPayment();


        /* ==============================
           VALIDASI
        ============================== */

        if (
            totalPayment < total
        ) {

            Notification.error(
                "Nominal pembayaran masih kurang."
            );

            return;

        }


        /* ==============================
           KEMBALIAN
        ============================== */

        const change =
            Math.max(
                0,
                totalPayment -
                total
            );


        /* ==============================
           DATA PEMBAYARAN
        ============================== */

        const paymentData = {

            total:
                total,

            CASH:
                Number(
                    this.payment.CASH
                ),

            QRIS:
                Number(
                    this.payment.QRIS
                ),

            DEBIT:
                Number(
                    this.payment.DEBIT
                ),

            TRANSFER:
                Number(
                    this.payment.TRANSFER
                ),

            totalPayment:
                totalPayment,

            change:
                change

        };


       


        /* ==============================
           KIRIM KE SALES
        ============================== */

        if (
            typeof Sales.confirmPayment ===
            "function"
        ) {

            Sales.confirmPayment(
                paymentData
            );

        }

    }

};