
/* ======================================
   Rovixa POS
   INCOMING SYNC
   GOOGLE SHEETS → INDEXEDDB

   DATA:
   1. BARANG
   2. SATUAN BARANG
   3. USER
   4. PENJUALAN
   5. DETAIL PENJUALAN
   6. PEMBAYARAN PENJUALAN
   7. STORE CONFIG

   CHANGE LOG VERSION
====================================== */

const IncomingSync = {

    syncing: false,

    STORAGE_KEY:
        "ROVIXA_POS_INCOMING_SYNC",


    /* ======================================
       GET LAST SYNC
    ====================================== */

    getLastSync(year) {

        try {

            const raw =
                localStorage.getItem(
                    this.STORAGE_KEY
                );

            if (!raw) {
                return "";
            }

            const checkpoints =
                JSON.parse(raw) || {};

            return String(
                checkpoints[Number(year)] || ""
            );

        } catch (error) {

            console.warn(
                "INCOMING SYNC CHECKPOINT READ ERROR:",
                error
            );

            return "";

        }

    },


    /* ======================================
       SAVE LAST SYNC

       Dipanggil hanya setelah seluruh
       perubahan berhasil diterapkan.
    ====================================== */

    saveLastSync(year, lastSync) {

        year = Number(year);

        const timestamp =
            String(lastSync || "").trim();

        if (!year || !timestamp) {

            throw new Error(
                "Checkpoint Incoming Sync tidak valid."
            );

        }

        if (
            !Number.isFinite(
                new Date(timestamp).getTime()
            )
        ) {

            throw new Error(
                "Format lastSync dari server tidak valid."
            );

        }

        let checkpoints = {};

        try {

            checkpoints =
                JSON.parse(
                    localStorage.getItem(
                        this.STORAGE_KEY
                    ) || "{}"
                ) || {};

        } catch (error) {

            checkpoints = {};

        }

        checkpoints[year] = timestamp;

        localStorage.setItem(
            this.STORAGE_KEY,
            JSON.stringify(checkpoints)
        );

        return timestamp;

    },


    /* ======================================
       GET ACTIVE YEAR
    ====================================== */

    getYear(year) {

        const activeYear =
            Number(
                year ||
                DatabaseConfig?.activeYear ||
                new Date().getFullYear()
            );

        if (!activeYear) {

            throw new Error(
                "Tahun database Incoming Sync tidak valid."
            );

        }

        return activeYear;

    },


    /* ======================================
       INITIALIZE LOCAL DATABASE
    ====================================== */

    async prepareLocalDB() {

        if (
            typeof LocalDB === "undefined"
        ) {

            throw new Error(
                "LocalDB tidak tersedia."
            );

        }

        if (
            !LocalDB.db &&
            typeof LocalDB.init === "function"
        ) {

            await LocalDB.init();

        }

        if (
            typeof LocalDB.getAll !== "function" ||
            typeof LocalDB.put !== "function" ||
            typeof LocalDB.add !== "function" ||
            typeof LocalDB.delete !== "function"
        ) {

            throw new Error(
                "Fungsi LocalDB tidak lengkap."
            );

        }

    },


    /* ======================================
       RESOLVE DATABASE PENJUALAN
    ====================================== */

    async resolveDatabase(year) {

        if (
            typeof LocalSync !== "undefined" &&
            typeof LocalSync.resolveDatabase === "function"
        ) {

            return await LocalSync.resolveDatabase(
                year
            );

        }

        const response =
            await API.resolvePenjualanDatabase(
                year
            );

        if (
            !response ||
            response.success !== true
        ) {

            throw new Error(
                response?.message ||
                "Database Penjualan gagal ditemukan."
            );

        }

        return {

            year:
                Number(response.year || year),

            penjualanId:
                String(
                    response.penjualan || ""
                ).trim(),

            detailPenjualanId:
                String(
                    response.detailPenjualan || ""
                ).trim(),

            pembayaranId:
                String(
                    response.pembayaran || ""
                ).trim()

        };

    },


    /* ======================================
       DOWNLOAD MASTER DATA AWAL

       BARANG
       SATUAN
       USER
       STORE CONFIG
    ====================================== */

    async downloadInitialMaster() {

        /* ==================================
           BOOTSTRAP
        ================================== */

        const bootstrap =
            await API.bootstrap();

        if (!bootstrap) {

            throw new Error(
                "Bootstrap awal gagal."
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


        await this.applyBarang(barang);

        await this.applySatuan(satuan);


        /* ==================================
           DOWNLOAD USER
        ================================== */

        const userResponse =
            await API.get("users");

        if (
            !userResponse ||
            userResponse.success !== true
        ) {

            throw new Error(
                userResponse?.message ||
                "Download User gagal."
            );

        }

        const users =
            Array.isArray(userResponse.data)
                ? userResponse.data
                : [];

        await this.applyUsers(users);


        /* ==================================
           STORE CONFIG
        ================================== */

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
       INITIAL DOWNLOAD DATABASE PENJUALAN
    ====================================== */

    async downloadInitialTransactions(year) {

        if (
            typeof Download === "undefined" ||
            typeof Download.download !== "function"
        ) {

            throw new Error(
                "Download database Penjualan tidak tersedia."
            );

        }

        const downloaded =
            await LocalDB.isYearDownloaded(
                year
            );

        if (downloaded) {

            return {

                downloaded: false,

                alreadyDownloaded: true

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
                "Download awal Penjualan gagal."
            );

        }

        return {

            downloaded: true,

            alreadyDownloaded: false,

            result: result

        };

    },


    /* ======================================
       IDENTIFIKASI TRANSAKSI PENDING
    ====================================== */

    async getPendingTransactions() {

        const [
            penjualan,
            detailPenjualan
        ] = await Promise.all([

            LocalDB.getAll(
                "penjualan"
            ),

            LocalDB.getAll(
                "detailPenjualan"
            )

        ]);

        const pendingIds =
            new Set();

        penjualan.forEach(transaction => {

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

                pendingIds.add(id);

            }

        });


        /* ==================================
           IDENTIFIKASI BARANG PENDING
        ================================== */

        const pendingProductCodes =
            new Set();

        detailPenjualan.forEach(detail => {

            const transactionId =
                String(
                    detail.id || ""
                ).trim();

            if (
                !pendingIds.has(transactionId)
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

                pendingProductCodes.add(kode);

            }

        });


        return {

            pendingIds,

            pendingProductCodes

        };

    },


    /* ======================================
       APPLY BARANG
    ====================================== */

    async applyBarang(data) {

        if (!Array.isArray(data)) {
            return;
        }

        const {
            pendingProductCodes
        } = await this.getPendingTransactions();

        const localBarang =
            await LocalDB.getAll(
                "barang"
            );

        const localMap =
            new Map();

        localBarang.forEach(item => {

            const kode =
                String(
                    item.kode ||
                    item.Kode ||
                    item.kodeBarang ||
                    ""
                ).trim();

            if (kode) {

                localMap.set(
                    kode,
                    item
                );

            }

        });


        for (const serverItem of data) {

            const kode =
                String(
                    serverItem.kode ||
                    serverItem.Kode ||
                    serverItem.kodeBarang ||
                    ""
                ).trim();

            if (!kode) {
                continue;
            }

            let item = {
                ...serverItem
            };

            /* ==================================
               PERTAHANKAN STOK LOKAL
               JIKA ADA TRANSAKSI PENDING
            ================================== */

            if (
                pendingProductCodes.has(kode)
            ) {

                const localItem =
                    localMap.get(kode);

                if (localItem) {

                    const localStock =
                        localItem.stok ??
                        localItem.Stok;

                    if (
                        localStock !== undefined &&
                        localStock !== null
                    ) {

                        if (
                            Object.prototype.hasOwnProperty.call(
                                serverItem,
                                "stok"
                            ) ||
                            Object.prototype.hasOwnProperty.call(
                                localItem,
                                "stok"
                            )
                        ) {

                            item.stok =
                                localStock;

                        }

                        if (
                            Object.prototype.hasOwnProperty.call(
                                serverItem,
                                "Stok"
                            ) ||
                            Object.prototype.hasOwnProperty.call(
                                localItem,
                                "Stok"
                            )
                        ) {

                            item.Stok =
                                localStock;

                        }

                    }

                }

            }

            await LocalDB.put(
                "barang",
                item
            );

        }

    },


    /* ======================================
       APPLY SATUAN BARANG
    ====================================== */

    async applySatuan(data) {

        if (!Array.isArray(data)) {
            return;
        }

        for (const item of data) {

            if (
                !item.kode ||
                !item.satuan
            ) {

                continue;

            }

            await LocalDB.put(
                "satuanBarang",
                item
            );

        }

    },


    /* ======================================
       APPLY USER
    ====================================== */

    async applyUsers(data) {

        if (!Array.isArray(data)) {
            return;
        }

        for (const user of data) {

            if (!user.id) {
                continue;
            }

            await LocalDB.put(
                "users",
                user
            );

        }

    },


    /* ======================================
       APPLY STORE CONFIG
    ====================================== */

    async applyStoreConfig(data) {

        if (
            !data ||
            typeof data !== "object" ||
            Array.isArray(data)
        ) {

            return;

        }

        const config = {
            ...data
        };

        localStorage.setItem(
            "ROVIXA_POS_STORE_CONFIG",
            JSON.stringify(config)
        );

        if (
            typeof StoreConfig !== "undefined"
        ) {

            StoreConfig.config =
                config;

        }

        if (
            typeof API !== "undefined"
        ) {

            if (API.bootstrapCache) {

                API.bootstrapCache = {

                    ...API.bootstrapCache,

                    storeConfig: config

                };

            }

        }

    },


    /* ======================================
       APPLY PENJUALAN
    ====================================== */

    async applyPenjualan(data, year, pendingIds) {

        if (!Array.isArray(data)) {
            return;
        }

        const syncedAt =
            new Date().toISOString();

        for (const serverItem of data) {

            const id =
                String(
                    serverItem.id || ""
                ).trim();

            if (!id) {
                continue;
            }

            /* ==================================
               JANGAN TIMPA TRANSAKSI PENDING
            ================================== */

            if (
                pendingIds.has(id)
            ) {

                continue;

            }

            const localItem =
                await LocalDB.get(
                    "penjualan",
                    id
                );

            const transaction = {

                ...serverItem,

                year: Number(year),

                syncStatus: "synced",

                syncedAt:
                    localItem?.syncedAt ||
                    syncedAt,

                serverId:
                    String(
                        serverItem.id
                    ).trim(),

                database:
                    localItem?.database ||
                    serverItem.database

            };

            /* ==================================
               PERTAHANKAN METADATA LOKAL
            ================================== */

            if (localItem) {

                if (localItem.returnStatus) {

                    transaction.returnStatus =
                        localItem.returnStatus;

                }

                if (localItem.returnAt) {

                    transaction.returnAt =
                        localItem.returnAt;

                }

                if (localItem.returnSyncedAt) {

                    transaction.returnSyncedAt =
                        localItem.returnSyncedAt;

                }

            }

            await LocalDB.put(
                "penjualan",
                transaction
            );

        }

    },


    /* ======================================
       REPLACE DETAIL TRANSAKSI

       Detail menggunakan localId
       sebagai IndexedDB key.

       Penggantian dilakukan per ID transaksi.
    ====================================== */

    async replaceTransactionDetails(
        transactionId,
        data,
        year
    ) {

        const allDetails =
            await LocalDB.getAll(
                "detailPenjualan"
            );

        const oldDetails =
            allDetails.filter(item => {

                return (
                    String(
                        item.id || ""
                    ).trim() ===
                    String(
                        transactionId
                    ).trim()
                );

            });


        /* ==================================
           HAPUS DETAIL LAMA
        ================================== */

        for (const item of oldDetails) {

            if (
                item.localId !== undefined &&
                item.localId !== null
            ) {

                await LocalDB.delete(
                    "detailPenjualan",
                    item.localId
                );

            }

        }


        /* ==================================
           TAMBAHKAN DETAIL SERVER
        ================================== */

        const incoming =
            data.filter(item => {

                return (
                    String(
                        item.id || ""
                    ).trim() ===
                    String(
                        transactionId
                    ).trim()
                );

            });

        for (const item of incoming) {

            const detail = {

                ...item,

                year: Number(year)

            };

            delete detail.localId;

            await LocalDB.add(
                "detailPenjualan",
                detail
            );

        }

    },


    /* ======================================
       REPLACE PEMBAYARAN TRANSAKSI

       Pembayaran menggunakan localId
       sebagai IndexedDB key.

       Penggantian dilakukan per ID transaksi.
    ====================================== */

    async replaceTransactionPayments(
        transactionId,
        data,
        year
    ) {

        const allPayments =
            await LocalDB.getAll(
                "pembayaran"
            );

        const oldPayments =
            allPayments.filter(item => {

                return (
                    String(
                        item.id || ""
                    ).trim() ===
                    String(
                        transactionId
                    ).trim()
                );

            });


        /* ==================================
           HAPUS PEMBAYARAN LAMA
        ================================== */

        for (const item of oldPayments) {

            if (
                item.localId !== undefined &&
                item.localId !== null
            ) {

                await LocalDB.delete(
                    "pembayaran",
                    item.localId
                );

            }

        }


        /* ==================================
           TAMBAHKAN PEMBAYARAN SERVER
        ================================== */

        const incoming =
            data.filter(item => {

                return (
                    String(
                        item.id || ""
                    ).trim() ===
                    String(
                        transactionId
                    ).trim()
                );

            });

        for (const item of incoming) {

            const payment = {

                ...item,

                year: Number(year)

            };

            delete payment.localId;

            await LocalDB.add(
                "pembayaran",
                payment
            );

        }

    },


    /* ======================================
       APPLY DETAIL + PEMBAYARAN

       Hanya transaksi yang tidak pending.
    ====================================== */

    async applyTransactionDetails(
        detailData,
        paymentData,
        penjualanData,
        year,
        pendingIds
    ) {

        const transactionIds =
            new Set();

        [
            penjualanData,
            detailData,
            paymentData
        ].forEach(group => {

            if (!Array.isArray(group)) {
                return;
            }

            group.forEach(item => {

                const id =
                    String(
                        item.id || ""
                    ).trim();

                if (id) {

                    transactionIds.add(id);

                }

            });

        });


        for (const id of transactionIds) {

            if (
                pendingIds.has(id)
            ) {

                continue;

            }

            await this.replaceTransactionDetails(
                id,
                detailData,
                year
            );

            await this.replaceTransactionPayments(
                id,
                paymentData,
                year
            );

        }

    },


    /* ======================================
       APPLY INCOMING RESPONSE
    ====================================== */

    async applyChanges(data, year) {

        if (
            !data ||
            typeof data !== "object"
        ) {

            throw new Error(
                "Data Incoming Sync tidak valid."
            );

        }

        const barang =
            Array.isArray(data.barang)
                ? data.barang
                : [];

        const satuan =
            Array.isArray(data.satuan)
                ? data.satuan
                : [];

        const users =
            Array.isArray(data.users)
                ? data.users
                : [];

        const penjualan =
            Array.isArray(data.penjualan)
                ? data.penjualan
                : [];

        const detailPenjualan =
            Array.isArray(data.detailPenjualan)
                ? data.detailPenjualan
                : [];

        const pembayaran =
            Array.isArray(data.pembayaranPenjualan)
                ? data.pembayaranPenjualan
                : [];


        /* ==================================
           IDENTIFIKASI TRANSAKSI PENDING
        ================================== */

        const {
            pendingIds
        } = await this.getPendingTransactions();


        /* ==================================
           1. BARANG
        ================================== */

        await this.applyBarang(
            barang
        );


        /* ==================================
           2. SATUAN BARANG
        ================================== */

        await this.applySatuan(
            satuan
        );


        /* ==================================
           3. USER
        ================================== */

        await this.applyUsers(
            users
        );


        /* ==================================
           4. PENJUALAN
        ================================== */

        await this.applyPenjualan(
            penjualan,
            year,
            pendingIds
        );


        /* ==================================
           5. DETAIL PENJUALAN
           6. PEMBAYARAN PENJUALAN
        ================================== */

        await this.applyTransactionDetails(
            detailPenjualan,
            pembayaran,
            penjualan,
            year,
            pendingIds
        );


        /* ==================================
           7. STORE CONFIG
        ================================== */

        if (
            data.storeConfig &&
            Object.keys(
                data.storeConfig
            ).length
        ) {

            await this.applyStoreConfig(
                data.storeConfig
            );

        }


        return {

            barang: barang.length,

            satuan: satuan.length,

            users: users.length,

            penjualan: penjualan.length,

            detailPenjualan:
                detailPenjualan.length,

            pembayaranPenjualan:
                pembayaran.length,

            storeConfig:
                Boolean(
                    data.storeConfig &&
                    Object.keys(
                        data.storeConfig
                    ).length
                )

        };

    },


    /* ======================================
       REQUEST INCOMING SYNC
    ====================================== */

    async requestChanges(year, database, since) {

        const response =
            await API.get(
                "syncChanges",
                {

                    since: since,

                    year:
                        Number(database.year),

                    penjualanId:
                        database.penjualanId,

                    detailPenjualanId:
                        database.detailPenjualanId,

                    pembayaranId:
                        database.pembayaranId

                }
            );

        if (
            !response ||
            response.success !== true
        ) {

            throw new Error(
                response?.message ||
                "Request Incoming Sync gagal."
            );

        }

        const data =
            response.data;

        if (
            !data ||
            !data.lastSync
        ) {

            throw new Error(
                "Server tidak mengirim checkpoint lastSync."
            );

        }

        return data;

    },


    /* ======================================
       SYNC
       ENTRY POINT
    ====================================== */

    async sync(year) {

        if (this.syncing) {

            return {

                success: false,

                syncing: true

            };

        }

        if (!navigator.onLine) {

            return {

                success: false,

                offline: true

            };

        }

        this.syncing = true;

        try {

            /* ==================================
               VALIDASI
            ================================== */

            if (
                typeof API === "undefined" ||
                typeof API.get !== "function"
            ) {

                throw new Error(
                    "API tidak tersedia."
                );

            }

            await this.prepareLocalDB();

            year =
                this.getYear(year);


            /* ==================================
               CHECKPOINT LOKAL
            ================================== */

            const lastSync =
                this.getLastSync(year);

            const initialSync =
                !lastSync;


            /* ==================================
               RESOLVE DATABASE
            ================================== */

            const database =
                await this.resolveDatabase(
                    year
                );

            if (
                !database ||
                !database.year ||
                !database.penjualanId ||
                !database.detailPenjualanId ||
                !database.pembayaranId
            ) {

                throw new Error(
                    "Konfigurasi database Penjualan tidak lengkap."
                );

            }


            /* ==================================
               INITIAL DOWNLOAD

               Hanya dilakukan jika belum
               memiliki checkpoint Incoming Sync.
            ================================== */

            let initialMaster = null;

            let initialTransactions = null;

            if (initialSync) {

                initialMaster =
                    await this.downloadInitialMaster();

            }


            /* ==================================
               INITIAL TRANSACTION DOWNLOAD

               Hanya jika tahun belum pernah
               selesai didownload.
            ================================== */

            initialTransactions =
                await this.downloadInitialTransactions(
                    year
                );


            /* ==================================
               REQUEST CHANGE LOG

               Initial sync memakai epoch.
               Data awal sudah didownload penuh,
               sehingga ChangeLog digunakan untuk
               menangkap perubahan selama download.
            ================================== */

            const since =
                lastSync ||
                "1970-01-01T00:00:00.000Z";

            const data =
                await this.requestChanges(
                    year,
                    database,
                    since
                );


            /* ==================================
               APPLY DATA
            ================================== */

            const counts =
                await this.applyChanges(
                    data,
                    year
                );


            /* ==================================
               SIMPAN CHECKPOINT

               Hanya setelah seluruh apply sukses.
            ================================== */

            this.saveLastSync(
                year,
                data.lastSync
            );


            /* ==================================
               CLEAR BOOTSTRAP CACHE
            ================================== */

            if (
                typeof API.clearBootstrapCache === "function"
            ) {

                API.clearBootstrapCache();

            }


            /* ==================================
               HASIL
            ================================== */

            return {

                success: true,

                year: year,

                initialSync: initialSync,

                initialMaster: initialMaster,

                initialTransactions:
                    initialTransactions,

                lastSync: data.lastSync,

                counts: counts

            };

        } catch (error) {

            console.error(
                "INCOMING SYNC ERROR:",
                error
            );

            return {

                success: false,

                year: Number(year) || null,

                message: error.message,

                error: error

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
