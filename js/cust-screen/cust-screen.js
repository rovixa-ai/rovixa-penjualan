// ======================================
// CUSTOMER SCREEN
// TREEHOUSE POS
// ======================================

const CustScreen = {

    channelName:
        "TREEHOUSE_POS_CUSTOMER_SCREEN",

    websocketUrl:
        "ws://192.168.1.134:8080",

    channel:
        null,

    window:
        null,


    /* ==================================
       INIT
    ================================== */

    init() {

        if (
            typeof BroadcastChannel !==
            "undefined"
        ) {

            this.channel =
                new BroadcastChannel(
                    this.channelName
                );

        }
        else {

            console.warn(
                "BroadcastChannel tidak tersedia."
            );

        }


        if (
            typeof CustScreenNetwork !==
            "undefined" &&
            this.websocketUrl
        ) {

            CustScreenNetwork.init(
                this.websocketUrl
            );

        }

    },


    /* ==================================
       SEND STORE CONFIG
    ================================== */

    sendStoreConfig() {

        const storeConfig = {
            ...(StoreConfig.config || {})
        };


        const message = {

    type: "STORE_CONFIG",

    data: {
        ...storeConfig,
        CASHIER_NAME: this.getCashierName()
    }

};


        if (this.channel) {

            this.channel.postMessage(
                message
            );

        }


        if (
            typeof CustScreenNetwork !==
            "undefined" &&
            CustScreenNetwork.connected
        ) {

            CustScreenNetwork.send(
                message
            );

        }

    },


    /* ==================================
       OPEN CUSTOMER SCREEN
    ================================== */

    open() {

        this.window =
            window.open(
                "cust-screen.html",
                "TreehouseCustomerScreen",
                "width=1280,height=720"
            );


        if (!this.window) {

            console.warn(
                "Customer Screen tidak dapat dibuka."
            );

            return;

        }


        setTimeout(
            () => {

                this.sendStoreConfig();

            },
            500
        );

    },

    getCashierName() {

    const user =
        typeof Auth !== "undefined"
            ? Auth.getCurrentUser()
            : null;

    if (!user) {
        return "Kasir";
    }

    return (
        user.nama ||
        user.Nama ||
        user.username ||
        user.Username ||
        "Kasir"
    );

},


    /* ==================================
       SEND TRANSACTION
    ================================== */

    send() {

        const summary =
            Cart.getSummary();


        const data = {

            items:
                Sales.cart.map(
                    item => ({

                        kode:
                            item.kode,

                        nama:
                            item.nama,

                        satuan:
                            item.satuan,

                        qty:
                            Number(item.qty) || 0,

                        konversi:
                            Number(item.konversi) || 1,

                        harga:
                            Number(item.harga) || 0,

                        discount:
                            Number(item.discount) || 0,

                        subtotal:
                            Cart.getItemSubtotal(
                                item
                            )

                    })
                ),


            discount:
                Number(
                    Sales.discount
                ) || 0,


            summary:
                summary

        };


        const message = {

            type:
                "TRANSACTION_UPDATE",

            data:
                data

        };


        if (this.channel) {

            this.channel.postMessage(
                message
            );

        }


        if (
            typeof CustScreenNetwork !==
            "undefined" &&
            CustScreenNetwork.connected
        ) {

            CustScreenNetwork.send(
                message
            );

        }

    },


    /* ==================================
       CLEAR
    ================================== */

    clear() {

        const message = {

            type:
                "TRANSACTION_CLEAR"

        };


        if (this.channel) {

            this.channel.postMessage(
                message
            );

        }


        if (
            typeof CustScreenNetwork !==
            "undefined" &&
            CustScreenNetwork.connected
        ) {

            CustScreenNetwork.send(
                message
            );

        }

    },


    /* ==================================
       FINISHED
    ================================== */

    finished(data) {

        const message = {

            type:
                "TRANSACTION_FINISHED",

            data:
                data || null

        };


        if (this.channel) {

            this.channel.postMessage(
                message
            );

        }


        if (
            typeof CustScreenNetwork !==
            "undefined" &&
            CustScreenNetwork.connected
        ) {

            CustScreenNetwork.send(
                message
            );

        }

    },


    /* ==================================
       CLOSE
    ================================== */

    close() {

        if (
            this.window &&
            !this.window.closed
        ) {

            this.window.close();

        }


        this.window =
            null;

    },


    /* ==================================
       DESTROY
    ================================== */

    destroy() {

        this.close();


        if (this.channel) {

            this.channel.close();

            this.channel =
                null;

        }


        if (
            typeof CustScreenNetwork !==
            "undefined"
        ) {

            CustScreenNetwork.disconnect();

        }

    }

};