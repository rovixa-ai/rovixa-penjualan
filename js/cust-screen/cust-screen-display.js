// ======================================
// CUSTOMER SCREEN DISPLAY
// TREEHOUSE POS
// ======================================

const CustScreenDisplay = {

    /* ==================================
       CONFIG
    ================================== */

    channelName:
        "TREEHOUSE_POS_CUSTOMER_SCREEN",

    websocketUrl:
        "ws://192.168.1.134:8080",

    channel:
        null,

    state:
        "STANDBY",

    standbyTimer:
        null,

    cashierName: "Kasir",

    storeConfig:
        {},


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


            this.channel.addEventListener(
                "message",
                e => {

                    this.receive(
                        e.data
                    );

                }
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

            CustScreenNetwork.onMessage =
                message => {

                    this.receive(
                        message
                    );

                };


            CustScreenNetwork.init(
                this.websocketUrl
            );

        }


        this.showStandby();

    },


    /* ==================================
       RECEIVE
    ================================== */

    receive(message) {

        if (!message) {
            return;
        }


        /* ==============================
           STORE CONFIG
        ============================== */

        if (
            message.type ===
            "STORE_CONFIG"
        ) {

            this.storeConfig =
                (
                    message.data &&
                    typeof message.data ===
                    "object"
                )
                    ? {
                        ...message.data
                    }
                    : {};

            this.cashierName =
    this.storeConfig.CASHIER_NAME ||
    "Kasir";
            
           


            this.updateStoreName();

            this.updateStoreLogo();


            if (
                this.state ===
                "STANDBY"
            ) {

                if (
                    typeof CustScreenStandby !==
                    "undefined" &&
                    typeof CustScreenStandby.render ===
                    "function"
                ) {

                    CustScreenStandby.render();

                }

            }


            return;

        }


        /* ==============================
           TRANSACTION LOADING
        ============================== */

        if (
            message.type ===
            "TRANSACTION_LOADING"
        ) {

            this.showLoading(
                message.data
            );

            return;

        }


        /* ==============================
           TRANSACTION UPDATE
        ============================== */

        if (
            message.type ===
            "TRANSACTION_UPDATE"
        ) {

            this.showTransaction(
                message.data
            );

            return;

        }


        /* ==============================
           TRANSACTION CLEAR
        ============================== */

        if (
            message.type ===
            "TRANSACTION_CLEAR"
        ) {

            this.showStandby();

            return;

        }


        /* ==============================
           TRANSACTION FINISHED
        ============================== */

        if (
            message.type ===
            "TRANSACTION_FINISHED"
        ) {

            this.showFinished(
                message.data
            );

        }

    },


    /* ==================================
       UPDATE STORE NAME
    ================================== */

    updateStoreName() {

        const storeNameElement =
            document.getElementById(
                "custStoreName"
            );


        if (!storeNameElement) {
            return;
        }


        storeNameElement.textContent =
            this.storeConfig.STORE_NAME ||
            "";

    },


    /* ==================================
       UPDATE STORE LOGO
    ================================== */

    updateStoreLogo() {

        const logoElement =
            document.getElementById(
                "custStoreLogo"
            );


        if (!logoElement) {
            return;
        }


        const logo =
            String(
                this.storeConfig.STORE_LOGO ||
                ""
            ).trim();


        if (!logo) {

            logoElement.textContent =
                "T";

            return;

        }


        if (
            logo.startsWith(
                "data:image/"
            ) ||
            logo.startsWith(
                "http://"
            ) ||
            logo.startsWith(
                "https://"
            )
        ) {

            logoElement.innerHTML = `

                <img
                    src="${this.escapeAttribute(logo)}"
                    alt=""
                >

            `;

            return;

        }


        logoElement.textContent =
            logo;

    },


    /* ==================================
       ESCAPE ATTRIBUTE
    ================================== */

    escapeAttribute(value) {

        return String(
            value || ""
        )
            .replace(
                /&/g,
                "&amp;"
            )
            .replace(
                /"/g,
                "&quot;"
            )
            .replace(
                /'/g,
                "&#039;"
            )
            .replace(
                /</g,
                "&lt;"
            )
            .replace(
                />/g,
                "&gt;"
            );

    },


    /* ==================================
       STANDBY
    ================================== */

    showStandby() {

        this.state =
            "STANDBY";


        if (
            this.standbyTimer
        ) {

            clearTimeout(
                this.standbyTimer
            );

            this.standbyTimer =
                null;

        }


        if (
            typeof CustScreenStandby !==
            "undefined" &&
            typeof CustScreenStandby.render ===
            "function"
        ) {

            CustScreenStandby.render();

        }


        this.updateStoreName();

        this.updateStoreLogo();

    },


    /* ==================================
       LOADING
    ================================== */

    showLoading(data) {

        this.state =
            "LOADING";


        if (
            this.standbyTimer
        ) {

            clearTimeout(
                this.standbyTimer
            );

            this.standbyTimer =
                null;

        }


        if (
            typeof CustScreenLoading !==
            "undefined" &&
            typeof CustScreenLoading.render ===
            "function"
        ) {

            CustScreenLoading.render(
                data
            );

        }


        this.updateStoreName();

        this.updateStoreLogo();

    },


    /* ==================================
       TRANSACTION
    ================================== */

    showTransaction(data) {

        this.state =
            "TRANSACTION";


        if (
            this.standbyTimer
        ) {

            clearTimeout(
                this.standbyTimer
            );

            this.standbyTimer =
                null;

        }


        if (
            typeof CustScreenTransaction !==
            "undefined" &&
            typeof CustScreenTransaction.render ===
            "function"
        ) {

            CustScreenTransaction.render(
                data
            );

        }

    },


    /* ==================================
       FINISHED
    ================================== */

    showFinished(data) {

        this.state =
            "FINISHED";


        if (
            this.standbyTimer
        ) {

            clearTimeout(
                this.standbyTimer
            );

        }


        if (
            typeof CustScreenFinish !==
            "undefined" &&
            typeof CustScreenFinish.render ===
            "function"
        ) {

            CustScreenFinish.render(
                data
            );

        }


        this.standbyTimer =
            setTimeout(
                () => {

                    this.showStandby();

                },
                5000
            );

    }

};