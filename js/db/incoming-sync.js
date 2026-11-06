
// ======================================
// ROVIXA POS
// INCOMING SYNC
// SERVER -> LOCAL DATABASE
// INCREMENTAL CHANGE LOG SYNC
// ======================================

"use strict";

const IncomingSync = {

    syncing: false,

    STORAGE_KEY: "ROVIXA_POS_INCOMING_SYNC",

    /* ======================================
       GET LAST SYNC
    ====================================== */

    getLastSync(year) {

        try {

            const storage = JSON.parse(
                localStorage.getItem(this.STORAGE_KEY) || "{}"
            );

            return storage[year] || "";

        } catch (error) {

            console.error(
                "INCOMING SYNC GET LAST SYNC ERROR:",
                error
            );

            return "";

        }

    },


    /* ======================================
       SAVE LAST SYNC
    ====================================== */

    saveLastSync(year, lastSync) {

        if (
            !year ||
            !lastSync ||
            isNaN(new Date(lastSync).getTime())
        ) {

            throw new Error(
                "Checkpoint Incoming Sync tidak valid."
            );

        }

        const storage = JSON.parse(
            localStorage.getItem(this.STORAGE_KEY) || "{}"
        );

        storage[year] = lastSync;

        localStorage.setItem(
            this.STORAGE_KEY,
            JSON.stringify(storage)
        );

    },


    /* ======================================
       GET ACTIVE YEAR
    ====================================== */

    getYear(year) {

        let activeYear = Number(year);

        if (!activeYear) {

            if (
                typeof DatabaseConfig !== "undefined" &&
                typeof DatabaseConfig.getConfig === "function"
            ) {

                const config =
                    DatabaseConfig.getConfig();

                activeYear =
                    Number(config?.activeYear);

            }

        }

        if (!activeYear) {

            activeYear = new Date().getFullYear();

        }

        if (!activeYear) {

            throw new Error(
                "Tahun database tidak valid."
            );

        }

        return activeYear;

    },


    /* ======================================
       PREPARE LOCAL DATABASE
    ====================================== */

    async prepareLocalDB() {

        if (
            typeof LocalDB === "undefined" ||
            typeof LocalDB.init !== "function"
        ) {

            throw new Error(
                "LocalDB tidak tersedia."
            );

        }

        await LocalDB.init();

        const requiredMethods = [
            "getAll",
            "put",
            "add",
            "delete"
        ];

        requiredMethods.forEach(method => {

            if (
                typeof LocalDB[method] !== "function"
            ) {

                throw new Error(
                    "LocalDB." + method + " tidak tersedia."
                );

            }

        });

    },


    /* ======================================
       RESOLVE DATABASE PENJUALAN
    ====================================== */

    async resolveDatabase(year) {

        let result;

        if (
            typeof LocalSync !== "undefined" &&
            typeof LocalSync.resolveDatabase === "function"
        ) {

            result =
                await LocalSync.resolveDatabase(year);

        } else if (
            typeof API !== "undefined" &&
            typeof API.resolvePenjualanDatabase === "function"
        ) {

            result =
                await API.resolvePenjualanDatabase(year);

        } else {

            throw new Error(
                "Fungsi resolve database tidak tersedia."
            );

        }

        if (!result) {

            throw new Error(
                "Konfigurasi database penjualan tidak ditemukan."
            );

        }

        const database = {

            year: Number(result.year || year),

            penjualanId:
                result.penjualanId ||
                result.penjualan,

            detailPenjualanId:
                result.detailPenjualanId ||
                result.detailPenjualan,

            pembayaranId:
                result.pembayaranId ||
                result.pembayaran

        };

        if (
            !database.penjualanId ||
            !database.detailPenjualanId ||
            !database.pembayaranId
        ) {

            throw new Error(
                "Konfigurasi database penjualan belum lengkap."
            );

        }

        return database;

    },


    /* ======================================
       CHECK PENDING TRANSACTIONS
    ====================================== */

    async getPendingTransactions() {

        const result = {

            ids: new Set(),

            productCodes: new Set()

        };

        const transactions =
            await LocalDB.getAll("penjualan") || [];

        const details =
            await LocalDB.getAll("detailPenjualan") || [];

        transactions.forEach(item => {

            const status = String(
                item.syncStatus || ""
            ).toLowerCase();

            const serverId =
                item.serverId ||
                item.spreadsheetId;

            const pendingStatuses = [
                "pending",
                "failed",
                "error",
                "queued",
                "waiting",
                "unsynced"
            ];

            const pending =
                pendingStatuses.includes(status) ||
                (
                    !status &&
                    !serverId
                );

            if (!pending) {
                return;
            }

            const id =
                item.localId ||
                item.id ||
                item.idPenjualan;

            if (
                id !== undefined &&
                id !== null
            ) {

                result.ids.add(
                    String(id)
                );

            }

        });

        details.forEach(item => {

            // Pada struktur data penjualan,
            // id detail menunjuk ke ID transaksi.

            const transactionId =
                item.id;

            if (
                transactionId === undefined ||
                transactionId === null ||
                !result.ids.has(String(transactionId))
            ) {

                return;

            }

            const kode =
                item.kodeBarang ||
                item.kode ||
                item.barangKode;

            if (kode) {

                result.productCodes.add(
                    String(kode)
                );

            }

        });

        return result;

    },


    /* ======================================
       INITIAL MASTER DOWNLOAD
       HANYA UNTUK PENGGUNAAN PERTAMA
    ====================================== */

    async downloadInitialMaster() {

        if (
            typeof API === "undefined" ||
            typeof API.bootstrap !== "function"
        ) {

            throw new Error(
                "API.bootstrap tidak tersedia."
            );

        }

        const bootstrap =
            await API.bootstrap();

        if (!bootstrap) {

            throw new Error(
                "Bootstrap server tidak memberikan data."
            );

        }

        const barang =
            Array.isArray(bootstrap.barang)
                ? bootstrap.barang
                : [];

        const satuan =
            Array.isArray(bootstrap.satuan)
                ? bootstrap.satuan
                : [];

        await this.applyBarang(
            barang,
            new Set()
        );

        await this.applySatuan(
            satuan
        );

        let users = [];

        if (
            typeof API.get === "function"
        ) {

            const userResult =
                await API.get("users");

            users =
                Array.isArray(userResult)
                    ? userResult
                    : userResult?.data || [];

        }

        await this.applyUsers(users);

        await this.applyStoreConfig(
            bootstrap.storeConfig || {}
        );

        return {

            barang: barang.length,

            satuan: satuan.length,

            users: users.length

        };

    },


    /* ======================================
       INITIAL TRANSACTION DOWNLOAD
       HANYA JIKA TAHUN BELUM TERSEDIA
    ====================================== */

    async downloadInitialTransactions(year) {

        if (
            typeof Download === "undefined" ||
            typeof Download.download !== "function"
        ) {

            throw new Error(
                "Download.download tidak tersedia."
            );

        }

        const alreadyDownloaded =
            typeof LocalDB.isYearDownloaded === "function"
                ? await LocalDB.isYearDownloaded(year)
                : false;

        if (alreadyDownloaded) {

            return {

                success: true,

                skipped: true

            };

        }

        const result =
            await Download.download(year);

        if (
            !result ||
            result.success !== true
        ) {

            throw new Error(
                result?.message ||
                "Download database awal gagal."
            );

        }

        return {

            success: true,

            skipped: false

        };

    },


    /* ======================================
       APPLY BARANG
    ====================================== */

    async applyBarang(data, pendingProductCodes) {

        if (!Array.isArray(data) || !data.length) {
            return 0;
        }

        const existing =
            await LocalDB.getAll("barang") || [];

        const localMap = new Map();

        existing.forEach(item => {

            if (item?.kode) {

                localMap.set(
                    String(item.kode),
                    item
                );

            }

        });

        let count = 0;

        for (const item of data) {

            if (!item || !item.kode) {
                continue;
            }

            const kode = String(item.kode);

            const local =
                localMap.get(kode);

            const merged = {

                ...(local || {}),

                ...item

            };

            if (
                pendingProductCodes.has(kode) &&
                local &&
                local.stok !== undefined
            ) {

                merged.stok = local.stok;

            }

            await LocalDB.put(
                "barang",
                merged
            );

            localMap.set(
                kode,
                merged
            );

            count++;

        }

        return count;

    },


    /* ======================================
       APPLY SATUAN
    ====================================== */

    async applySatuan(data) {

        if (!Array.isArray(data) || !data.length) {
            return 0;
        }

        let count = 0;

        for (const item of data) {

            if (
                !item ||
                !item.kode ||
                !item.satuan
            ) {

                continue;

            }

            await LocalDB.put(
                "satuanBarang",
                item
            );

            count++;

        }

        return count;

    },


    /* ======================================
       APPLY USERS
    ====================================== */

    async applyUsers(data) {

        if (!Array.isArray(data) || !data.length) {
            return 0;
        }

        const existing =
            await LocalDB.getAll("users") || [];

        const localMap = new Map();

        existing.forEach(user => {

            const id =
                user.id ||
                user.ID ||
                user.username;

            if (id) {

                localMap.set(
                    String(id),
                    user
                );

            }

        });

        let count = 0;

        for (const item of data) {

            if (!item) {
                continue;
            }

            const id =
                item.id ||
                item.ID ||
                item.username;

            if (!id) {
                continue;
            }

            const local =
                localMap.get(String(id));

            await LocalDB.put(
                "users",
                {
                    ...(local || {}),
                    ...item
                }
            );

            count++;

        }

        return count;

    },


    /* ======================================
       APPLY STORE CONFIG
    ====================================== */

    async applyStoreConfig(data) {

        if (
            !data ||
            typeof data !== "object" ||
            !Object.keys(data).length
        ) {

            return false;

        }

        localStorage.setItem(
            "ROVIXA_POS_STORE_CONFIG",
            JSON.stringify(data)
        );

        if (
            typeof StoreConfig !== "undefined"
        ) {

            StoreConfig.config = data;

        }

        return true;

    },


    /* ======================================
       CHECK PENDING TRANSACTION
    ====================================== */

    isPendingTransaction(item, pendingIds) {

        const id =
            item.localId ||
            item.id ||
            item.idPenjualan;

        return (
            id !== undefined &&
            id !== null &&
            pendingIds.has(String(id))
        );

    },


    /* ======================================
       APPLY PENJUALAN
    ====================================== */

    async applyPenjualan(data, year, pendingIds) {

        if (!Array.isArray(data) || !data.length) {
            return 0;
        }

        const existing =
            await LocalDB.getAll("penjualan") || [];

        const localMap = new Map();

        existing.forEach(item => {

            const id =
                item.serverId ||
                item.localId ||
                item.id ||
                item.idPenjualan;

            if (id !== undefined && id !== null) {

                localMap.set(
                    String(id),
                    item
                );

            }

        });

        let count = 0;

        for (const item of data) {

            if (!item || !item.id) {
                continue;
            }

            if (
                pendingIds.has(String(item.id))
            ) {

                continue;

            }

            const local =
                localMap.get(String(item.id));

            await LocalDB.put(
                "penjualan",
                {
                    ...(local || {}),
                    ...item,

                    id: item.id,

                    year: Number(year),

                    syncStatus: "synced",

                    syncedAt:
                        new Date().toISOString(),

                    serverId: item.id

                }
            );

            count++;

        }

        return count;

    },


    /* ======================================
       DETAIL SIGNATURE
    ====================================== */

    getDetailSignature(item) {

        const fields = [
            "id",
            "kode",
            "nama",
            "satuan",
            "qty",
            "konversi",
            "harga",
            "discount",
            "subtotal"
        ];

        return JSON.stringify(
            fields.map(field => item[field] ?? null)
        );

    },


    /* ======================================
       PAYMENT SIGNATURE
    ====================================== */

    getPaymentSignature(item) {

        const fields = [
            "id",
            "metode",
            "nominal",
            "kembalian"
        ];

        return JSON.stringify(
            fields.map(field => item[field] ?? null)
        );

    },


    /* ======================================
       APPLY TRANSACTION DETAILS
       DETAIL ID = PARENT TRANSACTION ID
    ====================================== */

    async applyTransactionDetails(
        detailData,
        paymentData,
        pendingIds
    ) {

        const existingDetails =
            await LocalDB.getAll("detailPenjualan") || [];

        const existingPayments =
    await LocalDB.getAll("pembayaran") || [];

        const detailSignatures = new Set();

        existingDetails.forEach(item => {

            detailSignatures.add(
                this.getDetailSignature(item)
            );

        });

        const paymentSignatures = new Set();

        existingPayments.forEach(item => {

            paymentSignatures.add(
                this.getPaymentSignature(item)
            );

        });

        let detailCount = 0;
        let paymentCount = 0;

        /* ==================================
           DETAIL PENJUALAN
        ================================== */

        for (const item of detailData || []) {

            if (
                !item ||
                item.id === undefined ||
                item.id === null
            ) {

                continue;

            }

            if (
                pendingIds.has(String(item.id))
            ) {

                continue;

            }

            const signature =
                this.getDetailSignature(item);

            if (
                detailSignatures.has(signature)
            ) {

                continue;

            }

            await LocalDB.add(
                "detailPenjualan",
                {
                    ...item,

                    year: Number(
                        item.year ||
                        DatabaseConfig.getConfig().activeYear
                    ),

                    syncStatus: "synced"

                }
            );

            detailSignatures.add(signature);

            detailCount++;

        }

        /* ==================================
           PEMBAYARAN PENJUALAN
        ================================== */

        for (const item of paymentData || []) {

            if (
                !item ||
                item.id === undefined ||
                item.id === null
            ) {

                continue;

            }

            if (
                pendingIds.has(String(item.id))
            ) {

                continue;

            }

            const signature =
                this.getPaymentSignature(item);

            if (
                paymentSignatures.has(signature)
            ) {

                continue;

            }

            await LocalDB.add(
                "pembayaran",
                {
                    ...item,

                    syncStatus: "synced"

                }
            );

            paymentSignatures.add(signature);

            paymentCount++;

        }

        return {

            details: detailCount,

            payments: paymentCount

        };

    },


    /* ======================================
       APPLY ALL CHANGES
    ====================================== */

    async applyChanges(data, year) {

        const pending =
            await this.getPendingTransactions();

        const barang =
            await this.applyBarang(
                data.barang || [],
                pending.productCodes
            );

        const satuan =
            await this.applySatuan(
                data.satuan || []
            );

        const users =
            await this.applyUsers(
                data.users || []
            );

        const penjualan =
            await this.applyPenjualan(
                data.penjualan || [],
                year,
                pending.ids
            );

        const transactionDetails =
            await this.applyTransactionDetails(
                data.detailPenjualan || [],
                data.pembayaran || [],
                pending.ids
            );

        const storeConfig =
            await this.applyStoreConfig(
                data.storeConfig
            );

        return {

            barang,

            satuan,

            users,

            penjualan,

            details:
                transactionDetails.details,

            payments:
                transactionDetails.payments,

            storeConfig

        };

    },


    /* ======================================
       REQUEST CHANGE LOG
    ====================================== */

    async requestChanges(year, database, since) {

        if (
            typeof API === "undefined" ||
            typeof API.get !== "function"
        ) {

            throw new Error(
                "API.get tidak tersedia."
            );

        }

        const result =
            await API.get(
                "syncChanges",
                {
                    since,

                    year: database.year,

                    penjualanId:
                        database.penjualanId,

                    detailPenjualanId:
                        database.detailPenjualanId,

                    pembayaranId:
                        database.pembayaranId

                }
            );

        if (
            !result ||
            result.success !== true
        ) {

            throw new Error(
                result?.message ||
                "Gagal mengambil perubahan dari server."
            );

        }

        const data =
            result.data || result;

        if (
            !data.lastSync ||
            isNaN(
                new Date(data.lastSync).getTime()
            )
        ) {

            throw new Error(
                "Server tidak memberikan checkpoint sinkronisasi yang valid."
            );

        }

        return data;

    },


    /* ======================================
       MAIN INCOMING SYNC
    ====================================== */

    async sync(year) {

        if (this.syncing) {

            return {

                success: false,

                message:
                    "Incoming Sync sedang berjalan."

            };

        }

        this.syncing = true;

        try {

            await this.prepareLocalDB();

            year = this.getYear(year);

            /* ==================================
               CHECK LOCAL DATABASE
            ================================== */

            const isYearReady =
                typeof LocalDB.isYearDownloaded === "function"
                    ? await LocalDB.isYearDownloaded(year)
                    : false;

            if (!navigator.onLine) {

                if (!isYearReady) {

                    throw new Error(
                        "Database penjualan tahun " +
                        year +
                        " belum tersedia di perangkat. Koneksi internet diperlukan untuk download awal."
                    );

                }

                return {

                    success: true,

                    offline: true,

                    skipped: true,

                    year,

                    message:
                        "Offline. Menggunakan data lokal."

                };

            }

            /* ==================================
               RESOLVE SERVER DATABASE
            ================================== */

            const database =
                await this.resolveDatabase(year);

            /* ==================================
               INITIAL MASTER
               JIKA DATA MASTER BENAR-BENAR KOSONG
            ================================== */

            const localBarang =
                await LocalDB.getAll("barang") || [];

            const localSatuan =
                await LocalDB.getAll("satuanBarang") || [];

            const localUsers =
                await LocalDB.getAll("users") || [];

            let initialMaster = false;

            if (
                !localBarang.length &&
                !localSatuan.length &&
                !localUsers.length
            ) {

                await this.downloadInitialMaster();

                initialMaster = true;

            }

            /* ==================================
               INITIAL TRANSACTION DOWNLOAD
            ================================== */

            let initialTransactions = false;

            if (!isYearReady) {

                const initialResult =
                    await this.downloadInitialTransactions(year);

                initialTransactions =
                    !initialResult.skipped;

            }

            /* ==================================
               GET CHECKPOINT
            ================================== */

            const lastSync =
                this.getLastSync(year);

            const since =
                lastSync ||
                new Date(0).toISOString();

            /* ==================================
               REQUEST SERVER CHANGES
            ================================== */

            const data =
                await this.requestChanges(
                    year,
                    database,
                    since
                );

            if (
                data.year &&
                Number(data.year) !== Number(year)
            ) {

                throw new Error(
                    "Tahun data server tidak sesuai dengan database lokal."
                );

            }

            /* ==================================
               APPLY SERVER CHANGES
            ================================== */

            const counts =
                await this.applyChanges(
                    data,
                    year
                );

            /* ==================================
               SAVE CHECKPOINT
               ONLY AFTER SUCCESS
            ================================== */

            this.saveLastSync(
                year,
                data.lastSync
            );

            if (
                typeof API.clearBootstrapCache === "function"
            ) {

                API.clearBootstrapCache();

            }

            return {

                success: true,

                year,

                initialSync:
                    initialMaster ||
                    initialTransactions,

                initialMaster,

                initialTransactions,

                lastSync: data.lastSync,

                counts

            };

        } catch (error) {

            console.error(
                "INCOMING SYNC ERROR:",
                error
            );

            return {

                success: false,

                message:
                    error.message ||
                    "Incoming Sync gagal.",

                error

            };

        } finally {

            this.syncing = false;

        }

    },


    /* ======================================
       STARTUP
    ====================================== */

    async startup(year) {

        return await this.sync(year);

    }

};
