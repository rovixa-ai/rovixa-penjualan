
// ======================================
// TREEHOUSE POS
// CART
// ======================================

const Cart = {

    init() {

        this.event();

        this.render();

    },


    // ======================================
    // EVENT
    // LISTENER HANYA DIPASANG SATU KALI
    // ======================================

    event() {

        const container =
            document.getElementById("cartItems");

        if (!container) {
            return;
        }

        // Hindari listener ganda pada container yang sama.
        if (container.dataset.cartEventsBound === "true") {
            return;
        }

        container.dataset.cartEventsBound = "true";

        container.addEventListener("click", e => {

            const button = e.target.closest("[data-action]");

            if (!button || !container.contains(button)) {
                return;
            }

            const key = button.dataset.key;

            switch (button.dataset.action) {

                case "plus":
                    this.plus(key);
                    break;

                case "minus":
                    this.minus(key);
                    break;

                case "remove":
                    this.remove(key);
                    break;

            }

        });

    },


    // ======================================
    // MOBILE CART ANIMATION
    // ======================================

    animateMobileCart() {

        if (window.innerWidth > 600) {
            return;
        }

        const cartButton =
            document.getElementById("mobileSalesCartButton");

        if (!cartButton) {
            return;
        }

        cartButton.classList.remove("cart-item-added");

        void cartButton.offsetWidth;

        cartButton.classList.add("cart-item-added");

        setTimeout(() => {

            cartButton.classList.remove("cart-item-added");

        }, 800);

    },


    // ======================================
    // ADD ITEM
    // ======================================

    addItem(product, unit) {

        if (!product || !unit) {
            return;
        }

        const key =
            product.kode + "_" + unit.satuan;

        const existing =
            Sales.cart.find(item => item.key === key);

        if (existing) {

            const used =
                this.getUsedStock(product.kode);

            if (
                used + Number(unit.isi) >
                Number(product.stok)
            ) {

                Notification.error("Stok tidak mencukupi");

                return;

            }

            existing.qty++;

        } else {

            if (
                Number(unit.isi) >
                Number(product.stok)
            ) {

                Notification.error("Stok tidak mencukupi");

                return;

            }

            Sales.cart.push({

                key: key,

                kode: product.kode,

                nama: product.nama,

                satuan: unit.satuan,

                qty: 1,

                konversi: Number(unit.isi) || 1,

                harga: Number(unit.hargaJual) || 0,

                discount: Math.max(
                    0,
                    Number(unit.discount) || 0
                ),

                stok: Number(product.stok) || 0

            });

        }

        this.render();

        this.animateMobileCart();

    },


    // ======================================
    // PLUS
    // BERTAMBAH 1 SETIAP KLIK
    // ======================================

    plus(key) {

        const item =
            Sales.cart.find(item => item.key === key);

        if (!item) {
            return;
        }

        const used =
            this.getUsedStock(item.kode);

        if (
            used + Number(item.konversi) >
            Number(item.stok)
        ) {

            Notification.error("Stok tidak mencukupi");

            return;

        }

        item.qty++;

        this.render();

        this.animateMobileCart();

    },


    // ======================================
    // MINUS
    // BERKURANG 1 SETIAP KLIK
    // ======================================

    minus(key) {

        const item =
            Sales.cart.find(item => item.key === key);

        if (!item) {
            return;
        }

        item.qty--;

        if (item.qty <= 0) {

            this.remove(key);

            return;

        }

        this.render();

    },


    // ======================================
    // REMOVE
    // ======================================

    remove(key) {

        Sales.cart =
            Sales.cart.filter(item => item.key !== key);

        this.render();

    },


    // ======================================
    // CLEAR
    // ======================================

    clear() {

        Sales.cart = [];

        Sales.discount = 0;

        const discount =
            document.getElementById("discount");

        if (discount) {
            discount.value = "";
        }

        this.render();

    },


    // ======================================
    // USED STOCK
    // ======================================

    getUsedStock(kode) {

        return Sales.cart
            .filter(item => item.kode === kode)
            .reduce((total, item) => {

                return total + (
                    Number(item.qty) *
                    Number(item.konversi)
                );

            }, 0);

    },


    // ======================================
    // ITEM GROSS SUBTOTAL
    // ======================================

    getItemGrossSubtotal(item) {

        const qty = Number(item.qty) || 0;

        const harga = Number(item.harga) || 0;

        return qty * harga;

    },


    // ======================================
    // ITEM DISCOUNT
    // ======================================

    getItemDiscount(item) {

        const qty = Number(item.qty) || 0;

        const discount = Math.max(
            0,
            Number(item.discount) || 0
        );

        return qty * discount;

    },


    // ======================================
    // ITEM SUBTOTAL
    // ======================================

    getItemSubtotal(item) {

        const gross =
            this.getItemGrossSubtotal(item);

        const discount =
            this.getItemDiscount(item);

        return Math.max(0, gross - discount);

    },


    // ======================================
    // GROSS SUBTOTAL
    // ======================================

    getGrossSubtotal() {

        return Sales.cart.reduce((total, item) => {

            return total + this.getItemGrossSubtotal(item);

        }, 0);

    },


    // ======================================
    // UNIT DISCOUNT
    // ======================================

    getUnitDiscount() {

        return Sales.cart.reduce((total, item) => {

            return total + this.getItemDiscount(item);

        }, 0);

    },


    // ======================================
    // SUBTOTAL
    // ======================================

    getSubtotal() {

        return Sales.cart.reduce((total, item) => {

            return total + this.getItemSubtotal(item);

        }, 0);

    },


    // ======================================
    // TOTAL QUANTITY
    // ======================================

    getTotalQty() {

        return Sales.cart.reduce((total, item) => {

            return total + Number(item.qty);

        }, 0);

    },


    // ======================================
    // TRANSACTION DISCOUNT
    // ======================================

    getDiscount() {

        return Math.max(
            0,
            Number(Sales.discount) || 0
        );

    },


    // ======================================
    // TOTAL
    // ======================================

    getTotal() {

        return Math.max(
            0,
            this.getSubtotal() - this.getDiscount()
        );

    },


    // ======================================
    // SUMMARY
    // ======================================

    getSummary() {

        const grossSubtotal =
            this.getGrossSubtotal();

        const unitDiscount =
            this.getUnitDiscount();

        const subtotal =
            this.getSubtotal();

        const transactionDiscount =
            this.getDiscount();

        const total = Math.max(
            0,
            subtotal - transactionDiscount
        );

        return {

            grossSubtotal: grossSubtotal,

            unitDiscount: unitDiscount,

            subtotal: subtotal,

            transactionDiscount: transactionDiscount,

            discount: unitDiscount + transactionDiscount,

            total: total,

            totalQty: this.getTotalQty(),

            items: Sales.cart.length

        };

    },


    // ======================================
    // RENDER
    // ======================================

    render() {

        const container =
            document.getElementById("cartItems");

        const count =
            document.getElementById("cartCount");

        const subtotalElement =
            document.getElementById("subtotal");

        const totalElement =
            document.getElementById("total");

        const paymentButton =
            document.getElementById("paymentButton");

        // MOBILE ELEMENT

        const mobileCartCount =
            document.getElementById("mobileCartCount");

        const mobileCartHeaderCount =
            document.getElementById("mobileCartHeaderCount");

        const mobileSalesItemCount =
            document.getElementById("mobileSalesItemCount");

        const mobileSalesTotal =
            document.getElementById("mobileSalesTotal");

        const mobileSalesCartCount =
            document.getElementById("mobileSalesCartCount");

        if (
            !container ||
            !count ||
            !subtotalElement ||
            !totalElement ||
            !paymentButton
        ) {
            return;
        }

        // EMPTY CART

        if (!Sales.cart.length) {

            container.innerHTML = `
                <div class="empty-cart">
                    <div>
                        <div>Keranjang masih kosong</div>
                        <div>Pilih barang untuk memulai transaksi</div>
                    </div>
                </div>
            `;

            count.textContent = "0 item";

            subtotalElement.textContent = Sales.money(0);

            totalElement.textContent = Sales.money(0);

            paymentButton.disabled = true;

            if (mobileCartCount) {
                mobileCartCount.textContent = "0";
            }

            if (mobileCartHeaderCount) {
                mobileCartHeaderCount.textContent = "0 item";
            }

            if (mobileSalesItemCount) {
                mobileSalesItemCount.textContent = "0 item";
            }

            if (mobileSalesTotal) {
                mobileSalesTotal.textContent = Sales.money(0);
            }

            if (mobileSalesCartCount) {
                mobileSalesCartCount.textContent = "0";
            }

            if (
                typeof CustScreen !== "undefined" &&
                typeof CustScreen.clear === "function"
            ) {
                CustScreen.clear();
            }

            return;

        }

        // RENDER ITEMS

        let subtotal = 0;

        let totalQty = 0;

        container.innerHTML = Sales.cart.map(item => {

            const itemGross =
                this.getItemGrossSubtotal(item);

            const itemDiscount =
                Math.max(0, Number(item.discount) || 0);

            const itemDiscountTotal =
                this.getItemDiscount(item);

            const itemSubtotal =
                Math.max(0, itemGross - itemDiscountTotal);

            subtotal += itemSubtotal;

            totalQty += Number(item.qty);

            return `
                <div class="cart-item">

                    <div class="cart-item-top">

                        <div>

                            <div class="cart-item-name">
                                ${item.nama}
                            </div>

                            <div class="cart-item-code">
                                ${item.kode} · ${item.satuan}
                            </div>

                            ${
                                itemDiscount > 0
                                    ? `
                                        <div class="cart-item-discount">
                                            Disc ${Sales.money(itemDiscount)}
                                            × ${item.qty}
                                            = ${Sales.money(itemDiscountTotal)}
                                        </div>
                                    `
                                    : ""
                            }

                        </div>

                        <div class="cart-item-price">
                            ${Sales.money(itemSubtotal)}
                        </div>

                    </div>

                    <div class="cart-item-bottom">

                        <div class="qty-control">

                            <button
                                type="button"
                                data-action="minus"
                                data-key="${item.key}"
                            >
                                −
                            </button>

                            <span>${item.qty}</span>

                            <button
                                type="button"
                                data-action="plus"
                                data-key="${item.key}"
                            >
                                +
                            </button>

                        </div>

                        <button
                            type="button"
                            class="remove-item"
                            data-action="remove"
                            data-key="${item.key}"
                        >
                            Hapus
                        </button>

                    </div>

                </div>
            `;

        }).join("");

        // TOTAL

        const transactionDiscount =
            this.getDiscount();

        const total = Math.max(
            0,
            subtotal - transactionDiscount
        );

        // DESKTOP

        count.textContent = `${totalQty} item`;

        subtotalElement.textContent =
            Sales.money(subtotal);

        totalElement.textContent =
            Sales.money(total);

        paymentButton.disabled = total <= 0;

        // MOBILE

        if (mobileCartCount) {
            mobileCartCount.textContent = String(totalQty);
        }

        if (mobileCartHeaderCount) {
            mobileCartHeaderCount.textContent = `${totalQty} item`;
        }

        if (mobileSalesItemCount) {
            mobileSalesItemCount.textContent = `${totalQty} item`;
        }

        if (mobileSalesTotal) {
            mobileSalesTotal.textContent = Sales.money(total);
        }

        if (mobileSalesCartCount) {
            mobileSalesCartCount.textContent = String(totalQty);
        }

        // CUSTOMER SCREEN

        if (
            typeof CustScreen !== "undefined" &&
            typeof CustScreen.send === "function"
        ) {
            CustScreen.send();
        }

    }

};
