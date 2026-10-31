// ======================================
// SALES
// PRODUCTS
// ======================================

Object.assign(
    Sales,
    {

        /* ==================================
           LOAD PRODUCTS
        ================================== */

        async loadProducts() {

            try {

                console.time(
                    "LOAD PRODUCTS"
                );

                /* ==============================
                   AMBIL DATA DARI INDEXEDDB
                ============================== */

                const barang =
                    await LocalDB.getAll(
                        "barang"
                    );

                const satuan =
                    await LocalDB.getAll(
                        "satuanBarang"
                    );

                /* ==============================
                   MAP SATUAN BERDASARKAN KODE
                ============================== */

                const satuanMap =
                    new Map();

                satuan.forEach(
                    unit => {

                        const kode =
                            String(
                                unit.kode || ""
                            ).trim();

                        if (!kode) {
                            return;
                        }

                        if (
                            !satuanMap.has(kode)
                        ) {

                            satuanMap.set(
                                kode,
                                []
                            );

                        }

                        satuanMap
                            .get(kode)
                            .push(unit);

                    }
                );

                /* ==============================
                   GABUNGKAN BARANG + SATUAN
                   URUTKAN ISI TERKECIL
                ============================== */

                this.products =
                    barang.map(
                        product => {

                            const kode =
                                String(
                                    product.kode || ""
                                ).trim();

                            const units =
                                [
                                    ...(
                                        satuanMap.get(
                                            kode
                                        ) || []
                                    )
                                ].sort(
                                    (a, b) => {

                                        const isiA =
                                            Number(
                                                a.isi
                                            );

                                        const isiB =
                                            Number(
                                                b.isi
                                            );

                                        const validA =
                                            Number.isFinite(
                                                isiA
                                            );

                                        const validB =
                                            Number.isFinite(
                                                isiB
                                            );

                                        if (
                                            validA &&
                                            validB
                                        ) {

                                            return (
                                                isiA - isiB
                                            );

                                        }

                                        if (validA) {
                                            return -1;
                                        }

                                        if (validB) {
                                            return 1;
                                        }

                                        return 0;

                                    }
                                );

                            return {

                                kode:
                                    kode,

                                /* ======================
                                   SESUAI getBootstrap()
                                ====================== */

                                barcode:
                                    product.barcode || "",

                                nama:
                                    product.nama || "",

                                kategori:
                                    product.kategori || "",

                                satuanDasar:
                                    product.satuanDasar || "",

                                stok:
                                    Number(
                                        product.stok
                                    ) || 0,

                                status:
                                    product.status || "",

                                satuan:
                                    units

                            };

                        }
                    );

                /* ==================================
                   RENDER
                ================================== */

                this.renderProducts();

                console.timeEnd(
                    "LOAD PRODUCTS"
                );

            }

            catch (error) {

                console.error(
                    "LOAD PRODUCTS ERROR:",
                    error
                );

                const container =
                    document.getElementById(
                        "productList"
                    );

                if (!container) {
                    return;
                }

                container.innerHTML = `

                    <div class="empty-cart">

                        <div>

                            <strong>
                                Gagal mengambil data barang
                            </strong>

                            <br>

                            <small>
                                ${error.message}
                            </small>

                        </div>

                    </div>

                `;

            }

        },


        /* ==================================
           RENDER PRODUCTS
        ================================== */

        renderProducts(
            products = this.products
        ) {

            const container =
                document.getElementById(
                    "productList"
                );

            const count =
                document.getElementById(
                    "productCount"
                );

            if (
                !container ||
                !count
            ) {

                return;

            }

            count.textContent =
                `${products.length} barang`;

            if (!products.length) {

                container.innerHTML = `

                    <div class="empty-cart">

                        Barang tidak ditemukan

                    </div>

                `;

                return;

            }

            container.innerHTML =
                products
                    .map(
                        product => {

                            const firstUnit =
                                Array.isArray(
                                    product.satuan
                                )
                                    ? product.satuan[0]
                                    : null;

                            /* ==========================
                               TANPA SATUAN
                            ========================== */

                            if (!firstUnit) {

                                return `

                                    <div
                                        class="product-card product-disabled"
                                        data-kode="${product.kode}"
                                    >

                                        <div
                                            class="product-name"
                                        >
                                            ${product.nama}
                                        </div>

                                        <div
                                            class="product-code"
                                        >
                                            ${product.kode}
                                        </div>

                                        <div
                                            class="product-bottom"
                                        >

                                            <span
                                                class="product-price"
                                            >
                                                Harga belum tersedia
                                            </span>

                                            <span
                                                class="product-stock"
                                            >
                                                Stok:
                                                ${product.stok}
                                                ${product.satuanDasar}
                                            </span>

                                        </div>

                                    </div>

                                `;

                            }

                            /* ==========================
                               NORMAL
                            ========================== */

                            return `

                                <div
                                    class="product-card"
                                    data-kode="${product.kode}"
                                >

                                    <div
                                        class="product-name"
                                    >
                                        ${product.nama}
                                    </div>

                                    <div
                                        class="product-code"
                                    >
                                        ${product.kode}
                                    </div>

                                    <div
                                        class="product-bottom"
                                    >

                                        <span
                                            class="product-price"
                                        >
                                            ${this.money(
                                                Number(
                                                    firstUnit.hargaJual
                                                ) || 0
                                            )}
                                        </span>

                                        <span
                                            class="product-stock"
                                        >
                                            Stok:
                                            ${product.stok}
                                            ${product.satuanDasar}
                                        </span>

                                    </div>

                                </div>

                            `;

                        }
                    )
                    .join("");

        }

    }
);