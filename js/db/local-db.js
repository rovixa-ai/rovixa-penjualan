/* ======================================
TREEHOUSE POS
LOCAL DATABASE - INDEXEDDB
====================================== */

const LocalDB = {


DB_NAME: "TreehousePOS",

DB_VERSION: 5,

db: null,


/* ==================================
   INIT
================================== */

init() {

    return new Promise(
        (resolve, reject) => {

            if (!window.indexedDB) {

                reject(
                    new Error(
                        "Browser tidak mendukung IndexedDB."
                    )
                );

                return;

            }


            const request =
                indexedDB.open(
                    this.DB_NAME,
                    this.DB_VERSION
                );


            /* ==========================
               UPGRADE
            ========================== */

            request.onupgradeneeded =
                event => {

                    const db =
                        event.target.result;

                    const transaction =
                        event.target.transaction;

                    const oldVersion =
                        event.oldVersion;


                   


                    /* ==========================
                       BARANG
                    ========================== */

                    if (
                        !db.objectStoreNames.contains(
                            "barang"
                        )
                    ) {

                        const store =
                            db.createObjectStore(
                                "barang",
                                {
                                    keyPath: "kode"
                                }
                            );


                        store.createIndex(
                            "barcode",
                            "barcode",
                            {
                                unique: false
                            }
                        );


                        store.createIndex(
                            "status",
                            "status",
                            {
                                unique: false
                            }
                        );

                    }


                    /* ==========================
                       SATUAN BARANG
                    ========================== */

                    if (
                        !db.objectStoreNames.contains(
                            "satuanBarang"
                        )
                    ) {

                        const store =
                            db.createObjectStore(
                                "satuanBarang",
                                {
                                    keyPath: [
                                        "kode",
                                        "satuan"
                                    ]
                                }
                            );


                        store.createIndex(
                            "kode",
                            "kode",
                            {
                                unique: false
                            }
                        );


                        store.createIndex(
                            "barcodeSatuan",
                            "barcodeSatuan",
                            {
                                unique: false
                            }
                        );


                        store.createIndex(
                            "status",
                            "status",
                            {
                                unique: false
                            }
                        );

                    }


                    /* ==========================
                       PENJUALAN
                    ========================== */

                    let penjualanStore;


                    if (
                        !db.objectStoreNames.contains(
                            "penjualan"
                        )
                    ) {

                        penjualanStore =
                            db.createObjectStore(
                                "penjualan",
                                {
                                    keyPath: "id"
                                }
                            );

                    }
                    else {

                        penjualanStore =
                            transaction.objectStore(
                                "penjualan"
                            );

                    }


                    if (
                        !penjualanStore.indexNames.contains(
                            "tanggal"
                        )
                    ) {

                        penjualanStore.createIndex(
                            "tanggal",
                            "tanggal",
                            {
                                unique: false
                            }
                        );

                    }


                    if (
                        !penjualanStore.indexNames.contains(
                            "kasir"
                        )
                    ) {

                        penjualanStore.createIndex(
                            "kasir",
                            "kasir",
                            {
                                unique: false
                            }
                        );

                    }


                    if (
                        !penjualanStore.indexNames.contains(
                            "status"
                        )
                    ) {

                        penjualanStore.createIndex(
                            "status",
                            "status",
                            {
                                unique: false
                            }
                        );

                    }


                    if (
                        !penjualanStore.indexNames.contains(
                            "year"
                        )
                    ) {

                        penjualanStore.createIndex(
                            "year",
                            "year",
                            {
                                unique: false
                            }
                        );

                    }


                    /* ==========================
                       DETAIL PENJUALAN
                    ========================== */

                    let detailStore;


                    if (
                        !db.objectStoreNames.contains(
                            "detailPenjualan"
                        )
                    ) {

                        detailStore =
                            db.createObjectStore(
                                "detailPenjualan",
                                {
                                    keyPath: "localId",
                                    autoIncrement: true
                                }
                            );

                    }
                    else {

                        detailStore =
                            transaction.objectStore(
                                "detailPenjualan"
                            );

                    }


                    if (
                        !detailStore.indexNames.contains(
                            "id"
                        )
                    ) {

                        detailStore.createIndex(
                            "id",
                            "id",
                            {
                                unique: false
                            }
                        );

                    }


                    if (
                        !detailStore.indexNames.contains(
                            "kode"
                        )
                    ) {

                        detailStore.createIndex(
                            "kode",
                            "kode",
                            {
                                unique: false
                            }
                        );

                    }


                    if (
                        !detailStore.indexNames.contains(
                            "year"
                        )
                    ) {

                        detailStore.createIndex(
                            "year",
                            "year",
                            {
                                unique: false
                            }
                        );

                    }


                    /* ==========================
                       PEMBAYARAN
                    ========================== */

                    let pembayaranStore;


                    if (
                        !db.objectStoreNames.contains(
                            "pembayaran"
                        )
                    ) {

                        pembayaranStore =
                            db.createObjectStore(
                                "pembayaran",
                                {
                                    keyPath: "localId",
                                    autoIncrement: true
                                }
                            );

                    }
                    else {

                        pembayaranStore =
                            transaction.objectStore(
                                "pembayaran"
                            );

                    }


                    if (
                        !pembayaranStore.indexNames.contains(
                            "id"
                        )
                    ) {

                        pembayaranStore.createIndex(
                            "id",
                            "id",
                            {
                                unique: false
                            }
                        );

                    }


                    if (
                        !pembayaranStore.indexNames.contains(
                            "metode"
                        )
                    ) {

                        pembayaranStore.createIndex(
                            "metode",
                            "metode",
                            {
                                unique: false
                            }
                        );

                    }


                    if (
                        !pembayaranStore.indexNames.contains(
                            "year"
                        )
                    ) {

                        pembayaranStore.createIndex(
                            "year",
                            "year",
                            {
                                unique: false
                            }
                        );

                    }


                    /* ==========================
                       DATABASE YEARS
                    ========================== */

                    if (
                        !db.objectStoreNames.contains(
                            "databaseYears"
                        )
                    ) {

                        const store =
                            db.createObjectStore(
                                "databaseYears",
                                {
                                    keyPath: "year"
                                }
                            );


                        store.createIndex(
                            "downloadedAt",
                            "downloadedAt",
                            {
                                unique: false
                            }
                        );

                    }


                    /* ==========================
                       USERS
                       MASTER USER KASIR
                    ========================== */

                    if (
                        !db.objectStoreNames.contains(
                            "users"
                        )
                    ) {

                        const store =
                            db.createObjectStore(
                                "users",
                                {
                                    keyPath: "id"
                                }
                            );


                        store.createIndex(
                            "username",
                            "username",
                            {
                                unique: false
                            }
                        );


                        store.createIndex(
                            "role",
                            "role",
                            {
                                unique: false
                            }
                        );


                        store.createIndex(
                            "status",
                            "status",
                            {
                                unique: false
                            }
                        );


                        store.createIndex(
                            "updatedAt",
                            "updatedAt",
                            {
                                unique: false
                            }
                        );

                    }


                    /* ==========================
                       MIGRASI DATA LAMA
                       VERSION 2 → 3
                    ========================== */

                    if (
                        oldVersion < 3
                    ) {

                        if (
                            db.objectStoreNames.contains(
                                "penjualan"
                            )
                        ) {

                            const store =
                                transaction.objectStore(
                                    "penjualan"
                                );


                            const request =
                                store.openCursor();


                            request.onsuccess =
                                event => {

                                    const cursor =
                                        event.target.result;


                                    if (!cursor) {

                                        return;

                                    }


                                    const data =
                                        cursor.value;


                                    let year =
                                        Number(
                                            data.year
                                        );


                                    if (!year) {

                                        const date =
                                            new Date(
                                                data.tanggal
                                            );


                                        if (
                                            !isNaN(
                                                date.getTime()
                                            )
                                        ) {

                                            year =
                                                date.getFullYear();

                                        }

                                    }


                                    if (year) {

                                        data.year =
                                            year;


                                        cursor.update(
                                            data
                                        );

                                    }


                                    cursor.continue();

                                };

                        }


                        if (
                            db.objectStoreNames.contains(
                                "detailPenjualan"
                            )
                        ) {

                            const store =
                                transaction.objectStore(
                                    "detailPenjualan"
                                );


                            const request =
                                store.openCursor();


                            request.onsuccess =
                                event => {

                                    const cursor =
                                        event.target.result;


                                    if (!cursor) {

                                        return;

                                    }


                                    const data =
                                        cursor.value;


                                    if (
                                        !Number(
                                            data.year
                                        )
                                    ) {

                                        /*
                                         * Detail lama akan
                                         * memperoleh year
                                         * saat data transaksi
                                         * berikutnya di-download.
                                         *
                                         * Tidak menebak tahun
                                         * dari ID transaksi.
                                         */

                                    }


                                    cursor.continue();

                                };

                        }


                        if (
                            db.objectStoreNames.contains(
                                "pembayaran"
                            )
                        ) {

                            const store =
                                transaction.objectStore(
                                    "pembayaran"
                                );


                            const request =
                                store.openCursor();


                            request.onsuccess =
                                event => {

                                    const cursor =
                                        event.target.result;


                                    if (!cursor) {

                                        return;

                                    }


                                    const data =
                                        cursor.value;


                                    if (
                                        !Number(
                                            data.year
                                        )
                                    ) {

                                        /*
                                         * Pembayaran lama akan
                                         * memperoleh year
                                         * saat data transaksi
                                         * berikutnya di-download.
                                         */

                                    }


                                    cursor.continue();

                                };

                        }

                    }

                };


            /* ==========================
               SUCCESS
            ========================== */

            request.onsuccess =
                event => {

                    this.db =
                        event.target.result;


                    this.db.onversionchange =
                        () => {

                            this.db.close();

                        };


                    

                    resolve(
                        this.db
                    );

                };


            /* ==========================
               ERROR
            ========================== */

            request.onerror =
                event => {

                    console.error(
                        "IndexedDB ERROR:",
                        event.target.error
                    );


                    reject(
                        event.target.error
                    );

                };

        }
    );

},


/* ==================================
   READY
================================== */

ready() {

    if (!this.db) {

        throw new Error(
            "LocalDB belum di-init."
        );

    }


    return this.db;

},


/* ==================================
   GET ALL
================================== */

getAll(
    storeName
) {

    return new Promise(
        (resolve, reject) => {

            const db =
                this.ready();


            if (
                !db.objectStoreNames.contains(
                    storeName
                )
            ) {

                reject(
                    new Error(
                        `Object store "${storeName}" tidak ditemukan.`
                    )
                );

                return;

            }


            const transaction =
                db.transaction(
                    storeName,
                    "readonly"
                );


            const store =
                transaction.objectStore(
                    storeName
                );


            const request =
                store.getAll();


            request.onsuccess =
                () => {

                    resolve(
                        request.result || []
                    );

                };


            request.onerror =
                () => {

                    reject(
                        request.error
                    );

                };

        }
    );

},


/* ==================================
   GET ALL BY YEAR
================================== */

getAllByYear(
    storeName,
    year
) {

    return new Promise(
        (resolve, reject) => {

            const db =
                this.ready();


            year =
                Number(year);


            if (!year) {

                reject(
                    new Error(
                        "Tahun tidak valid."
                    )
                );

                return;

            }


            if (
                !db.objectStoreNames.contains(
                    storeName
                )
            ) {

                reject(
                    new Error(
                        `Object store "${storeName}" tidak ditemukan.`
                    )
                );

                return;

            }


            const transaction =
                db.transaction(
                    storeName,
                    "readonly"
                );


            const store =
                transaction.objectStore(
                    storeName
                );


            if (
                !store.indexNames.contains(
                    "year"
                )
            ) {

                reject(
                    new Error(
                        `Index "year" pada store "${storeName}" tidak ditemukan.`
                    )
                );

                return;

            }


            const index =
                store.index(
                    "year"
                );


            const request =
                index.getAll(
                    IDBKeyRange.only(
                        year
                    )
                );


            request.onsuccess =
                () => {

                    resolve(
                        request.result || []
                    );

                };


            request.onerror =
                () => {

                    reject(
                        request.error
                    );

                };

        }
    );

},


/* ==================================
   GET
================================== */

get(
    storeName,
    key
) {

    return new Promise(
        (resolve, reject) => {

            const db =
                this.ready();


            const transaction =
                db.transaction(
                    storeName,
                    "readonly"
                );


            const store =
                transaction.objectStore(
                    storeName
                );


            const request =
                store.get(
                    key
                );


            request.onsuccess =
                () => {

                    resolve(
                        request.result
                    );

                };


            request.onerror =
                () => {

                    reject(
                        request.error
                    );

                };

        }
    );

},


/* ==================================
   CLEAR
================================== */

clear(
    storeName
) {

    return new Promise(
        (resolve, reject) => {

            const db =
                this.ready();


            const transaction =
                db.transaction(
                    storeName,
                    "readwrite"
                );


            const store =
                transaction.objectStore(
                    storeName
                );


            const request =
                store.clear();


            request.onsuccess =
                () => {

                    resolve(
                        true
                    );

                };


            request.onerror =
                () => {

                    reject(
                        request.error
                    );

                };

        }
    );

},


/* ==================================
   REPLACE YEAR
================================== */

replaceYear(
    storeName,
    year,
    data
) {

    return new Promise(
        (resolve, reject) => {

            const db =
                this.ready();


            year =
                Number(year);


            if (!year) {

                reject(
                    new Error(
                        "Tahun tidak valid."
                    )
                );

                return;

            }


            if (
                !db.objectStoreNames.contains(
                    storeName
                )
            ) {

                reject(
                    new Error(
                        `Object store "${storeName}" tidak ditemukan.`
                    )
                );

                return;

            }


            const transaction =
                db.transaction(
                    storeName,
                    "readwrite"
                );


            const store =
                transaction.objectStore(
                    storeName
                );


            if (
                !store.indexNames.contains(
                    "year"
                )
            ) {

                reject(
                    new Error(
                        `Index "year" pada store "${storeName}" tidak ditemukan.`
                    )
                );

                return;

            }


            const index =
                store.index(
                    "year"
                );


            /* ==================================
               AMBIL DATA LOKAL TERLEBIH DAHULU
            ================================== */

            const getLocalRequest =
                index.getAll(
                    IDBKeyRange.only(
                        year
                    )
                );


            getLocalRequest.onsuccess =
                event => {

                    const localData =
                        event.target.result || [];


                    const localById =
                        {};


                    if (
                        storeName ===
                        "penjualan"
                    ) {

                        localData.forEach(
                            item => {

                                const id =
                                    String(
                                        item?.id ||
                                        ""
                                    ).trim();


                                if (!id) {
                                    return;
                                }


                                localById[id] =
                                    item;

                            }
                        );

                    }


                    /* ==================================
                       HAPUS DATA TAHUN LAMA
                    ================================== */

                    const deleteRequest =
                        index.openCursor(
                            IDBKeyRange.only(
                                year
                            )
                        );


                    deleteRequest.onsuccess =
                        event => {

                            const cursor =
                                event.target.result;


                            if (cursor) {

                                cursor.delete();

                                cursor.continue();

                                return;

                            }


                            /* ==================================
                               MASUKKAN DATA SERVER
                            ================================== */

                            (data || [])
                                .forEach(
                                    item => {

                                        let record = {

                                            ...item,

                                            year:
                                                year

                                        };


                                        /* ==============================
                                           PRESERVE METADATA LOKAL
                                           KHUSUS PENJUALAN
                                        ============================== */

                                        if (
                                            storeName ===
                                            "penjualan"
                                        ) {

                                            const id =
                                                String(
                                                    item?.id ||
                                                    ""
                                                ).trim();


                                            const local =
                                                localById[id];


                                            if (local) {

                                                if (
                                                    local.syncStatus !==
                                                    undefined
                                                ) {

                                                    record.syncStatus =
                                                        local.syncStatus;

                                                }


                                                if (
                                                    local.syncedAt !==
                                                    undefined
                                                ) {

                                                    record.syncedAt =
                                                        local.syncedAt;

                                                }


                                                if (
                                                    local.serverId !==
                                                    undefined
                                                ) {

                                                    record.serverId =
                                                        local.serverId;

                                                }


                                                if (
                                                    local.database !==
                                                    undefined
                                                ) {

                                                    record.database =
                                                        local.database;

                                                }


                                                if (
                                                    local.returnStatus !==
                                                    undefined
                                                ) {

                                                    record.returnStatus =
                                                        local.returnStatus;

                                                }


                                                if (
                                                    local.returnAt !==
                                                    undefined
                                                ) {

                                                    record.returnAt =
                                                        local.returnAt;

                                                }


                                                if (
                                                    local.returnSyncedAt !==
                                                    undefined
                                                ) {

                                                    record.returnSyncedAt =
                                                        local.returnSyncedAt;

                                                }

                                            }

                                        }


                                        store.put(
                                            record
                                        );

                                    }
                                );

                        };


                    deleteRequest.onerror =
                        () => {

                            reject(
                                deleteRequest.error
                            );

                        };

                };


            getLocalRequest.onerror =
                () => {

                    reject(
                        getLocalRequest.error
                    );

                };


            transaction.oncomplete =
                () => {

                    resolve(
                        true
                    );

                };


            transaction.onerror =
                () => {

                    reject(
                        transaction.error
                    );

                };


            transaction.onabort =
                () => {

                    reject(
                        transaction.error ||
                        new Error(
                            "Transaksi IndexedDB dibatalkan."
                        )
                    );

                };

        }
    );

},


/* ==================================
   IS YEAR DOWNLOADED
================================== */

isYearDownloaded(
    year
) {

    return new Promise(
        (resolve, reject) => {

            const db =
                this.ready();


            year =
                Number(year);


            if (!year) {

                resolve(
                    false
                );

                return;

            }


            if (
                !db.objectStoreNames.contains(
                    "databaseYears"
                )
            ) {

                resolve(
                    false
                );

                return;

            }


            const transaction =
                db.transaction(
                    "databaseYears",
                    "readonly"
                );


            const store =
                transaction.objectStore(
                    "databaseYears"
                );


            const request =
                store.get(
                    year
                );


            request.onsuccess =
                () => {

                    resolve(
                        !!request.result
                    );

                };


            request.onerror =
                () => {

                    reject(
                        request.error
                    );

                };

        }
    );

},


/* ==================================
   MARK YEAR DOWNLOADED
================================== */

markYearDownloaded(
    year
) {

    return new Promise(
        (resolve, reject) => {

            const db =
                this.ready();


            year =
                Number(year);


            if (!year) {

                reject(
                    new Error(
                        "Tahun tidak valid."
                    )
                );

                return;

            }


            if (
                !db.objectStoreNames.contains(
                    "databaseYears"
                )
            ) {

                reject(
                    new Error(
                        'Object store "databaseYears" tidak ditemukan.'
                    )
                );

                return;

            }


            const transaction =
                db.transaction(
                    "databaseYears",
                    "readwrite"
                );


            const store =
                transaction.objectStore(
                    "databaseYears"
                );


            const record = {

                year:
                    year,

                downloadedAt:
                    new Date().toISOString()

            };


            const request =
                store.put(
                    record
                );


            request.onsuccess =
                () => {

                    resolve(
                        record
                    );

                };


            request.onerror =
                () => {

                    reject(
                        request.error
                    );

                };

        }
    );

},


/* ==================================
   DELETE YEAR
================================== */

deleteYear(
    year
) {

    return new Promise(
        (resolve, reject) => {

            const db =
                this.ready();


            year =
                Number(year);


            if (!year) {

                reject(
                    new Error(
                        "Tahun tidak valid."
                    )
                );

                return;

            }


            if (
                !db.objectStoreNames.contains(
                    "databaseYears"
                )
            ) {

                resolve(
                    true
                );

                return;

            }


            const transaction =
                db.transaction(
                    "databaseYears",
                    "readwrite"
                );


            const store =
                transaction.objectStore(
                    "databaseYears"
                );


            const request =
                store.delete(
                    year
                );


            request.onsuccess =
                () => {

                    resolve(
                        true
                    );

                };


            request.onerror =
                () => {

                    reject(
                        request.error
                    );

                };

        }
    );

},


/* ==================================
   PUT
   INSERT / UPDATE
================================== */

put(
    storeName,
    data
) {

    return new Promise(
        (resolve, reject) => {

            const db =
                this.ready();


            if (
                !db.objectStoreNames.contains(
                    storeName
                )
            ) {

                reject(
                    new Error(
                        `Object store "${storeName}" tidak ditemukan.`
                    )
                );

                return;

            }


            const transaction =
                db.transaction(
                    storeName,
                    "readwrite"
                );


            const store =
                transaction.objectStore(
                    storeName
                );


            const request =
                store.put(
                    data
                );


            request.onsuccess =
                () => {

                    resolve(
                        request.result
                    );

                };


            request.onerror =
                () => {

                    reject(
                        request.error
                    );

                };

        }
    );

},


/* ==================================
   ADD
   INSERT ONLY
================================== */

add(
    storeName,
    data
) {

    return new Promise(
        (resolve, reject) => {

            const db =
                this.ready();


            if (
                !db.objectStoreNames.contains(
                    storeName
                )
            ) {

                reject(
                    new Error(
                        `Object store "${storeName}" tidak ditemukan.`
                    )
                );

                return;

            }


            const transaction =
                db.transaction(
                    storeName,
                    "readwrite"
                );


            const store =
                transaction.objectStore(
                    storeName
                );


            const request =
                store.add(
                    data
                );


            request.onsuccess =
                () => {

                    resolve(
                        request.result
                    );

                };


            request.onerror =
                () => {

                    reject(
                        request.error
                    );

                };

        }
    );

},


/* ==================================
   DELETE
================================== */

delete(
    storeName,
    key
) {

    return new Promise(
        (resolve, reject) => {

            const db =
                this.ready();


            if (
                !db.objectStoreNames.contains(
                    storeName
                )
            ) {

                reject(
                    new Error(
                        `Object store "${storeName}" tidak ditemukan.`
                    )
                );

                return;

            }


            const transaction =
                db.transaction(
                    storeName,
                    "readwrite"
                );


            const store =
                transaction.objectStore(
                    storeName
                );


            const request =
                store.delete(
                    key
                );


            request.onsuccess =
                () => {

                    resolve(
                        true
                    );

                };


            request.onerror =
                () => {

                    reject(
                        request.error
                    );

                };

        }
    );

},


/* ==================================
   PUT ALL
================================== */

putAll(
    storeName,
    data
) {

    return new Promise(
        (resolve, reject) => {

            const db =
                this.ready();


            const transaction =
                db.transaction(
                    storeName,
                    "readwrite"
                );


            const store =
                transaction.objectStore(
                    storeName
                );


            store.clear();


            (data || [])
                .forEach(
                    item => {

                        store.put(
                            item
                        );

                    }
                );


            transaction.oncomplete =
                () => {

                    resolve(
                        true
                    );

                };


            transaction.onerror =
                () => {

                    reject(
                        transaction.error
                    );

                };

        }
    );

}


};