// ======================================
// REPORT FILTER
// ======================================

Object.assign(
    Report,
    {

        /* ==================================
           EVENT
        ================================== */

        event() {

            const search =
                document.getElementById(
                    "reportFilterButton"
                );


            const reset =
                document.getElementById(
                    "reportResetButton"
                );


            const laporan =
                document.getElementById(
                    "reportLaporanButton"
                );


            const table =
                document.getElementById(
                    "reportTableBody"
                );


            const tanggal =
                document.getElementById(
                    "reportDate"
                );


            /* ==================================
               FILTER
            ================================== */

            if (search) {

                search.addEventListener(
                    "click",
                    () => {

                        this.load();

                    }
                );

            }


            /* ==================================
               TANGGAL
               LOAD OTOMATIS
            ================================== */

            if (tanggal) {

                tanggal.addEventListener(
                    "change",
                    () => {

                        this.load();

                    }
                );

            }


            /* ==================================
               RESET
            ================================== */

            if (reset) {

                reset.addEventListener(
                    "click",
                    () => {

                        this.setDefaultDate();


                        const kasir =
                            document.getElementById(
                                "reportKasir"
                            );


                        if (kasir) {

                            kasir.value =
                                "";

                        }


                        this.load();

                    }
                );

            }


            /* ==================================
               KASIR
            ================================== */

            const kasir =
                document.getElementById(
                    "reportKasir"
                );


            if (kasir) {

                kasir.addEventListener(
                    "change",
                    () => {

                        this.applyKasirFilter();

                    }
                );

            }


            /* ==================================
               DETAIL
            ================================== */

            if (table) {

                table.addEventListener(
                    "click",
                    event => {

                        const button =
                            event.target.closest(
                                "[data-action='detail']"
                            );


                        if (!button) {

                            return;

                        }


                        this.detail(
                            button.dataset.id
                        );

                    }
                );

            }


            /* ==================================
               LAPORAN
            ================================== */

            if (laporan) {

                laporan.addEventListener(
                    "click",
                    async () => {

                        await this.laporan();

                    }
                );

            }

        },


        /* ==================================
           DEFAULT DATE
        ================================== */

        setDefaultDate() {

            const input =
                document.getElementById(
                    "reportDate"
                );


            if (!input) {

                return;

            }


            const today =
                new Date();


            const year =
                today.getFullYear();


            const month =
                String(
                    today.getMonth() + 1
                )
                .padStart(
                    2,
                    "0"
                );


            const day =
                String(
                    today.getDate()
                )
                .padStart(
                    2,
                    "0"
                );


            input.value =
                `${year}-${month}-${day}`;

        },


        /* ==================================
           LOAD REPORT
           INDEXEDDB BERDASARKAN TAHUN
        ================================== */

        async load() {

            const tanggal =
                document.getElementById(
                    "reportDate"
                )?.value || "";


            const kasirSelect =
                document.getElementById(
                    "reportKasir"
                );


            const selectedKasir =
                kasirSelect?.value || "";


            /* ==================================
               VALIDASI TANGGAL
            ================================== */

            if (!tanggal) {

                Notification.warning(
                    "Tanggal laporan belum dipilih."
                );

                return;

            }


            /* ==================================
               TENTUKAN TAHUN
            ================================== */

            const tanggalDate =
                new Date(
                    tanggal + "T00:00:00"
                );


            if (
                isNaN(
                    tanggalDate.getTime()
                )
            ) {

                Notification.error(
                    "Tanggal laporan tidak valid."
                );

                return;

            }


            const reportYear =
                tanggalDate.getFullYear();


            try {

                this.showLoading();


                /* ==================================
                   VALIDASI LOCAL DB
                ================================== */

                if (
                    typeof LocalDB ===
                    "undefined"
                ) {

                    throw new Error(
                        "LocalDB tidak tersedia."
                    );

                }


                /* ==================================
                   CEK TAHUN
                   ================================== */

                let yearDownloaded =
                    await LocalDB.isYearDownloaded(
                        reportYear
                    );


               


                /* ==================================
                   DOWNLOAD JIKA TAHUN BELUM ADA
                ================================== */

                if (!yearDownloaded) {

                    if (
                        typeof Download ===
                        "undefined"
                    ) {

                        throw new Error(
                            "Download tidak tersedia."
                        );

                    }


                    if (
                        typeof Download.download !==
                        "function"
                    ) {

                        throw new Error(
                            "Fungsi download database tidak tersedia."
                        );

                    }


                   

                    await Download.download(
                        reportYear
                    );


                    yearDownloaded =
                        await LocalDB.isYearDownloaded(
                            reportYear
                        );


                    if (!yearDownloaded) {

                        throw new Error(
                            "Database Penjualan tahun " +
                            reportYear +
                            " gagal tersedia di IndexedDB."
                        );

                    }

                }


                /* ==================================
                   AMBIL DATA PENJUALAN
                   BERDASARKAN TAHUN
                ================================== */

                const penjualan =
                    await LocalDB.getAllByYear(
                        "penjualan",
                        reportYear
                    );


                /* ==================================
                   AMBIL DETAIL
                   BERDASARKAN TAHUN
                ================================== */

                const detailPenjualan =
                    await LocalDB.getAllByYear(
                        "detailPenjualan",
                        reportYear
                    );


                /* ==================================
                   AMBIL PEMBAYARAN
                   BERDASARKAN TAHUN
                ================================== */

                const pembayaran =
                    await LocalDB.getAllByYear(
                        "pembayaran",
                        reportYear
                    );


               

                /* ==================================
                   NORMALISASI TANGGAL
                ================================== */

                const targetDate =
                    tanggal;


                /* ==================================
                   INDEX DETAIL BERDASARKAN ID
                ================================== */

                const detailById =
                    {};


                detailPenjualan.forEach(
                    detail => {

                        const id =
                            String(
                                detail.id ||
                                ""
                            ).trim();


                        if (!id) {

                            return;

                        }


                        if (
                            !detailById[id]
                        ) {

                            detailById[id] =
                                [];

                        }


                        detailById[id].push(
                            detail
                        );

                    }
                );


                /* ==================================
                   INDEX PEMBAYARAN BERDASARKAN ID
                ================================== */

                const paymentById =
                    {};


                pembayaran.forEach(
                    payment => {

                        const id =
                            String(
                                payment.id ||
                                ""
                            ).trim();


                        if (!id) {

                            return;

                        }


                        if (
                            !paymentById[id]
                        ) {

                            paymentById[id] =
                                [];

                        }


                        paymentById[id].push(
                            payment
                        );

                    }
                );


                /* ==================================
                   FILTER TANGGAL
                ================================== */

                const filteredByDate =
                    penjualan.filter(
                        transaction => {

                            const transactionDate =
                                this.normalizeReportDate(
                                    transaction.tanggal
                                );


                            return (
                                transactionDate ===
                                targetDate
                            );

                        }
                    );


                /* ==================================
                   BENTUK DATA REPORT
                ================================== */

                this.data =
                    filteredByDate.map(
                        transaction => {

                            const id =
                                String(
                                    transaction.id ||
                                    ""
                                ).trim();


                            const details =
                                detailById[id] ||
                                [];


                            const payments =
                                paymentById[id] ||
                                [];


                            let totalItem =
                                0;


                            details.forEach(
                                detail => {

                                    totalItem +=
                                        Number(
                                            detail.qty
                                        ) || 0;

                                }
                            );


                            let CASH =
                                0;

                            let QRIS =
                                0;

                            let DEBIT =
                                0;

                            let TRANSFER =
                                0;

                            let change =
                                0;


                            payments.forEach(
                                payment => {

                                    const metode =
                                        String(
                                            payment.metode ||
                                            ""
                                        )
                                        .trim()
                                        .toUpperCase();


                                    const nominal =
                                        Number(
                                            payment.nominal
                                        ) || 0;


                                    if (
                                        metode ===
                                        "CASH"
                                    ) {

                                        CASH +=
                                            nominal;

                                    }


                                    else if (
                                        metode ===
                                        "QRIS"
                                    ) {

                                        QRIS +=
                                            nominal;

                                    }


                                    else if (
                                        metode ===
                                        "DEBIT"
                                    ) {

                                        DEBIT +=
                                            nominal;

                                    }


                                    else if (
                                        metode ===
                                        "TRANSFER"
                                    ) {

                                        TRANSFER +=
                                            nominal;

                                    }


                                    change +=
                                        Number(
                                            payment.kembalian
                                        ) || 0;

                                }
                            );


                            return {

                                id:
                                    id,

                                tanggal:
                                    transaction.tanggal ||
                                    "",

                                kasir:
                                    String(
                                        transaction.kasir ||
                                        ""
                                    ).trim(),

                                subtotal:
                                    Number(
                                        transaction.subtotal
                                    ) || 0,

                                disc:
                                    Number(
                                        transaction.disc
                                    ) || 0,

                                total:
                                    Number(
                                        transaction.total
                                    ) || 0,

                                status:
                                    String(
                                        transaction.status ||
                                        ""
                                    ).trim(),

                                totalItem:
                                    totalItem,

                                qty:
                                    totalItem,

                                CASH:
                                    CASH,

                                QRIS:
                                    QRIS,

                                DEBIT:
                                    DEBIT,

                                TRANSFER:
                                    TRANSFER,

                                change:
                                    change

                            };

                        }
                    );


                

                /* ==================================
                   DROPDOWN KASIR
                ================================== */

                this.renderKasir();


                /* ==================================
                   FILTER KASIR FRONTEND
                ================================== */

                this.applyKasirFilter(
                    selectedKasir
                );

            }


            catch (error) {

                console.error(
                    "REPORT LOAD ERROR:",
                    error
                );


                this.data =
                    [];

                this.filtered =
                    [];


                this.renderKasir();

                this.renderTable();

                this.renderSummary();


                this.showError(
                    error.message ||
                    "Gagal mengambil laporan."
                );

            }

        },


        /* ==================================
           NORMALIZE REPORT DATE
        ================================== */

        normalizeReportDate(value) {

    if (!value) {
        return "";
    }

    /* ======================================
       ISO DATE / UTC
       CONTOH:
       2026-10-01T17:58:00.000Z

       DIKONVERSI KE WAKTU LOKAL
       SEBELUM MENGAMBIL TANGGAL
       ====================================== */

    if (typeof value === "string") {

        // Format yyyy-MM-dd tanpa waktu
        if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
            return value;
        }

        // Format ISO / UTC
        if (
            /^\d{4}-\d{2}-\d{2}T/.test(value)
        ) {

            const date =
                new Date(value);

            if (!isNaN(date.getTime())) {

                const year =
                    date.getFullYear();

                const month =
                    String(
                        date.getMonth() + 1
                    ).padStart(2, "0");

                const day =
                    String(
                        date.getDate()
                    ).padStart(2, "0");

                return `${year}-${month}-${day}`;
            }
        }

        // Format lokal:
        // dd/MM/yyyy
        // dd/MM/yyyy HH:mm
        const localMatch =
            value.match(
                /^(\d{1,2})\/(\d{1,2})\/(\d{2}|\d{4})(?:\s|$)/
            );

        if (localMatch) {

            const day =
                String(
                    Number(localMatch[1])
                ).padStart(2, "0");

            const month =
                String(
                    Number(localMatch[2])
                ).padStart(2, "0");

            let year =
                Number(localMatch[3]);

            if (year < 100) {
                year += 2000;
            }

            return `${year}-${month}-${day}`;
        }
    }

    /* ======================================
       DATE OBJECT
       ====================================== */

    if (value instanceof Date) {

        if (isNaN(value.getTime())) {
            return "";
        }

        const year =
            value.getFullYear();

        const month =
            String(
                value.getMonth() + 1
            ).padStart(2, "0");

        const day =
            String(
                value.getDate()
            ).padStart(2, "0");

        return `${year}-${month}-${day}`;
    }

    return "";
},


        /* ==================================
   APPLY KASIR FILTER
================================== */

applyKasirFilter() {

    const select =
        document.getElementById(
            "reportKasir"
        );

    const user =
        typeof Auth !== "undefined" &&
        typeof Auth.getCurrentUser === "function"
            ? Auth.getCurrentUser()
            : null;

    const namaKasir =
        String(user?.nama || "")
            .trim()
            .toLowerCase();

    const usernameKasir =
        String(user?.username || "")
            .trim()
            .toLowerCase();

    if (!user || (!namaKasir && !usernameKasir)) {

        this.filtered = [];

        this.renderTable();

        this.renderSummary();

        return;
    }

    this.filtered =
        (this.data || []).filter(item => {

            const kasir =
                String(item.kasir || "")
                    .trim()
                    .toLowerCase();

            return (
                (namaKasir && kasir === namaKasir) ||
                (usernameKasir && kasir === usernameKasir)
            );

        });

    this.renderTable();

    this.renderSummary();

},


/* ==================================
   RENDER KASIR
================================== */

renderKasir() {

    const select =
        document.getElementById(
            "reportKasir"
        );

    if (!select) {
        return;
    }

    const user =
        typeof Auth !== "undefined" &&
        typeof Auth.getCurrentUser === "function"
            ? Auth.getCurrentUser()
            : null;

    const namaKasir =
        String(user?.nama || "").trim();

    const usernameKasir =
        String(user?.username || "").trim();

    const labelKasir =
        namaKasir || usernameKasir;

    if (!user || !labelKasir) {

        select.innerHTML = `
            <option value="">
                Kasir tidak tersedia
            </option>
        `;

        select.value = "";

        select.disabled = true;

        return;
    }

    select.disabled = false;

    select.innerHTML = `
        <option value="${this.escapeHTML(labelKasir)}">
            ${this.escapeHTML(labelKasir)}
        </option>
    `;

    select.value = labelKasir;

},


// ======================================
// LAPORAN
// BUAT LAPORAN + PRINT
// ======================================

async laporan() {

    const button =
        document.getElementById(
            "reportLaporanButton"
        );

    const tanggal =
        document.getElementById(
            "reportDate"
        )?.value;

    if (!tanggal) {

        Dialog.warning(
            "Tanggal laporan belum dipilih."
        );

        return;
    }

    try {

        /* ==================================
           TAHUN LAPORAN
        ================================== */

        const reportYear =
            new Date(
                tanggal + "T00:00:00"
            ).getFullYear();

        /* ==================================
           LOADING ON
        ================================== */

        if (
            typeof Loading !== "undefined" &&
            typeof Loading.show === "function"
        ) {

            Loading.show(
                "Mempersiapkan laporan..."
            );

            await new Promise(
                resolve =>
                    setTimeout(
                        resolve,
                        50
                    )
            );

        }

        /* ==================================
           VALIDASI API
        ================================== */

        if (
            typeof API === "undefined"
        ) {

            throw new Error(
                "API tidak tersedia."
            );

        }

        if (
            typeof API.resolvePenjualanDatabase !==
            "function"
        ) {

            throw new Error(
                "API.resolvePenjualanDatabase tidak tersedia."
            );

        }

        /* ==================================
           RESOLVE DATABASE
        ================================== */

        if (
            typeof Loading !== "undefined" &&
            typeof Loading.setMessage === "function"
        ) {

            Loading.setMessage(
                "Mempersiapkan database..."
            );

        }

        const resolved =
            await API.resolvePenjualanDatabase(
                reportYear
            );

       

        /* ==================================
           DATABASE
        ================================== */

        const database = {

            year:
                Number(
                    resolved?.year ||
                    reportYear
                ),

            penjualanId:
                String(
                    resolved?.penjualan ||
                    ""
                ).trim(),

            detailPenjualanId:
                String(
                    resolved?.detailPenjualan ||
                    ""
                ).trim(),

            pembayaranId:
                String(
                    resolved?.pembayaran ||
                    ""
                ).trim()

        };

      

        /* ==================================
           LOADING OFF
        ================================== */

        if (
            typeof Loading !== "undefined" &&
            typeof Loading.hide === "function"
        ) {

            Loading.hide();

        }

        /* ==================================
           KONFIRMASI BUAT LAPORAN
        ================================== */

        const confirmed =
            await Dialog.confirm(
                "Buat laporan?",
                {
                    title: "Konfirmasi Laporan",
                    confirmText: "Buat Laporan",
                    cancelText: "Batal",
                    variant: "default"
                }
            );

        if (!confirmed) {

            return;

        }

        /* ==================================
           LOADING ON
           SIMPAN LAPORAN
        ================================== */

        if (
            typeof Loading !== "undefined" &&
            typeof Loading.show === "function"
        ) {

            Loading.show(
                "Menyimpan laporan..."
            );

        }

        if (button) {

            button.disabled = true;

            button.textContent =
                "Memproses...";

        }

        /* ==================================
           SIMPAN LAPORAN
        ================================== */

        const saveResult =
            await API.post(
                "saveLaporanPenjualan",
                {
                    tanggal,
                    database
                }
            );

        if (
            !saveResult ||
            saveResult.success !== true
        ) {

            throw new Error(
                saveResult?.message ||
                "Gagal menyimpan laporan."
            );

        }

        /* ==================================
           LOADING OFF
        ================================== */

        if (
            typeof Loading !== "undefined" &&
            typeof Loading.hide === "function"
        ) {

            Loading.hide();

        }

        if (button) {

            button.disabled = false;

            button.textContent =
                "Laporan";

        }

        /* ==================================
           KONFIRMASI BUAT PDF
        ================================== */

        const buatPDF =
            await Dialog.confirm(
                "Laporan berhasil disimpan. Apakah kamu ingin membuat file PDF?",
                {
                    title: "Buat File PDF",
                    confirmText: "Buat PDF",
                    cancelText: "Nanti",
                    variant: "default"
                }
            );

        if (!buatPDF) {

            Dialog.success(
                "Laporan berhasil disimpan."
            );

            return;

        }

        /* ==================================
           LOADING ON
           PDF
        ================================== */

        if (
            typeof Loading !== "undefined" &&
            typeof Loading.show === "function"
        ) {

            Loading.show(
                "Membuat file PDF..."
            );

            await new Promise(
                resolve =>
                    setTimeout(
                        resolve,
                        50
                    )
            );

        }

        if (button) {

            button.disabled = true;

            button.textContent =
                "Membuat PDF...";

        }

        /* ==================================
           POPUP PDF
        ================================== */

        const printWindow =
            window.open(
                "",
                "TreehouseLaporanPDF",
                "width=1200,height=800,resizable=yes,scrollbars=yes"
            );

        if (!printWindow) {

            throw new Error(
                "Popup PDF diblokir oleh browser."
            );

        }

        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>
                    Treehouse POS - Laporan Penjualan
                </title>
            </head>

            <body>

                <p>
                    Memproses file PDF...
                </p>

            </body>
            </html>
        `);

        printWindow.document.close();

        /* ==================================
           PRINT PDF
        ================================== */

        const printResult =
            await API.post(
                "printLaporanPenjualan",
                {
                    tanggal,
                    database
                }
            );

        if (
            !printResult ||
            printResult.success !== true ||
            !printResult.url
        ) {

            throw new Error(
                printResult?.message ||
                "Gagal membuat file PDF."
            );

        }

        printWindow.location.href =
            printResult.url;

        /* ==================================
           SELESAI
        ================================== */

        Dialog.success(
            "File PDF berhasil dibuat."
        );

    } catch (error) {

        console.error(
            "REPORT LAPORAN ERROR:",
            error
        );

        if (
            typeof Loading !== "undefined" &&
            typeof Loading.hide === "function"
        ) {

            Loading.hide();

        }

        Dialog.error(
            error.message ||
            "Terjadi kesalahan saat memproses laporan."
        );

    } finally {

        if (
            typeof Loading !== "undefined" &&
            typeof Loading.hide === "function"
        ) {

            Loading.hide();

        }

        if (button) {

            button.disabled = false;

            button.textContent =
                "Laporan";

        }

    }

},


        /* ==================================
           LOADING
        ================================== */

        showLoading() {

            const tbody =
                document.getElementById(
                    "reportTableBody"
                );


            if (!tbody) {

                return;

            }


            tbody.innerHTML = `

                <tr>

                    <td
                        colspan="9"
                        class="report-empty"
                    >
                        Memuat data...
                    </td>

                </tr>

            `;

        },


        /* ==================================
           ERROR
        ================================== */

        showError(
            message
        ) {

            const tbody =
                document.getElementById(
                    "reportTableBody"
                );


            if (!tbody) {

                return;

            }


            tbody.innerHTML = `

                <tr>

                    <td
                        colspan="9"
                        class="report-empty"
                    >
                        ${this.escapeHTML(
                            message
                        )}
                    </td>

                </tr>

            `;

        }

    }
);