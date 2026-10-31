// ======================================
// SALES
// CART / SUMMARY
// ======================================

Object.assign(
    Sales,
    {

        /* ==================================
           GET SUMMARY
        ================================== */

        getSummary() {

            const subtotal =
                this.cart.reduce(
                    (
                        total,
                        item
                    ) => {

                        return total +
                            (
                                Number(
                                    item.qty
                                ) *
                                Number(
                                    item.harga
                                )
                            );

                    },
                    0
                );


            const discount =
                Math.min(
                    Number(
                        this.discount
                    ) || 0,
                    subtotal
                );


            const total =
                Math.max(
                    0,
                    subtotal - discount
                );


            return {

                subtotal:
                    subtotal,

                discount:
                    discount,

                total:
                    total

            };

        }

    }
);