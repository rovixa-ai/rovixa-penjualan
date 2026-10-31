Object.assign(
    Sales,
    {
        async confirmPayment(paymentData) {

            if (
                typeof Loading !== "undefined" &&
                typeof Loading.show === "function"
            ) {
                Loading.show(
                    "Memproses pembayaran..."
                );
            }


            try {

                


                /* ======================================
                   VALIDASI CART
                   ====================================== */

                if (
                    !this.cart ||
                    !this.cart.length
                ) {

                    Notification.warning(
                        "Keranjang masih kosong."
                    );

                    return;
                }


                /* ======================================
                   VALIDASI PEMBAYARAN
                   ====================================== */

                const total =
                    Number(paymentData.total) || 0;

                const totalPayment =
                    Number(paymentData.totalPayment) || 0;

                if (totalPayment < total) {

                    Notification.warning(
                        "Total pembayaran masih kurang."
                    );

                    return;
                }


                /* ======================================
                   TRANSACTION ID
                   ====================================== */

                const id =
                    this.generateTransactionID();


                /* ======================================
                   TANGGAL TRANSAKSI
                   ====================================== */

                const tanggal =
                    this.formatTransactionDate(
                        new Date()
                    );


                /* ======================================
                   USER / KASIR LOGIN
                   ====================================== */

                if (
                    typeof Auth === "undefined" ||
                    typeof Auth.getCurrentUser !==
                        "function"
                ) {

                    throw new Error(
                        "Auth tidak tersedia."
                    );

                }


                const currentUser =
                    Auth.getCurrentUser();


                if (!currentUser) {

                    throw new Error(
                        "User kasir belum login."
                    );

                }


                const kasir =
                    String(
                        currentUser.nama ||
                        currentUser.username ||
                        ""
                    ).trim();


                if (!kasir) {

                    throw new Error(
                        "Nama kasir yang sedang login tidak ditemukan."
                    );

                }


                /* ======================================
                   TAHUN TRANSAKSI
                   ====================================== */

                const transactionDate =
                    new Date();

                const transactionYear =
                    transactionDate.getFullYear();

                if (!transactionYear) {

                    throw new Error(
                        "Tahun transaksi tidak valid."
                    );
                }


                /* ======================================
                   DATABASE TRANSAKSI

                   TRANSAKSI SELALU MENGGUNAKAN
                   DATABASE CONFIG LOKAL.

                   Tidak ada request server di
                   dalam proses pembayaran.
                ====================================== */

                if (
                    typeof DatabaseConfig ===
                    "undefined"
                ) {

                    throw new Error(
                        "DatabaseConfig tidak tersedia."
                    );
                }


                if (
                    typeof DatabaseConfig.getActiveDatabase !==
                    "function"
                ) {

                    throw new Error(
                        "Konfigurasi database lokal tidak tersedia."
                    );
                }


                const localDatabase =
                    DatabaseConfig.getActiveDatabase();


                if (
                    !localDatabase
                ) {

                    throw new Error(
                        "Database aktif tidak ditemukan."
                    );
                }


                const resolvedYear =
                    Number(
                        localDatabase.year ||
                        transactionYear
                    );


                const penjualanId =
                    String(
                        localDatabase.penjualan ||
                        ""
                    ).trim();


                const detailPenjualanId =
                    String(
                        localDatabase.detailPenjualan ||
                        ""
                    ).trim();


                const pembayaranId =
                    String(
                        localDatabase.pembayaran ||
                        ""
                    ).trim();


                if (!resolvedYear) {

                    throw new Error(
                        "Tahun database lokal tidak valid."
                    );
                }


                if (!penjualanId) {

                    throw new Error(
                        "Database Penjualan lokal belum dikonfigurasi."
                    );
                }


                if (!detailPenjualanId) {

                    throw new Error(
                        "Database Detail Penjualan lokal belum dikonfigurasi."
                    );
                }


                if (!pembayaranId) {

                    throw new Error(
                        "Database Pembayaran lokal belum dikonfigurasi."
                    );
                }


                /* ======================================
                   VALIDASI DATABASE
                   ====================================== */

                if (!resolvedYear) {

                    throw new Error(
                        "Tahun database tidak valid."
                    );
                }


                if (!penjualanId) {

                    throw new Error(
                        "Database Penjualan tidak valid."
                    );
                }


                if (!detailPenjualanId) {

                    throw new Error(
                        "Database Detail Penjualan tidak valid."
                    );
                }


                if (!pembayaranId) {

                    throw new Error(
                        "Database Pembayaran tidak valid."
                    );
                }


                /* ======================================
                   RECEIPT
                   ====================================== */

                const receiptOpened =
                    Receipt.open();


                /* ======================================
                   HITUNG SUBTOTAL
                   ====================================== */

                const subtotal =
                    this.cart.reduce(
                        (total, item) => {

                            const qty =
                                Number(item.qty) || 0;

                            const harga =
                                Number(item.harga) || 0;

                            return (
                                total +
                                qty * harga
                            );

                        },
                        0
                    );


                /* ======================================
                   DISCOUNT ITEM
                   ====================================== */

                const unitDiscount =
                    this.cart.reduce(
                        (total, item) => {

                            const qty =
                                Number(item.qty) || 0;

                            const discount =
                                Math.max(
                                    0,
                                    Number(item.discount) || 0
                                );

                            return (
                                total +
                                qty * discount
                            );

                        },
                        0
                    );


                /* ======================================
                   DISCOUNT TRANSAKSI
                   ====================================== */

                const discount =
                    Math.max(
                        0,
                        Number(this.discount) || 0
                    );


                const totalDiscount =
                    unitDiscount + discount;


                /* ======================================
                   GRAND TOTAL
                   ====================================== */

                const grandTotal =
                    Math.max(
                        0,
                        subtotal - totalDiscount
                    );


                if (
                    totalPayment < grandTotal
                ) {

                    Notification.warning(
                        "Total pembayaran masih kurang."
                    );

                    return;
                }


                /* ======================================
                   DETAIL ITEMS
                   ====================================== */

                const items =
                    this.cart.map(item => ({

                        kode:
                            String(
                                item.kode || ""
                            ).trim(),

                        nama:
                            item.nama || "",

                        satuan:
                            String(
                                item.satuan || ""
                            ).trim(),

                        qty:
                            Number(item.qty) || 0,

                        konversi:
                            Number(item.konversi) || 1,

                        harga:
                            Number(item.harga) || 0,

                        discount:
                            Math.max(
                                0,
                                Number(item.discount) || 0
                            ),

                        subtotal:
                            (
                                Number(item.qty) || 0
                            ) *
                            (
                                Number(item.harga) || 0
                            ),

                        stok:
                            Number(item.stok) || 0

                    }));


                /* ======================================
                   VALIDASI STOCK
                   ====================================== */

                if (
                    typeof Loading !== "undefined" &&
                    typeof Loading.setMessage === "function"
                ) {

                    Loading.setMessage(
                        "Memeriksa stok..."
                    );
                }


                const stokValid =
                    await this.validateLocalStock(
                        items
                    );


                if (!stokValid) {
                    return;
                }


                /* ======================================
                   DATABASE SNAPSHOT

                   Snapshot disimpan bersama transaksi.

                   Background sync nantinya menggunakan
                   snapshot ini dan tidak perlu resolve
                   database dari server.
                ====================================== */

                const databaseSnapshot = {

                    year:
                        resolvedYear,

                    penjualanId:
                        penjualanId,

                    detailPenjualanId:
                        detailPenjualanId,

                    pembayaranId:
                        pembayaranId

                };


                /* ======================================
                   PENJUALAN
                   ====================================== */

                const penjualan = {

                    id,

                    tanggal,

                    year:
                        resolvedYear,

                    kasir,

                    subtotal,

                    disc:
                        discount,

                    total:
                        grandTotal,

                    status:
                        "Selesai",

                    syncStatus:
                        "pending",

                    createdAt:
                        tanggal,

                    database:
                        databaseSnapshot

                };


                /* ======================================
                   DETAIL PENJUALAN
                   ====================================== */

                const detail =
                    items.map(item => ({

                        id,

                        year:
                            resolvedYear,

                        kode:
                            item.kode,

                        nama:
                            item.nama,

                        satuan:
                            item.satuan,

                        qty:
                            item.qty,

                        konversi:
                            item.konversi,

                        harga:
                            item.harga,

                        discount:
                            item.discount,

                        subtotal:
                            item.subtotal

                    }));


                /* ======================================
                   PEMBAYARAN
                   ====================================== */

                const pembayaran = [];


                const cash =
                    Number(paymentData.CASH) || 0;

                const change =
                    Number(paymentData.change) || 0;


                if (
                    cash > 0 ||
                    change > 0
                ) {

                    pembayaran.push({

                        id,

                        year:
                            resolvedYear,

                        metode:
                            "CASH",

                        nominal:
                            cash,

                        kembalian:
                            change

                    });
                }


                const qris =
                    Number(paymentData.QRIS) || 0;


                if (qris > 0) {

                    pembayaran.push({

                        id,

                        year:
                            resolvedYear,

                        metode:
                            "QRIS",

                        nominal:
                            qris,

                        kembalian:
                            0

                    });
                }


                const debit =
                    Number(paymentData.DEBIT) || 0;


                if (debit > 0) {

                    pembayaran.push({

                        id,

                        year:
                            resolvedYear,

                        metode:
                            "DEBIT",

                        nominal:
                            debit,

                        kembalian:
                            0

                    });
                }


                const transfer =
                    Number(paymentData.TRANSFER) || 0;


                if (transfer > 0) {

                    pembayaran.push({

                        id,

                        year:
                            resolvedYear,

                        metode:
                            "TRANSFER",

                        nominal:
                            transfer,

                        kembalian:
                            0

                    });
                }


                /* ======================================
                   SIMPAN LOCAL DATABASE

                   INI ADALAH PROSES UTAMA TRANSAKSI.

                   Tidak ada API / server di sini.
                ====================================== */

                if (
                    typeof Loading !== "undefined" &&
                    typeof Loading.setMessage === "function"
                ) {

                    Loading.setMessage(
                        "Menyimpan transaksi..."
                    );
                }


                await LocalDB.put(
                    "penjualan",
                    penjualan
                );


                for (const item of detail) {

                    await LocalDB.add(
                        "detailPenjualan",
                        item
                    );
                }


                for (const payment of pembayaran) {

                    await LocalDB.add(
                        "pembayaran",
                        payment
                    );
                }


                /* ======================================
                   KURANGI STOCK LOKAL
                   ====================================== */

                if (
                    typeof Loading !== "undefined" &&
                    typeof Loading.setMessage === "function"
                ) {

                    Loading.setMessage(
                        "Memperbarui stok..."
                    );
                }


                await this.reduceLocalStock(
                    items
                );


                /* ======================================
                   RECEIPT
                   ====================================== */

                if (receiptOpened) {

                    Receipt.render({

                        id,

                        tanggal,

                        kasir,

                        subtotal,

                        discount:
                            totalDiscount,

                        transactionDiscount:
                            discount,

                        total:
                            grandTotal,

                        items,

                        pembayaran

                    });
                }


                /* ======================================
                   CLEAR PAYMENT + CART
                   ====================================== */

                PaymentModal.close();

                Cart.clear();


                /* ======================================
                   CUSTOMER SCREEN
                   ====================================== */

                if (
                    typeof CustScreen !== "undefined" &&
                    typeof CustScreen.finished ===
                    "function"
                ) {

                    CustScreen.finished({

                        id,

                        subtotal,

                        discount:
                            totalDiscount,

                        total:
                            grandTotal

                    });
                }


                /* ======================================
                   RELOAD PRODUCTS
                   ====================================== */

                if (
                    typeof Loading !== "undefined" &&
                    typeof Loading.setMessage === "function"
                ) {

                    Loading.setMessage(
                        "Memperbarui produk..."
                    );
                }


                await this.loadProducts();


                /* ======================================
                   TRANSAKSI LOKAL SELESAI

                   Setelah titik ini, kasir tidak lagi
                   menunggu server.

                   Loading akan dimatikan oleh finally.
                ====================================== */

                Notification.success(
                    "Pembayaran berhasil disimpan."
                );


                /* ======================================
                   BACKGROUND SYNC

                   PENTING:

                   Jangan menggunakan await.

                   Proses upload berjalan di background.

                   Jika online:
                   → LocalSync mencoba upload.

                   Jika offline:
                   → LocalSync gagal dengan aman,
                     transaksi tetap pending.

                   Saat online kembali,
                   initOnlineListener() akan
                   menjalankan syncPendingTransactions().

                   Error background ditangani di sini
                   dan tidak mengganggu transaksi kasir.
                ====================================== */

                if (
                    typeof LocalSync !== "undefined" &&
                    typeof LocalSync.syncTransaction ===
                    "function"
                ) {

                    Promise.resolve()
                        .then(
                            () =>
                                LocalSync.syncTransaction(
                                    id
                                )
                        )
                        .then(
                            result => {

                               
                            }
                        )
                        .catch(
                            error => {

                                console.error(
                                    "BACKGROUND SYNC ERROR:",
                                    id,
                                    error
                                );

                            }
                        );
                }


                return;

            }


            catch (error) {

                console.error(
                    "CONFIRM PAYMENT ERROR:",
                    error
                );

                Notification.error(
                    "Pembayaran gagal.\n\n" +
                    error.message
                );

            }


           finally {

    /* ======================================
       MATIKAN LOADING
    ====================================== */

    if (
        typeof Loading !== "undefined" &&
        typeof Loading.hide === "function"
    ) {

        Loading.hide();

    }


    /* ======================================
       RESET MOBILE CART
    ====================================== */

    const salesPage =
        document.querySelector(".sales-mobile-page");

    if (salesPage) {

        salesPage.classList.remove(
            "mobile-cart-open"
        );

    }


    const pos =
        document.querySelector(".pos");

    if (pos) {

        pos.classList.remove(
            "mobile-cart-open"
        );

    }


    /* ======================================
       KEMBALI KE HALAMAN SALES
    ====================================== */

    if (
        typeof Sidebar !== "undefined" &&
        typeof Sidebar.open === "function"
    ) {

        Sidebar.open("sales");

    }

}
        },


        /* ======================================
           GENERATE TRANSACTION ID
           ====================================== */

        generateTransactionID() {

            const now =
                new Date();

            const pad =
                value =>
                    String(value)
                        .padStart(2, "0");


            const yy =
                String(
                    now.getFullYear()
                ).slice(-2);

            const mm =
                pad(
                    now.getMonth() + 1
                );

            const dd =
                pad(
                    now.getDate()
                );

            const hh =
                pad(
                    now.getHours()
                );

            const mi =
                pad(
                    now.getMinutes()
                );

            const ss =
                pad(
                    now.getSeconds()
                );

            const random =
                Math.floor(
                    100 +
                    Math.random() * 900
                );


            return (
                `PJ-${yy}${mm}${dd}-${hh}${mi}${ss}-${random}`
            );

        },


        /* ======================================
           VALIDATE LOCAL STOCK
           ====================================== */

        async validateLocalStock(
            items
        ) {

            const barangList =
                await LocalDB.getAll(
                    "barang"
                );


            for (
                const item of items
            ) {

                const barang =
                    barangList.find(
                        row =>
                            String(
                                row.kode || ""
                            ).trim() ===
                            String(
                                item.kode || ""
                            ).trim()
                    );


                if (!barang) {

                    Notification.warning(
                        `Barang ${item.nama || item.kode} tidak ditemukan.`
                    );

                    return false;

                }


                const qty =
                    Number(item.qty) || 0;

                const konversi =
                    Number(item.konversi) || 1;

                const kebutuhan =
                    qty * konversi;

                const stok =
                    Number(barang.stok) || 0;


                if (
                    kebutuhan > stok
                ) {

                    Notification.warning(
                        `Stok ${item.nama || item.kode} tidak mencukupi.\n\n` +
                        `Stok tersedia: ${stok}\n` +
                        `Kebutuhan: ${kebutuhan}`
                    );

                    return false;

                }

            }


            return true;

        },


        /* ======================================
           REDUCE LOCAL STOCK
           ====================================== */

        async reduceLocalStock(
            items
        ) {

            for (
                const item of items
            ) {

                const barang =
                    await LocalDB.get(
                        "barang",
                        item.kode
                    );


                if (!barang) {

                    throw new Error(
                        `Barang ${item.nama || item.kode} tidak ditemukan.`
                    );

                }


                const qty =
                    Number(item.qty) || 0;

                const konversi =
                    Number(item.konversi) || 1;

                const kebutuhan =
                    qty * konversi;


                const stok =
                    Number(barang.stok) || 0;

                const stokBaru =
                    stok - kebutuhan;


                if (
                    stokBaru < 0
                ) {

                    throw new Error(
                        `Stok ${item.nama || item.kode} menjadi negatif.`
                    );

                }


                barang.stok =
                    stokBaru;


                await LocalDB.put(
                    "barang",
                    barang
                );

            }

        },


        /* ======================================
           FORMAT TRANSACTION DATE
           ====================================== */

        formatTransactionDate(
            date
        ) {

            const pad =
                value =>
                    String(value)
                        .padStart(2, "0");


            return (
                `${pad(date.getDate())}/` +
                `${pad(date.getMonth() + 1)}/` +
                `${date.getFullYear()} ` +
                `${pad(date.getHours())}:` +
                `${pad(date.getMinutes())}`
            );

        },


        /* ======================================
           MONEY
           ====================================== */

        money(
            value
        ) {

            return new Intl.NumberFormat(
                "id-ID",
                {
                    style: "currency",
                    currency: "IDR",
                    maximumFractionDigits: 0
                }
            ).format(
                Number(value) || 0
            );

        }

    }
);