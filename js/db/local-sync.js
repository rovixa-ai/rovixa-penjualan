/* ======================================
   TREEHOUSE POS
   LOCAL SYNC
   GOOGLE SHEETS → INDEXEDDB
====================================== */

const LocalSync = {

    onlineListenerInitialized: false,
    syncing: false,
    databaseCache: {},


    /* ======================================
       ONLINE LISTENER
    ====================================== */

    initOnlineListener() {

        if (this.onlineListenerInitialized) {
            return;
        }

        this.onlineListenerInitialized = true;

        window.addEventListener(
            "online",
            async () => {

                if (this.syncing) {
                    return;
                }

                await new Promise(
                    resolve => setTimeout(resolve, 1000)
                );

                if (!navigator.onLine) {
                    return;
                }

                try {

                    this.syncing = true;

                    await this.syncPendingTransactions();

                } catch (error) {

                    console.error(
                        "LOCAL SYNC AUTO ERROR:",
                        error
                    );

                } finally {

                    this.syncing = false;

                }

            }
        );

    },


    /* ======================================
       SYNC PRODUCTS
       GOOGLE SHEETS → INDEXEDDB

       PERLINDUNGAN STOK LOKAL:
       - Transaksi belum tersinkron tidak kehilangan
         pengurangan stok lokal.
       - Retur yang belum tersinkron tidak kehilangan
         perubahan stok lokal.
       - Informasi master barang tetap diperbarui
         dari server.
    ====================================== */

    async syncProducts() {

        try {

            if (!navigator.onLine) {

                throw new Error(
                    "Tidak ada koneksi internet."
                );

            }

            if (
                typeof API === "undefined" ||
                typeof API.get !== "function"
            ) {

                throw new Error(
                    "API tidak tersedia."
                );

            }

            if (
                typeof LocalDB === "undefined" ||
                typeof LocalDB.putAll !== "function" ||
                typeof LocalDB.getAll !== "function"
            ) {

                throw new Error(
                    "LocalDB tidak tersedia."
                );

            }


            /* ======================================
               DOWNLOAD DATA TERBARU DARI SERVER
            ====================================== */

            const response =
                await API.get("bootstrap");

            if (
                !response ||
                response.success !== true
            ) {

                throw new Error(
                    response?.message ||
                    "Gagal mengunduh data dari spreadsheet."
                );

            }

            const data =
                response.data || {};

            if (
                !Array.isArray(data.barang) ||
                !Array.isArray(data.satuan)
            ) {

                throw new Error(
                    "Data barang atau satuan dari server tidak valid."
                );

            }


            /* ======================================
               AMBIL DATA LOKAL
            ====================================== */

            const [
                localBarang,
                localPenjualan,
                localDetailPenjualan
            ] = await Promise.all([

                LocalDB.getAll("barang"),

                LocalDB.getAll("penjualan"),

                LocalDB.getAll("detailPenjualan")

            ]);


            /* ======================================
               IDENTIFIKASI TRANSAKSI YANG BELUM SYNC
            ====================================== */

            const pendingTransactionIds =
                new Set();

            localPenjualan.forEach(
                transaction => {

                    const id =
                        String(
                            transaction.id || ""
                        ).trim();

                    if (!id) {
                        return;
                    }

                    const status =
                        String(
                            transaction.status || ""
                        )
                            .trim()
                            .toUpperCase();

                    const transactionPending =
                        transaction.syncStatus !== "synced";

                    const returnPending =
                        status === "RETUR" &&
                        transaction.returnStatus !== "synced";

                    if (
                        transactionPending ||
                        returnPending
                    ) {

                        pendingTransactionIds.add(id);

                    }

                }
            );


            /* ======================================
               IDENTIFIKASI BARANG DALAM TRANSAKSI
               YANG BELUM TERSINKRON
            ====================================== */

            const pendingProductCodes =
                new Set();

            localDetailPenjualan.forEach(
                detail => {

                    const transactionId =
                        String(
                            detail.id || ""
                        ).trim();

                    if (
                        !pendingTransactionIds.has(
                            transactionId
                        )
                    ) {

                        return;

                    }

                    const kode =
                        String(
                            detail.kode ||
                            detail.barang ||
                            ""
                        ).trim();

                    if (kode) {

                        pendingProductCodes.add(
                            kode
                        );

                    }

                }
            );


            /* ======================================
               MAP BARANG LOKAL

               Digunakan untuk mempertahankan stok
               dari transaksi yang belum tersinkron.
            ====================================== */

            const localBarangMap =
                new Map();

            localBarang.forEach(
                barang => {

                    const kode =
                        String(
                            barang.kode ||
                            barang.Kode ||
                            barang.kodeBarang ||
                            ""
                        ).trim();

                    if (!kode) {
                        return;
                    }

                    localBarangMap.set(
                        kode,
                        barang
                    );

                }
            );


            /* ======================================
               GABUNG DATA SERVER DENGAN STOK LOKAL

               Master barang mengikuti server.

               Stok untuk barang yang digunakan dalam
               transaksi pending tetap mengikuti LocalDB.
            ====================================== */

            const barang =
                data.barang.map(
                    serverBarang => {

                        const kode =
                            String(
                                serverBarang.kode ||
                                serverBarang.Kode ||
                                serverBarang.kodeBarang ||
                                ""
                            ).trim();

                        if (
                            !kode ||
                            !pendingProductCodes.has(kode)
                        ) {

                            return serverBarang;

                        }

                        const localItem =
                            localBarangMap.get(kode);

                        if (!localItem) {

                            return serverBarang;

                        }

                        const localStock =
                            localItem.stok ??
                            localItem.Stok;

                        if (
                            localStock === undefined ||
                            localStock === null
                        ) {

                            return serverBarang;

                        }

                        const mergedBarang = {
                            ...serverBarang
                        };

                        /*
                        Pertahankan nama properti stok
                        sesuai struktur data yang tersedia.
                        */

                        if (
                            Object.prototype.hasOwnProperty.call(
                                serverBarang,
                                "stok"
                            ) ||
                            Object.prototype.hasOwnProperty.call(
                                localItem,
                                "stok"
                            )
                        ) {

                            mergedBarang.stok =
                                localStock;

                        }

                        if (
                            Object.prototype.hasOwnProperty.call(
                                serverBarang,
                                "Stok"
                            ) ||
                            Object.prototype.hasOwnProperty.call(
                                localItem,
                                "Stok"
                            )
                        ) {

                            mergedBarang.Stok =
                                localStock;

                        }

                        return mergedBarang;

                    }
                );


            const satuan =
                data.satuan;


            /* ======================================
               PERBARUI INDEXEDDB

               Data master diperbarui.
               Stok barang dengan transaksi pending
               tidak ditimpa oleh stok server yang lama.
            ====================================== */

            await LocalDB.putAll(
                "barang",
                barang
            );

            await LocalDB.putAll(
                "satuanBarang",
                satuan
            );


            /* ======================================
               PERBARUI CACHE BOOTSTRAP
            ====================================== */

            if (
                typeof API.clearBootstrapCache === "function"
            ) {

                API.clearBootstrapCache();

            }

            API.bootstrapCache = {

                barang: barang,

                satuan: satuan,

                storeConfig:
                    data.storeConfig || {}

            };


            /* ======================================
               RESPONSE
            ====================================== */

            return {

                success: true,

                barang: barang,

                satuan: satuan,

                preservedStock:
                    pendingProductCodes.size,

                pendingTransactions:
                    pendingTransactionIds.size

            };

        } catch (error) {

            console.error(
                "LOCAL SYNC ERROR:",
                error
            );

            return {

                success: false,

                barang: [],

                satuan: [],

                error: error

            };

        }

    },


    /* ======================================
       RESOLVE DATABASE
    ====================================== */

    async resolveDatabase(year) {

        year = Number(year);

        if (!year) {

            throw new Error(
                "Tahun database Penjualan tidak valid."
            );

        }

        if (this.databaseCache[year]) {

            return this.databaseCache[year];

        }

        const resolved =
            await API.resolvePenjualanDatabase(year);

        if (
            !resolved ||
            !resolved.success
        ) {

            throw new Error(
                resolved?.message ||
                "Database Penjualan gagal ditemukan atau dibuat."
            );

        }

        const database = {

            year:
                Number(
                    resolved.year || year
                ),

            penjualanId:
                String(
                    resolved.penjualan || ""
                ).trim(),

            detailPenjualanId:
                String(
                    resolved.detailPenjualan || ""
                ).trim(),

            pembayaranId:
                String(
                    resolved.pembayaran || ""
                ).trim()

        };

        if (!database.year) {

            throw new Error(
                "Tahun database transaksi tidak ditemukan: " +
                year
            );

        }

        if (!database.penjualanId) {

            throw new Error(
                "Spreadsheet Penjualan transaksi tidak ditemukan: " +
                year
            );

        }

        if (!database.detailPenjualanId) {

            throw new Error(
                "Spreadsheet Detail Penjualan transaksi tidak ditemukan: " +
                year
            );

        }

        if (!database.pembayaranId) {

            throw new Error(
                "Spreadsheet Pembayaran transaksi tidak ditemukan: " +
                year
            );

        }

        this.databaseCache[year] = {

            year:
                Number(database.year),

            penjualanId:
                String(database.penjualanId).trim(),

            detailPenjualanId:
                String(database.detailPenjualanId).trim(),

            pembayaranId:
                String(database.pembayaranId).trim()

        };

        return this.databaseCache[year];

    },


    /* ======================================
       SYNC TRANSACTION
    ====================================== */

    async syncTransaction(id) {

        try {

            if (!id) {

                throw new Error(
                    "ID transaksi tidak ditemukan."
                );

            }

            const penjualan =
                await LocalDB.get(
                    "penjualan",
                    id
                );

            if (!penjualan) {

                throw new Error(
                    "Transaksi lokal tidak ditemukan: " +
                    id
                );

            }

            if (
                penjualan.syncStatus === "synced"
            ) {

                return {

                    success: true,

                    id: id,

                    alreadySynced: true

                };

            }

            let database =
                penjualan.database;

            if (!database) {

                const transactionDate =
                    new Date(penjualan.tanggal);

                if (
                    isNaN(
                        transactionDate.getTime()
                    )
                ) {

                    throw new Error(
                        "Tanggal transaksi tidak valid: " +
                        id
                    );

                }

                const transactionYear =
                    transactionDate.getFullYear();

                if (!transactionYear) {

                    throw new Error(
                        "Tahun transaksi tidak ditemukan: " +
                        id
                    );

                }

                database =
                    await this.resolveDatabase(
                        transactionYear
                    );

                penjualan.database = {

                    year:
                        Number(database.year),

                    penjualanId:
                        String(
                            database.penjualanId
                        ).trim(),

                    detailPenjualanId:
                        String(
                            database.detailPenjualanId
                        ).trim(),

                    pembayaranId:
                        String(
                            database.pembayaranId
                        ).trim()

                };

                await LocalDB.put(
                    "penjualan",
                    penjualan
                );

                database =
                    penjualan.database;

            }

            if (!database.year) {

                throw new Error(
                    "Tahun database transaksi tidak ditemukan: " +
                    id
                );

            }

            if (!database.penjualanId) {

                throw new Error(
                    "Spreadsheet Penjualan transaksi tidak ditemukan: " +
                    id
                );

            }

            if (!database.detailPenjualanId) {

                throw new Error(
                    "Spreadsheet Detail Penjualan transaksi tidak ditemukan: " +
                    id
                );

            }

            if (!database.pembayaranId) {

                throw new Error(
                    "Spreadsheet Pembayaran transaksi tidak ditemukan: " +
                    id
                );

            }

            const allDetails =
                await LocalDB.getAll(
                    "detailPenjualan"
                );

            const detail =
                allDetails.filter(
                    item =>
                        String(item.id).trim() ===
                        String(id).trim()
                );

            if (!detail.length) {

                throw new Error(
                    "Detail transaksi tidak ditemukan: " +
                    id
                );

            }

            const allPayments =
                await LocalDB.getAll(
                    "pembayaran"
                );

            const payments =
                allPayments.filter(
                    item =>
                        String(item.id).trim() ===
                        String(id).trim()
                );

            if (!payments.length) {

                throw new Error(
                    "Data pembayaran tidak ditemukan: " +
                    id
                );

            }

            const payment = {

                CASH: 0,

                QRIS: 0,

                DEBIT: 0,

                TRANSFER: 0,

                change: 0

            };

            payments.forEach(item => {

                const metode =
                    String(
                        item.metode || ""
                    )
                        .trim()
                        .toUpperCase();

                const nominal =
                    Number(item.nominal) || 0;

                if (
                    Object.prototype.hasOwnProperty.call(
                        payment,
                        metode
                    )
                ) {

                    payment[metode] =
                        Number(payment[metode]) +
                        nominal;

                }

                if (metode === "CASH") {

                    payment.change +=
                        Number(item.kembalian) || 0;

                }

            });

            const items =
                detail.map(item => {

                    return {

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
                            Number(item.subtotal) || 0

                    };

                });

            const transaction = {

                id: penjualan.id,

                tanggal: penjualan.tanggal,

                kasir:
                    penjualan.kasir || "ADMIN",

                discount:
                    Number(penjualan.disc) || 0,

                items: items,

                payment: payment,

                database: {

                    year:
                        Number(database.year),

                    penjualanId:
                        String(
                            database.penjualanId
                        ).trim(),

                    detailPenjualanId:
                        String(
                            database.detailPenjualanId
                        ).trim(),

                    pembayaranId:
                        String(
                            database.pembayaranId
                        ).trim()

                }

            };

            const result =
                await API.post(
                    "savePenjualan",
                    transaction
                );

            if (
                !result ||
                !result.success
            ) {

                throw new Error(
                    result?.message ||
                    "Sinkronisasi transaksi gagal."
                );

            }

            penjualan.syncStatus = "synced";

            penjualan.syncedAt =
                new Date().toISOString();

            penjualan.serverId =
                result.id || id;

            await LocalDB.put(
                "penjualan",
                penjualan
            );

            return {

                success: true,

                id: id,

                year: database.year,

                result: result

            };

        } catch (error) {

            console.error(
                "SYNC TRANSACTION ERROR:",
                id,
                error
            );

            return {

                success: false,

                id: id,

                message: error.message

            };

        }

    },


    /* ======================================
       SYNC RETUR
    ====================================== */

    async syncReturn(id) {

        try {

            if (!id) {

                throw new Error(
                    "ID transaksi retur tidak ditemukan."
                );

            }

            if (!navigator.onLine) {

                return {

                    success: false,

                    offline: true,

                    id: id

                };

            }

            let transaction =
                await LocalDB.get(
                    "penjualan",
                    id
                );

            if (!transaction) {

                throw new Error(
                    "Transaksi retur lokal tidak ditemukan: " +
                    id
                );

            }

            const status =
                String(
                    transaction.status || ""
                )
                    .trim()
                    .toUpperCase();

            if (status !== "RETUR") {

                throw new Error(
                    "Transaksi " +
                    id +
                    " belum berstatus RETUR."
                );

            }

            if (
                String(
                    transaction.returnStatus || ""
                )
                    .trim()
                    .toLowerCase() === "synced"
            ) {

                return {

                    success: true,

                    id: id,

                    year:
                        Number(
                            transaction.database?.year ||
                            transaction.year ||
                            new Date(
                                transaction.tanggal
                            ).getFullYear()
                        ),

                    alreadySynced: true

                };

            }

            let database =
                transaction.database || {};

            if (
                !database ||
                !database.year
            ) {

                const transactionDate =
                    new Date(
                        transaction.tanggal
                    );

                if (
                    isNaN(
                        transactionDate.getTime()
                    )
                ) {

                    throw new Error(
                        "Tanggal transaksi retur tidak valid: " +
                        id
                    );

                }

                const transactionYear =
                    transactionDate.getFullYear();

                if (!transactionYear) {

                    throw new Error(
                        "Tahun transaksi retur tidak ditemukan: " +
                        id
                    );

                }

                database =
                    await this.resolveDatabase(
                        transactionYear
                    );

                if (
                    !database ||
                    !database.year
                ) {

                    throw new Error(
                        "Database retur tahun " +
                        transactionYear +
                        " tidak ditemukan: " +
                        id
                    );

                }

                transaction = {

                    ...transaction,

                    database: {

                        year:
                            Number(database.year),

                        penjualanId:
                            String(
                                database.penjualanId || ""
                            ).trim(),

                        detailPenjualanId:
                            String(
                                database.detailPenjualanId || ""
                            ).trim(),

                        pembayaranId:
                            String(
                                database.pembayaranId || ""
                            ).trim()

                    }

                };

                await LocalDB.put(
                    "penjualan",
                    transaction
                );

                database =
                    transaction.database;

            }

            if (!database.year) {

                throw new Error(
                    "Tahun database retur tidak ditemukan: " +
                    id
                );

            }

            if (!database.penjualanId) {

                throw new Error(
                    "Spreadsheet Penjualan transaksi tidak ditemukan: " +
                    id
                );

            }

            if (!database.detailPenjualanId) {

                throw new Error(
                    "Spreadsheet Detail Penjualan transaksi tidak ditemukan: " +
                    id
                );

            }

            if (!database.pembayaranId) {

                throw new Error(
                    "Spreadsheet Pembayaran transaksi tidak ditemukan: " +
                    id
                );

            }

            if (
                transaction.syncStatus !== "synced"
            ) {

                const transactionResult =
                    await this.syncTransaction(id);

                if (
                    !transactionResult ||
                    !transactionResult.success
                ) {

                    throw new Error(
                        transactionResult?.message ||
                        "Transaksi asli gagal disinkronkan sebelum retur."
                    );

                }

                const refreshedTransaction =
                    await LocalDB.get(
                        "penjualan",
                        id
                    );

                if (!refreshedTransaction) {

                    throw new Error(
                        "Transaksi lokal hilang setelah sync transaksi: " +
                        id
                    );

                }

                transaction = {

                    ...refreshedTransaction,

                    status: "RETUR",

                    database:
                        refreshedTransaction.database ||
                        database

                };

                database =
                    transaction.database || database;

            }

            const returnDatabase = {

                year:
                    Number(database.year),

                penjualanId:
                    String(
                        database.penjualanId
                    ).trim(),

                detailPenjualanId:
                    String(
                        database.detailPenjualanId
                    ).trim(),

                pembayaranId:
                    String(
                        database.pembayaranId
                    ).trim()

            };

            const payload = {

                id: id,

                database: returnDatabase

            };

            const result =
                await API.post(
                    "returPenjualan",
                    payload
                );

            if (
                !result ||
                result.success !== true
            ) {

                throw new Error(
                    result?.message ||
                    "Sinkronisasi retur gagal."
                );

            }

            const syncedAt =
                new Date().toISOString();

            const latestTransaction =
                await LocalDB.get(
                    "penjualan",
                    id
                );

            if (!latestTransaction) {

                throw new Error(
                    "Transaksi retur tidak ditemukan saat menyimpan status sync: " +
                    id
                );

            }

            const updatedTransaction = {

                ...latestTransaction,

                status: "RETUR",

                database: returnDatabase,

                returnStatus: "synced",

                returnSyncedAt: syncedAt

            };

            await LocalDB.put(
                "penjualan",
                updatedTransaction
            );

            const verifiedTransaction =
                await LocalDB.get(
                    "penjualan",
                    id
                );

            const verifiedStatus =
                String(
                    verifiedTransaction?.returnStatus || ""
                )
                    .trim()
                    .toLowerCase();

            if (verifiedStatus !== "synced") {

                throw new Error(
                    "Status retur gagal disimpan sebagai synced di LocalDB: " +
                    id
                );

            }

            return {

                success: true,

                id: id,

                year:
                    Number(returnDatabase.year),

                alreadyReturned:
                    result.alreadyReturned === true,

                result: result

            };

        } catch (error) {

            console.error(
                "SYNC RETUR ERROR:",
                id,
                error
            );

            return {

                success: false,

                id: id,

                message: error.message

            };

        }

    },


    /* ======================================
       SYNC PENDING TRANSACTIONS + RETUR
    ====================================== */

    async syncPendingTransactions() {

        try {

            if (!navigator.onLine) {

                return {

                    success: false,

                    offline: true,

                    synced: 0,

                    returnSynced: 0

                };

            }

            const penjualan =
                await LocalDB.getAll(
                    "penjualan"
                );

            const pending =
                penjualan.filter(
                    item =>
                        item.syncStatus !== "synced"
                );

            const pendingReturn =
                penjualan.filter(item => {

                    const status =
                        String(
                            item.status || ""
                        )
                            .trim()
                            .toUpperCase();

                    return (
                        status === "RETUR" &&
                        item.returnStatus !== "synced"
                    );

                });

            let synced = 0;

            let returnSynced = 0;

            /* ======================================
               SYNC TRANSAKSI PENJUALAN
            ====================================== */

            for (const transaction of pending) {

                if (!navigator.onLine) {
                    break;
                }

                const status =
                    String(
                        transaction.status || ""
                    )
                        .trim()
                        .toUpperCase();

                if (status === "RETUR") {
                    continue;
                }

                const result =
                    await this.syncTransaction(
                        transaction.id
                    );

                if (result.success) {
                    synced++;
                }

            }

            /* ======================================
               SYNC RETUR
            ====================================== */

            for (const transaction of pendingReturn) {

                if (!navigator.onLine) {
                    break;
                }

                const result =
                    await this.syncReturn(
                        transaction.id
                    );

                if (
                    result.success &&
                    !result.skipped
                ) {

                    returnSynced++;

                }

            }

            return {

                success: true,

                total: pending.length,

                synced: synced,

                returnTotal: pendingReturn.length,

                returnSynced: returnSynced

            };

        } catch (error) {

            console.error(
                "SYNC PENDING ERROR:",
                error
            );

            return {

                success: false,

                message: error.message,

                synced: 0,

                returnSynced: 0

            };

        }

    },


    /* ======================================
       STARTUP
    ====================================== */

    async startup() {

        this.initOnlineListener();

        if (!navigator.onLine) {

            return {

                success: false,

                offline: true

            };

        }

        if (this.syncing) {

            return {

                success: false,

                syncing: true

            };

        }

        try {

            this.syncing = true;

            const transactionResult =
                await this.syncPendingTransactions();

            const productResult =
                await this.syncProducts();

            return {

                success: true,

                transactions: transactionResult,

                products: productResult

            };

        } finally {

            this.syncing = false;

        }

    }

};