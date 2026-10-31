// ======================================
// CUSTOMER SCREEN
// FINISH
// TREEHOUSE POS
// ======================================

const CustScreenFinish = {

    /* ==================================
       RENDER
    ================================== */

    render(data) {

        const main =
            document.getElementById(
                "custMain"
            );


        if (!main) {
            return;
        }


        /* ==================================
           FINISH LAYOUT
        ================================== */

        main.innerHTML = `

            <div class="cust-finish">

                <div class="cust-finish-icon">
                    ✓
                </div>


                <div class="cust-finish-title">
                    Terima Kasih
                </div>


                <div class="cust-finish-message">
                    Transaksi berhasil
                </div>


                <div class="cust-finish-instruction">
                    Sampai jumpa kembali
                </div>

            </div>

        `;


        /* ==================================
           STATUS
        ================================== */

        const statusElement =
            document.querySelector(
                ".cust-status"
            );


        if (statusElement) {

            statusElement.textContent =
                "Transaksi selesai";

        }

    }

};