const Receipt = {

    printWindow: null,


    open() {

        try {

            this.printWindow =
                window.open(
                    "",
                    "_blank",
                    "width=400,height=700"
                );


            if (!this.printWindow) {

                Notification.error(
                    "Popup cetak diblokir browser.\n\n" +
                    "Silakan izinkan popup untuk aplikasi ini."
                );

                return false;

            }


            this.printWindow.document.open();


            this.printWindow.document.write(`

                <!DOCTYPE html>

                <html>

                <head>

                    <meta charset="UTF-8">

                    <title>Struk</title>

                </head>


                <body>

                    <div
                        style="
                            font-family:Arial;
                            text-align:center;
                            padding:30px;
                        "
                    >

                        Menyiapkan struk...

                    </div>

                </body>

                </html>

            `);


            this.printWindow.document.close();


            return true;

        }

        catch (error) {

            console.error(
                "RECEIPT OPEN ERROR:",
                error
            );


            this.printWindow = null;


            return false;

        }

    },


    render(data) {

        try {

          


            if (!data) {

                throw new Error(
                    "Data struk kosong."
                );

            }


            if (
                !this.printWindow ||
                this.printWindow.closed
            ) {

                if (!this.open()) {

                    return;

                }

            }


            const win =
                this.printWindow;


            const id =
                data.id || "";


            const rawTanggal = data.tanggal;

            let tanggal = "";

            if (
                rawTanggal !== null &&
                rawTanggal !== undefined &&
                String(rawTanggal).trim() !== ""
            ) {
                let parsedTanggal;

                if (rawTanggal instanceof Date) {
                    parsedTanggal = rawTanggal;
                } else {
                    const value = String(rawTanggal).trim();

                    const match = value.match(
                        /^(\d{2})\/(\d{2})\/(\d{4})(?:\s+(\d{2}):(\d{2})(?::(\d{2}))?)?$/
                    );

                    if (match) {
                        parsedTanggal = new Date(
                            Number(match[3]),
                            Number(match[2]) - 1,
                            Number(match[1]),
                            Number(match[4] || 0),
                            Number(match[5] || 0),
                            Number(match[6] || 0)
                        );
                    } else {
                        parsedTanggal = new Date(value);
                    }
                }

                if (
                    parsedTanggal &&
                    !Number.isNaN(parsedTanggal.getTime())
                ) {
                    tanggal = parsedTanggal.toLocaleString("id-ID", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                        hour12: false
                    });
                }
            }


            const kasir =
                data.kasir || "";


            const totalDiscount =
                Math.max(
                    0,
                    Number(
                        data.discount
                    ) || 0
                );


            const transactionDiscount =
                Math.max(
                    0,
                    Number(
                        data.transactionDiscount
                    ) || 0
                );


            const total =
                Number(
                    data.total
                ) || 0;


            const items =
                Array.isArray(
                    data.items
                )
                    ? data.items
                    : [];


            const pembayaran =
                Array.isArray(
                    data.pembayaran
                )
                    ? data.pembayaran
                    : [];


            /* ======================================
               STORE CONFIG
               ====================================== */

            const storeName =
                StoreConfig.getStoreName();


            const storeAddress =
                StoreConfig.getAddress();


            const storePhone =
                StoreConfig.getPhone();


            const storeEmail =
                StoreConfig.getEmail();


            const receiptHeader =
                StoreConfig.getReceiptHeader();


            const receiptFooter =
                StoreConfig.getReceiptFooter();


            const currency =
                StoreConfig.getCurrency() ||
                "IDR";


            const grossSubtotal =
                items.reduce(
                    (
                        total,
                        item
                    ) => {

                        const qty =
                            Number(
                                item.qty
                            ) || 0;


                        const harga =
                            Number(
                                item.harga
                            ) || 0;


                        return (
                            total +
                            (
                                qty *
                                harga
                            )
                        );

                    },
                    0
                );


            const itemDiscountTotal =
                items.reduce(
                    (
                        total,
                        item
                    ) => {

                        const qty =
                            Number(
                                item.qty
                            ) || 0;


                        const discount =
                            Math.max(
                                0,
                                Number(
                                    item.discount
                                ) || 0
                            );


                        return (
                            total +
                            (
                                qty *
                                discount
                            )
                        );

                    },
                    0
                );


            const money =
                value =>
                    new Intl.NumberFormat(
                        "id-ID"
                    ).format(
                        Number(
                            value
                        ) || 0
                    );


            const escapeHTML =
                value =>
                    String(
                        value ?? ""
                    )
                    .replace(
                        /&/g,
                        "&amp;"
                    )
                    .replace(
                        /</g,
                        "&lt;"
                    )
                    .replace(
                        />/g,
                        "&gt;"
                    )
                    .replace(
                        /"/g,
                        "&quot;"
                    )
                    .replace(
                        /'/g,
                        "&#039;"
                    );


            const storeNameHTML =
                storeName
                    ? `
                        <div class="store-name">
                            ${escapeHTML(storeName)}
                        </div>
                    `
                    : "";


            const storeAddressHTML =
                storeAddress
                    ? `
                        <div class="store-info">
                            ${escapeHTML(storeAddress)}
                        </div>
                    `
                    : "";


            const storePhoneHTML =
                storePhone
                    ? `
                        <div class="store-info">
                            ${escapeHTML(storePhone)}
                        </div>
                    `
                    : "";


            const storeEmailHTML =
                storeEmail
                    ? `
                        <div class="store-info">
                            ${escapeHTML(storeEmail)}
                        </div>
                    `
                    : "";


            const receiptHeaderHTML =
                receiptHeader
                    ? `
                        <div class="receipt-header">
                            ${escapeHTML(receiptHeader)}
                        </div>
                    `
                    : "";


            const receiptFooterHTML =
                receiptFooter
                    ? `
                        <div class="receipt-footer">
                            ${escapeHTML(receiptFooter)}
                        </div>
                    `
                    : "";


            let itemHTML = "";


            items.forEach(
                item => {

                    const nama =
                        escapeHTML(
                            item.nama || ""
                        );


                    const qty =
                        Number(
                            item.qty
                        ) || 0;


                    const satuan =
                        escapeHTML(
                            item.satuan || ""
                        );


                    const harga =
                        Number(
                            item.harga
                        ) || 0;


                    const itemDiscount =
                        Math.max(
                            0,
                            Number(
                                item.discount
                            ) || 0
                        );


                    const itemGrossSubtotal =
                        qty *
                        harga;


                    const itemDiscountTotal =
                        qty *
                        itemDiscount;


                    const itemSubtotal =
                        Math.max(
                            0,
                            itemGrossSubtotal -
                            itemDiscountTotal
                        );


                    itemHTML += `

                        <div class="item">

                            <div class="item-name">

                                ${nama}

                            </div>


                            <div class="item-detail">

                                <span>

                                    ${qty}
                                    ${satuan}
                                    x
                                    ${money(harga)}

                                </span>


                                <span>

                                    ${currency}
                                    ${money(
                                        itemGrossSubtotal
                                    )}

                                </span>

                            </div>


                            ${
                                itemDiscountTotal > 0

                                    ? `

                                        <div class="item-discount">

                                            <span>
                                                Discount
                                            </span>

                                            <span>
                                                -
                                                ${currency}
                                                ${money(
                                                    itemDiscountTotal
                                                )}
                                            </span>

                                        </div>

                                    `

                                    : ""
                            }


                            ${
                                itemDiscountTotal > 0

                                    ? `

                                        <div class="item-net">

                                            <span>
                                                Subtotal Item
                                            </span>

                                            <span>
                                                ${currency}
                                                ${money(
                                                    itemSubtotal
                                                )}
                                            </span>

                                        </div>

                                    `

                                    : ""
                            }

                        </div>

                    `;

                }
            );


            let paymentHTML = "";


            let totalPayment = 0;


            pembayaran.forEach(
                payment => {

                    const metode =
                        String(
                            payment.metode || ""
                        )
                        .trim()
                        .toUpperCase();


                    const nominal =
                        Number(
                            payment.nominal
                        ) || 0;


                    totalPayment +=
                        nominal;


                    paymentHTML += `

                        <div class="row">

                            <span>

                                ${escapeHTML(
                                    metode
                                )}

                            </span>


                            <span>

                                ${currency}
                                ${money(
                                    nominal
                                )}

                            </span>

                        </div>

                    `;

                }
            );


            const cashReturn =
                Math.max(
                    0,
                    totalPayment -
                    total
                );


            paymentHTML += `

                <div class="row payment-total">

                    <span>
                        Total Pembayaran
                    </span>

                    <span>
                        ${currency}
                        ${money(
                            totalPayment
                        )}
                    </span>

                </div>

            `;


            if (
                cashReturn > 0
            ) {

                paymentHTML += `

                    <div class="row change">

                        <span>
                            Cash Dikembalikan
                        </span>

                        <span>
                            ${currency}
                            ${money(
                                cashReturn
                            )}
                        </span>

                    </div>

                `;

            }


            const html = `

<!DOCTYPE html>

<html>

<head>

<meta charset="UTF-8">

<title>
    Struk ${escapeHTML(id)}
</title>


<style>

@page {

    size: 80mm auto;

    margin: 0;

}


* {

    box-sizing:
        border-box;

}


body {

    width:
        80mm;

    margin:
        0;

    padding:
        8px;

    font-family:
        Arial,
        sans-serif;

    font-size:
        12px;

    color:
        #000;

}


.center {

    text-align:
        center;

}


.store-name {

    font-size:
        18px;

    font-weight:
        bold;

    margin-bottom:
        3px;

}


.store-info {

    font-size:
        10px;

    line-height:
        1.4;

}


.receipt-header {

    font-size:
        10px;

    line-height:
        1.5;

    margin-top:
        7px;

    white-space:
        pre-line;

}


.receipt-footer {

    font-size:
        10px;

    line-height:
        1.5;

    margin-top:
        7px;

    white-space:
        pre-line;

}


.line {

    border-top:
        1px dashed #000;

    margin:
        7px 0;

}


.transaction {

    font-size:
        10px;

    line-height:
        1.5;

}


.item {

    margin:
        6px 0;

}


.item-name {

    font-weight:
        bold;

    word-break:
        break-word;

}


.item-detail {

    display:
        flex;

    justify-content:
        space-between;

    gap:
        5px;

    font-size:
        11px;

}


.item-discount {

    display:
        flex;

    justify-content:
        space-between;

    gap:
        5px;

    font-size:
        10px;

    margin-top:
        2px;

}


.item-net {

    display:
        flex;

    justify-content:
        space-between;

    gap:
        5px;

    font-size:
        10px;

    font-weight:
        bold;

    margin-top:
        2px;

}


.row {

    display:
        flex;

    justify-content:
        space-between;

    gap:
        10px;

    margin:
        4px 0;

}


.payment-total {

    font-weight:
        bold;

    margin-top:
        7px;

}


.change {

    font-weight:
        bold;

}


.total {

    font-size:
        15px;

    font-weight:
        bold;

    margin-top:
        6px;

}


.footer {

    margin-top:
        15px;

    text-align:
        center;

    font-size:
        10px;

    line-height:
        1.5;

}

</style>

</head>


<body>


<div class="center">

    ${storeNameHTML}

    ${storeAddressHTML}

    ${storePhoneHTML}

    ${storeEmailHTML}

    ${receiptHeaderHTML}

</div>


<div class="line"></div>


<div class="transaction">

    <div>

        ID :
        ${escapeHTML(id)}

    </div>


    <div>

        Tanggal :
        ${escapeHTML(tanggal)}

    </div>


    <div>

        Kasir :
        ${escapeHTML(kasir)}

    </div>

</div>


<div class="line"></div>


${itemHTML}


<div class="line"></div>


<div class="row">

    <span>
        Subtotal
    </span>


    <span>

        ${currency}
        ${money(
            grossSubtotal
        )}

    </span>

</div>


${
    itemDiscountTotal > 0

        ? `

            <div class="row">

                <span>
                    Discount Barang
                </span>


                <span>

                    -
                    ${currency}
                    ${money(
                        itemDiscountTotal
                    )}

                </span>

            </div>

        `

        : ""
}


${
    transactionDiscount > 0

        ? `

            <div class="row">

                <span>
                    Discount Transaksi
                </span>


                <span>

                    -
                    ${currency}
                    ${money(
                        transactionDiscount
                    )}

                </span>

            </div>

        `

        : ""
}


<div class="row total">

    <span>
        TOTAL
    </span>


    <span>

        ${currency}
        ${money(
            total
        )}

    </span>

</div>


<div class="line"></div>


${paymentHTML}


<div class="line"></div>


<div class="footer">

    ${
        receiptFooterHTML ||
        `
            <div>
                Terima kasih
            </div>

            <div>
                Selamat berbelanja kembali
            </div>
        `
    }

</div>


</body>

</html>

            `;


            win.document.open();

            win.document.write(
                html
            );

            win.document.close();


            setTimeout(
                () => {

                    try {

                        win.focus();

                        win.print();


                        setTimeout(
                            () => {

                                if (
                                    !win.closed
                                ) {

                                    win.close();

                                }

                            },
                            1000
                        );

                    }

                    catch (error) {

                        console.error(
                            "PRINT ERROR:",
                            error
                        );

                    }

                },
                300
            );

        }

        catch (error) {

            console.error(
                "RECEIPT RENDER ERROR:",
                error
            );


            Notification.error(
                "Struk gagal dibuat.\n\n" +
                error.message
            );

        }

    },


    cancel() {

        try {

            if (
                this.printWindow &&
                !this.printWindow.closed
            ) {

                this.printWindow.close();

            }

        }

        catch (error) {

            console.error(
                "RECEIPT CANCEL ERROR:",
                error
            );

        }


        this.printWindow = null;

    }

};