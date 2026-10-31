// ======================================
// UNIT MODAL
// TREEHOUSE POS
// ======================================

const UnitModal = {


    /* ==================================
       DATA
    ================================== */

    selectedProduct: null,


    /* ==================================
       INIT
    ================================== */

    init() {

        this.render();

        this.event();

    },


    /* ==================================
       RENDER
    ================================== */

    render() {

        /*
         * Jangan membuat modal dua kali
         */

        if (
            document.getElementById(
                "unitModal"
            )
        ) {

            return;

        }


        document.body.insertAdjacentHTML(
            "beforeend",
            `

            <div
                class="unit-modal-overlay"
                id="unitModal"
            >

                <div
                    class="unit-modal"
                >

                    <div
                        class="unit-modal-header"
                    >

                        <div>

                            <div
                                class="unit-modal-title"
                                id="unitModalTitle"
                            >
                                Pilih Satuan
                            </div>


                            <div
                                class="unit-modal-subtitle"
                                id="unitModalSubtitle"
                            ></div>

                        </div>


                        <button
                            type="button"
                            class="unit-modal-close"
                            id="unitModalClose"
                        >
                            ×
                        </button>

                    </div>


                    <div
                        class="unit-list"
                        id="unitList"
                    ></div>

                </div>

            </div>

            `
        );

    },


    /* ==================================
       EVENT
    ================================== */

    event() {

        const closeButton =
            document.getElementById(
                "unitModalClose"
            );


        const modal =
            document.getElementById(
                "unitModal"
            );


        const unitList =
            document.getElementById(
                "unitList"
            );


        if (
            !closeButton ||
            !modal ||
            !unitList
        ) {

            console.error(
                "UNIT MODAL ELEMENT TIDAK DITEMUKAN"
            );

            return;

        }


        /* ==============================
           CLOSE BUTTON
        ============================== */

        closeButton.addEventListener(
            "click",
            () => {

                this.close();

            }
        );


        /* ==============================
           OVERLAY
        ============================== */

        modal.addEventListener(
            "click",
            e => {

                if (
                    e.target.id ===
                    "unitModal"
                ) {

                    this.close();

                }

            }
        );


        /* ==============================
           UNIT
        ============================== */

        unitList.addEventListener(
            "click",
            e => {

                const card =
                    e.target.closest(
                        ".unit-card"
                    );


                if (!card) {

                    return;

                }


                const index =
                    Number(
                        card.dataset.index
                    );


                this.select(
                    index
                );

            }
        );

    },


    /* ==================================
       OPEN
    ================================== */

    open(kode) {

        /*
         * Pastikan modal sudah ada.
         */

        if (
            !document.getElementById(
                "unitModal"
            )
        ) {

            this.render();

            this.event();

        }


        const product =
            Sales.products.find(
                item =>
                    String(
                        item.kode
                    ).trim() ===
                    String(
                        kode
                    ).trim()
            );


        if (!product) {

            console.warn(
                "PRODUCT TIDAK DITEMUKAN:",
                kode
            );

            return;

        }


        this.selectedProduct =
            product;


        /* ==============================
           ELEMENT
        ============================== */

        const title =
            document.getElementById(
                "unitModalTitle"
            );


        const subtitle =
            document.getElementById(
                "unitModalSubtitle"
            );


        const container =
            document.getElementById(
                "unitList"
            );


        const modal =
            document.getElementById(
                "unitModal"
            );


        if (
            !title ||
            !subtitle ||
            !container ||
            !modal
        ) {

            console.error(
                "UNIT MODAL ELEMENT TIDAK LENGKAP"
            );

            return;

        }


        /* ==============================
           TITLE
        ============================== */

        title.textContent =
            product.nama;


        subtitle.textContent =
            `${product.kode} · Stok ${product.stok} ${product.satuanDasar}`;


        /* ==============================
           UNIT
        ============================== */

        const units =
            Array.isArray(
                product.satuan
            )
                ? product.satuan
                : [];


        if (!units.length) {

            container.innerHTML = `

                <div class="empty-cart">

                    Satuan barang tidak tersedia.

                </div>

            `;

        }

        else {

            container.innerHTML =
                units
                    .map(
                        (unit, index) => `

                            <div
                                class="unit-card"
                                data-index="${index}"
                            >

                                <div>

                                    <div
                                        class="unit-name"
                                    >
                                        ${unit.satuan}
                                    </div>


                                    <div
                                        class="unit-info"
                                    >

                                        Isi:
                                        ${unit.isi}
                                        ${product.satuanDasar}

                                    </div>

                                </div>


                                <div
                                    class="unit-price"
                                >

                                    ${Sales.money(
                                        unit.hargaJual
                                    )}

                                </div>

                            </div>

                        `
                    )
                    .join("");

        }


        /* ==============================
           SHOW
        ============================== */

        modal.classList.add(
            "show"
        );

    },


    /* ==================================
       SELECT
    ================================== */

    select(index) {

        if (
            !this.selectedProduct
        ) {

            return;

        }


        const units =
            Array.isArray(
                this.selectedProduct.satuan
            )
                ? this.selectedProduct.satuan
                : [];


        const unit =
            units[index];


        if (!unit) {

            return;

        }


        /* ==============================
           ADD TO CART
        ============================== */

        Cart.addItem(
            this.selectedProduct,
            unit
        );


        /* ==============================
           CLOSE
        ============================== */

        this.close();


        /* ==============================
           FOCUS SEARCH
        ============================== */

        setTimeout(
            () => {

                const search =
                    document.getElementById(
                        "searchProduct"
                    );


                if (search) {

                    search.focus();

                }

            },
            100
        );

    },


    /* ==================================
       CLOSE
    ================================== */

    close() {

        const modal =
            document.getElementById(
                "unitModal"
            );


        if (!modal) {

            return;

        }


        modal.classList.remove(
            "show"
        );


        this.selectedProduct =
            null;

    }

};
