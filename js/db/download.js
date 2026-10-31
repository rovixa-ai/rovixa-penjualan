// ======================================
// TREEHOUSE POS
// DOWNLOAD DATABASE PENJUALAN
// APP KASIR
// ======================================

const Download = {

    /* ==================================
       DOWNLOAD DATABASE
    ================================== */

    async download(year) {

        year = Number(year);

        if (!year) {
            throw new Error(
                "Tahun database Penjualan tidak valid."
            );
        }

        if (typeof API === "undefined") {
            throw new Error(
                "API tidak tersedia."
            );
        }

        if (typeof LocalDB === "undefined") {
            throw new Error(
                "LocalDB tidak tersedia."
            );
        }

        /* ==================================
           RESOLVE DATABASE
        ================================== */

        

        const resolved =
            await API.resolvePenjualanDatabase(year);

        

        if (
            !resolved ||
            resolved.success !== true
        ) {
            throw new Error(
                resolved?.message ||
                "Database Penjualan gagal ditemukan atau dibuat."
            );
        }

        const database = {

            year: Number(
                resolved.year || year
            ),

            penjualanId: String(
                resolved.penjualan || ""
            ).trim(),

            detailPenjualanId: String(
                resolved.detailPenjualan || ""
            ).trim(),

            pembayaranId: String(
                resolved.pembayaran || ""
            ).trim()

        };

        if (
            !database.year ||
            !database.penjualanId ||
            !database.detailPenjualanId ||
            !database.pembayaranId
        ) {
            throw new Error(
                "Database Penjualan tahun " +
                year +
                " belum lengkap."
            );
        }

        /* ==================================
           SIMPAN KONFIGURASI DATABASE LOKAL
        ================================== */

        if (
            typeof DatabaseConfig === "undefined" ||
            typeof DatabaseConfig.saveYearDatabase !== "function"
        ) {
            throw new Error(
                "DatabaseConfig tidak tersedia."
            );
        }

        DatabaseConfig.saveYearDatabase(
            database.year,
            {
                penjualan: database.penjualanId,
                detailPenjualan: database.detailPenjualanId,
                pembayaran: database.pembayaranId
            }
        );

       

        /* ==================================
           DOWNLOAD DATA SERVER
        ================================== */

        const response =
            await API.getDownloadPenjualan(database);

        

        if (
            !response ||
            response.success !== true
        ) {
            throw new Error(
                response?.message ||
                "Gagal download database Penjualan."
            );
        }

        const data =
            response.data || response;

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
           TANDAI TRANSAKSI SERVER
        ================================== */

        const syncedAt =
            new Date().toISOString();

        const syncedPenjualan =
            penjualan.map(transaction => {

                return {

                    ...transaction,

                    year: database.year,

                    syncStatus: "synced",

                    syncedAt: syncedAt,

                    serverId: String(
                        transaction.id || ""
                    ).trim()

                };

            });

        /* ==================================
           TAMBAHKAN YEAR PADA DETAIL
        ================================== */

        const yearDetailPenjualan =
            detailPenjualan.map(detail => {

                return {

                    ...detail,

                    year: database.year

                };

            });

        /* ==================================
           TAMBAHKAN YEAR PADA PEMBAYARAN
        ================================== */

        const yearPembayaran =
            pembayaran.map(payment => {

                return {

                    ...payment,

                    year: database.year

                };

            });

        /* ==================================
           SIMPAN PENJUALAN
           HANYA TAHUN INI
        ================================== */

       

        await LocalDB.replaceYear(
            "penjualan",
            database.year,
            syncedPenjualan
        );

        /* ==================================
           SIMPAN DETAIL PENJUALAN
           HANYA TAHUN INI
        ================================== */

        await LocalDB.replaceYear(
            "detailPenjualan",
            database.year,
            yearDetailPenjualan
        );

        /* ==================================
           SIMPAN PEMBAYARAN
           HANYA TAHUN INI
        ================================== */

        await LocalDB.replaceYear(
            "pembayaran",
            database.year,
            yearPembayaran
        );

        /* ==================================
           TANDAI TAHUN SUDAH TERDOWNLOAD
        ================================== */

        const yearStatus =
            await LocalDB.markYearDownloaded(
                database.year
            );


        /* ==================================
           HASIL
        ================================== */

        const result = {

            success: true,

            year: database.year,

            database: database,

            counts: {

                penjualan:
                    syncedPenjualan.length,

                detailPenjualan:
                    yearDetailPenjualan.length,

                pembayaran:
                    yearPembayaran.length

            }

        };

       

        return result;

    }

};