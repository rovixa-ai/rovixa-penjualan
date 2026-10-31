/*======================================
REPORT MOBILE RENDER
TREEHOUSE POS
======================================*/

const ReportMobileRender = {

    render() {

        return `
            <div
                class="report-modal-overlay-mobile"
                id="reportModalOverlay"
            >

                <div
                    class="report-modal-mobile"
                    id="reportModal"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="reportModalTitle"
                >

                    <div class="report-page-mobile">

                        <div class="report-header-mobile">

                            <div class="report-header-content-mobile">

                                <h2 id="reportModalTitle">
                                    Report Penjualan
                                </h2>

                                <p>
                                    Laporan transaksi penjualan
                                </p>

                            </div>

                            <button
                                    type="button"
                                    class="report-modal-close-mobile"
                                    id="reportModalClose"
                                    aria-label="Tutup Report"
                                >
                                    ×
                                </button>

                            

                        </div>

                        <div class="report-filter-mobile">

                            <div class="report-filter-group-mobile">

                                <label>Tanggal</label>

                                <input
                                    type="date"
                                    id="reportDate"
                                >

                            </div>

                            <div class="report-filter-group-mobile">

                                <label>Kasir</label>

                                <select id="reportKasir">

                                    <option value="">
                                        Semua Kasir
                                    </option>

                                </select>

                            </div>

                           
                        </div>

                         <div class="report-header-actions-mobile">

                                <button
                                    type="button"
                                    class="report-button-mobile primary"
                                    id="reportLaporanButton"
                                >
                                    <img
                                        src="icons/print.png"
                                        alt="Print"
                                    >

                                    <span>Print</span>
                                </button>

                                

                            </div>

                        <div
                            class="report-summary-mobile"
                            id="reportSummary"
                        >

                            <div class="report-card-mobile">
                                <span>Total Transaksi</span>
                                <strong id="reportTotalTransaksi">0</strong>
                            </div>

                            <div class="report-card-mobile">
                                <span>Total Item</span>
                                <strong id="reportTotalItem">0</strong>
                            </div>

                            <div class="report-card-mobile">
                                <span>Subtotal</span>
                                <strong id="reportSubtotal">Rp 0</strong>
                            </div>

                            <div class="report-card-mobile">
                                <span>Discount</span>
                                <strong id="reportDiscount">Rp 0</strong>
                            </div>

                            <div class="report-card-mobile total">
                                <span>Total Penjualan</span>
                                <strong id="reportTotal">Rp 0</strong>
                            </div>

                            <div class="report-card-mobile payment">
                                <span>Cash</span>
                                <strong id="reportCash">Rp 0</strong>
                            </div>

                            <div class="report-card-mobile payment">
                                <span>QRIS</span>
                                <strong id="reportQRIS">Rp 0</strong>
                            </div>

                            <div class="report-card-mobile payment">
                                <span>Debit</span>
                                <strong id="reportDebit">Rp 0</strong>
                            </div>

                            <div class="report-card-mobile payment">
                                <span>Transfer</span>
                                <strong id="reportTransfer">Rp 0</strong>
                            </div>

                            <div class="report-card-mobile payment total-payment">
                                <span>Total Pembayaran</span>
                                <strong id="reportTotalPayment">Rp 0</strong>
                            </div>

                        </div>

                        <div class="report-table-wrapper-mobile">

                            <div class="report-table-header-mobile">
                                <h3>Daftar Penjualan</h3>
                            </div>

                            <div class="report-table-scroll-mobile">

                                <table class="report-table-mobile">

                                    <thead>
                                        <tr>
                                            <th>No</th>
                                            <th>ID</th>
                                            <th>Tanggal</th>
                                            <th>Kasir</th>
                                            <th>Subtotal</th>
                                            <th>Disc</th>
                                            <th>Total</th>
                                            <th>Status</th>
                                        </tr>
                                    </thead>

                                    <tbody id="reportTableBody">
                                        <tr>
                                            <td colspan="9" class="report-empty-mobile">
                                                Memuat data...
                                            </td>
                                        </tr>
                                    </tbody>

                                </table>

                            </div>

                        </div>

                    </div>

                </div>

            </div>
        `;

    }

};