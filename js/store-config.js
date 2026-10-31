// ======================================
// TREEHOUSE POS
// STORE CONFIG
// ======================================

const StoreConfig = {


    STORAGE_KEY:
        "TREEHOUSE_POS_STORE_CONFIG",

    config: {},


    /* ==================================
       LOAD
       ================================== */

    async load() {

        try {

            const result =
                await API.bootstrap();

            this.config =
                result?.storeConfig ||
                {};

            try {
                localStorage.setItem(
                    this.STORAGE_KEY,
                    JSON.stringify(
                        this.config
                    )
                );
            } catch (storageError) {
                console.warn(
                    "STORE CONFIG CACHE SAVE WARNING:",
                    storageError
                );
            }

            return this.config;

        }

        catch (error) {

            console.warn(
                "STORE CONFIG LOAD FAILED, TRYING CACHE:",
                error
            );

            try {
                const cached =
                    localStorage.getItem(
                        this.STORAGE_KEY
                    );

                if (cached) {
                    this.config =
                        JSON.parse(cached) || {};

                    return this.config;
                }
            } catch (cacheError) {
                console.warn(
                    "STORE CONFIG CACHE READ WARNING:",
                    cacheError
                );
            }

            this.config =
                {};

            return this.config;

        }

    },


    /* ==================================
       GET
       ================================== */

    get(key) {

        return (
            this.config[key] ??
            ""
        );

    },


    /* ==================================
       GET STORE NAME
       ================================== */

    getStoreName() {

        return this.get(
            "STORE_NAME"
        );

    },


    /* ==================================
       GET CURRENCY
       ================================== */

    getCurrency() {

        return (
            this.get(
                "CURRENCY"
            ) ||
            "IDR"
        );

    },


    /* ==================================
       GET TAX
       ================================== */

    isTaxEnabled() {

        return (
            String(
                this.get(
                    "TAX_ENABLED"
                )
            ).toLowerCase() ===
            "true"
        );

    },


    getTaxPercent() {

        return (
            Number(
                this.get(
                    "TAX_PERCENT"
                )
            ) ||
            0
        );

    },


    /* ==================================
       GET DISCOUNT
       ================================== */

    isDiscountEnabled() {

        return (
            String(
                this.get(
                    "DISCOUNT_ENABLED"
                )
            ).toLowerCase() ===
            "true"
        );

    },


    /* ==================================
       GET STORE INFORMATION
       ================================== */

    getAddress() {

        return this.get(
            "STORE_ADDRESS"
        );

    },


    getPhone() {

        return this.get(
            "STORE_PHONE"
        );

    },


    getEmail() {

        return this.get(
            "STORE_EMAIL"
        );

    },


    getLogo() {

        return this.get(
            "STORE_LOGO"
        );

    },


    getDescription() {

        return this.get(
            "STORE_DESCRIPTION"
        );

    },


    getStatus() {

        return this.get(
            "STORE_STATUS"
        );

    },


    /* ==================================
       GET TRANSACTION CONFIG
       ================================== */

    getProductPrefix() {

        return this.get(
            "PRODUCT_PREFIX"
        );

    },


    getTransactionPrefix() {

        return this.get(
            "TRANSACTION_PREFIX"
        );

    },


    /* ==================================
       GET RECEIPT CONFIG
       ================================== */

    getReceiptHeader() {

        return this.get(
            "RECEIPT_HEADER"
        );

    },


    getReceiptFooter() {

        return this.get(
            "RECEIPT_FOOTER"
        );

    },


    /* ==================================
       GET QRIS CONFIG
       ================================== */

    isQrisEnabled() {

        return (
            String(
                this.get(
                    "QRIS_ENABLED"
                )
            ).toLowerCase() ===
            "true"
        );

    },


    getQrisProvider() {

        return this.get(
            "QRIS_PROVIDER"
        );

    },


    getQrisMerchantId() {

        return this.get(
            "QRIS_MERCHANT_ID"
        );

    },


    getQrisApiUrl() {

        return this.get(
            "QRIS_API_URL"
        );

    },


    getQrisCallbackUrl() {

        return this.get(
            "QRIS_CALLBACK_URL"
        );

    },


    getQrisStoreId() {

        return this.get(
            "QRIS_STORE_ID"
        );

    },


    /* ==================================
       TIMEZONE
       ================================== */

    getTimezone() {

        return (
            this.get(
                "TIMEZONE"
            ) ||
            "Asia/Jakarta"
        );

    }

};