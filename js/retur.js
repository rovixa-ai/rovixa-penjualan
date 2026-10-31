
Object.assign(Report, {

    async retur(data, modal) {

        try {

            if (!data) {

                throw new Error(
                    "Data transaksi tidak tersedia."
                );

            }


            const id =
                String(
                    data.id || ""
                ).trim();


            if (!id) {

                throw new Error(
                    "ID transaksi tidak ditemukan."
                );

            }


            const transaction =
                await LocalDB.get(
                    "penjualan",
                    id
                );


            if (!transaction) {

                throw new Error(
                    "Transaksi " +
                    id +
                    " tidak ditemukan di database lokal."
                );

            }


            const currentStatus =
                String(
                    transaction.status || ""
                )
                    .trim()
                    .toUpperCase();


            if (
                currentStatus ===
                "RETUR"
            ) {

                throw new Error(
                    "Transaksi " +
                    id +
                    " sudah berstatus RETUR."
                );

            }


            /* ======================================
               KONFIRMASI RETUR GLOBAL
            ====================================== */

            const confirmed =
                await Dialog.confirm(

                    "Apakah Anda yakin ingin melakukan retur transaksi ini?\n\n" +
                    "ID Transaksi:\n" +
                    id +
                    "\n\n" +
                    "Stok barang akan dikembalikan.\n" +
                    "Transaksi, detail barang, dan pembayaran tetap disimpan sebagai riwayat.\n\n" +
                    "Pengembalian pembayaran dilakukan secara CASH.\n\n" +
                    "Status transaksi akan diubah menjadi RETUR.",

                    {
                        title: "Konfirmasi Retur",
                        confirmText: "Lanjut",
                        cancelText: "Batal",
                        variant: "danger"
                    }

                );


            if (!confirmed) {

                return;

            }


            /* ======================================
               AMBIL DATABASE
            ====================================== */

            const database =
                data.database ||
                transaction.database ||
                {};


            /* ======================================
               DETAIL TRANSAKSI
            ====================================== */

            const allDetails =
                await LocalDB.getAll(
                    "detailPenjualan"
                );


            const details =
                allDetails.filter(
                    item =>
                        String(
                            item.id || ""
                        ).trim() === id
                );


            if (!details.length) {

                throw new Error(
                    "Detail transaksi tidak ditemukan: " +
                    id
                );

            }


            /* ======================================
               MASTER BARANG
            ====================================== */

            const allBarang =
                await LocalDB.getAll(
                    "barang"
                );


            const barangMap =
                new Map();


            allBarang.forEach(
                barang => {

                    const kode =
                        String(
                            barang.kode || ""
                        ).trim();


                    if (kode) {

                        barangMap.set(
                            kode,
                            barang
                        );

                    }

                }
            );


            /* ======================================
               KEMBALIKAN STOK
            ====================================== */

            for (
                const detail of details
            ) {

                const kode =
                    String(
                        detail.kode || ""
                    ).trim();


                if (!kode) {
                    continue;
                }


                const barang =
                    barangMap.get(
                        kode
                    );


                if (!barang) {

                    throw new Error(
                        "Barang " +
                        kode +
                        " tidak ditemukan di database lokal."
                    );

                }


                const qty =
                    Number(
                        detail.qty
                    ) || 0;


                const konversi =
                    Number(
                        detail.konversi
                    ) || 1;


                const jumlahStok =
                    qty *
                    konversi;


                if (
                    jumlahStok <= 0
                ) {

                    continue;

                }


                barang.stok =
                    (
                        Number(
                            barang.stok
                        ) || 0
                    ) +
                    jumlahStok;


                await LocalDB.put(
                    "barang",
                    barang
                );



            }


            /* ======================================
               UPDATE TRANSAKSI
            ====================================== */

            const updatedTransaction = {

                ...transaction,

                status:
                    "RETUR",

                database:
                    database,

                returnStatus:
                    "pending",

                returnAt:
                    new Date().toISOString()

            };


            await LocalDB.put(
                "penjualan",
                updatedTransaction
            );


            /* ======================================
               TENTUKAN YEAR TRANSAKSI
            ====================================== */

            let transactionYear =
                Number(
                    transaction.year
                );


            if (!transactionYear) {

                const transactionDate =
                    new Date(
                        transaction.tanggal
                    );


                if (
                    !isNaN(
                        transactionDate.getTime()
                    )
                ) {

                    transactionYear =
                        transactionDate.getFullYear();

                }

            }


            if (!transactionYear) {

                throw new Error(
                    "Tahun transaksi tidak dapat ditentukan untuk pembayaran retur."
                );

            }


            /* ======================================
               PEMBAYARAN RETUR
            ====================================== */

            const allPayments =
                await LocalDB.getAll(
                    "pembayaran"
                );


            const returnPaymentExists =
                allPayments.some(
                    item => (

                        String(
                            item.id || ""
                        ).trim() === id &&

                        String(
                            item.metode || ""
                        )
                            .trim()
                            .toUpperCase() ===
                            "CASH" &&

                        Number(
                            item.nominal
                        ) === 0 &&

                        Number(
                            item.kembalian
                        ) ===
                        (
                            Number(
                                transaction.total
                            ) || 0
                        ) &&

                        String(
                            item.type || ""
                        )
                            .trim()
                            .toUpperCase() ===
                            "RETUR"

                    )
                );


            if (
                !returnPaymentExists
            ) {

                await LocalDB.add(
                    "pembayaran",
                    {

                        id:
                            id,

                        metode:
                            "CASH",

                        nominal:
                            0,

                        kembalian:
                            Number(
                                transaction.total
                            ) || 0,

                        type:
                            "RETUR",

                        status:
                            "pending",

                        year:
                            transactionYear,

                        createdAt:
                            new Date().toISOString()

                    }
                );

            }


            /* ======================================
               UPDATE DATA REFERENSI
            ====================================== */

            if (data) {

                data.status =
                    "RETUR";

            }


            /* ======================================
               TUTUP MODAL DETAIL
            ====================================== */

            if (
                modal &&
                typeof modal.remove ===
                    "function"
            ) {

                modal.remove();

            }


            /* ======================================
               NOTIFIKASI GLOBAL
            ====================================== */

            Dialog.success(
                "Transaksi " +
                id +
                " berhasil diretur."
            );


            /* ======================================
               REFRESH REPORT
            ====================================== */

            if (
                typeof this.load ===
                "function"
            ) {

                await this.load();

            }


            /* ======================================
               BACKGROUND SYNC RETUR
            ====================================== */

            if (
                typeof LocalSync !==
                    "undefined" &&
                typeof LocalSync.syncReturn ===
                    "function"
            ) {

                Promise.resolve()

                    .then(
                        () =>
                            LocalSync.syncReturn(
                                id
                            )
                    )

                    .then(
                        result =>
                            console.log(
                                "BACKGROUND RETUR SYNC RESULT:",
                                result
                            )
                    )

                    .catch(
                        error =>
                            console.error(
                                "BACKGROUND RETUR SYNC ERROR:",
                                id,
                                error
                            )
                    );

            }
            else {

                

            }

        }
        catch (error) {

            console.error(
                "RETUR TRANSAKSI ERROR:",
                error
            );


            /* ======================================
               ERROR GLOBAL
            ====================================== */

            Dialog.error(
                "Retur transaksi gagal.\n\n" +
                (
                    error.message ||
                    "Terjadi kesalahan yang tidak diketahui."
                )
            );

        }

    }

});
