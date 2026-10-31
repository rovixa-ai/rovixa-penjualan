/*======================================
REPORT DESKTOP RENDER
TREEHOUSE POS
======================================*/

const ReportDesktopRender = {

    render() {

        return `
            <div
                class="report-modal-overlay-desktop"
                id="reportModalOverlay"
            >

                <div
                    class="report-modal-desktop"
                    id="reportModal"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="reportModalTitle"
                >

                    <div class="report-page-desktop">

                        <div class="report-header-desktop">

                            <div>
                                <h2 id="reportModalTitle">
                                    Report Penjualan
                                </h2>

                                <p>
                                    Laporan transaksi penjualan
                                </p>
                            </div>

                            <div class="report-header-actions-desktop">

                                <button
                                    type="button"
                                    class="report-button-desktop primary"
                                    id="reportLaporanButton"
                                >
                                    <img
                                        src="icons/print.png"
                                        alt="Print"
                                    >

                                    <span>Print</span>
                                </button>

                                <button
                                    type="button"
                                    class="report-modal-close-desktop"
                                    id="reportModalClose"
                                    aria-label="Tutup Report"
                                >
                                    ×
                                </button>

                            </div>

                        </div>

                        <div class="report-filter-desktop">

                            <div class="report-filter-group-desktop">

                                <label>Tanggal</label>

                                <input
                                    type="date"
                                    id="reportDate"
                                >

                            </div>

                            <div class="report-filter-group-desktop">

                                <label>Kasir</label>

                                <select id="reportKasir">

                                    <option value="">
                                        Semua Kasir
                                    </option>

                                </select>

                            </div>

                            <div class="report-filter-actions-desktop">

                                <button
                                    type="button"
                                    class="report-button-desktop"
                                    id="reportResetButton"
                                >
                                    Reset
                                </button>

                            </div>

                        </div>

                        <div
                            class="report-summary-desktop"
                            id="reportSummary"
                        >

                            <div class="report-card-desktop">
                                <span>Total Transaksi</span>
                                <strong id="reportTotalTransaksi">0</strong>
                            </div>

                            <div class="report-card-desktop">
                                <span>Total Item</span>
                                <strong id="reportTotalItem">0</strong>
                            </div>

                            <div class="report-card-desktop">
                                <span>Subtotal</span>
                                <strong id="reportSubtotal">Rp 0</strong>
                            </div>

                            <div class="report-card-desktop">
                                <span>Discount</span>
                                <strong id="reportDiscount">Rp 0</strong>
                            </div>

                            <div class="report-card-desktop total">
                                <span>Total Penjualan</span>
                                <strong id="reportTotal">Rp 0</strong>
                            </div>

                            <div class="report-card-desktop payment">
                                <span>Cash</span>
                                <strong id="reportCash">Rp 0</strong>
                            </div>

                            <div class="report-card-desktop payment">
                                <span>QRIS</span>
                                <strong id="reportQRIS">Rp 0</strong>
                            </div>

                            <div class="report-card-desktop payment">
                                <span>Debit</span>
                                <strong id="reportDebit">Rp 0</strong>
                            </div>

                            <div class="report-card-desktop payment">
                                <span>Transfer</span>
                                <strong id="reportTransfer">Rp 0</strong>
                            </div>

                            <div class="report-card-desktop payment total-payment">
                                <span>Total Pembayaran</span>
                                <strong id="reportTotalPayment">Rp 0</strong>
                            </div>

                        </div>

                        <div class="report-table-wrapper-desktop">

                            <div class="report-table-header-desktop">
                                <h3>Daftar Penjualan</h3>
                            </div>

                            <div class="report-table-scroll-desktop">

                                <table class="report-table-desktop">

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
                                            <td colspan="9" class="report-empty-desktop">
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