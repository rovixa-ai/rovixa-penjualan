const CustScreenStandby = { 
 
    render() { 
 
        const main = 
            document.getElementById( 
                "custMain" 
            ); 
 
        if (!main) { 
            return; 
        } 
 
 
        const storeName = 
            ( 
                typeof CustScreenDisplay !== 
                "undefined" && 
                CustScreenDisplay.storeConfig && 
                CustScreenDisplay.storeConfig.STORE_NAME 
            ) 
                ? CustScreenDisplay.storeConfig.STORE_NAME 
                : ""; 
 
 
        const storeLogo = 
            ( 
                typeof CustScreenDisplay !== 
                "undefined" && 
                CustScreenDisplay.storeConfig && 
                CustScreenDisplay.storeConfig.STORE_LOGO 
            ) 
                ? String( 
                    CustScreenDisplay.storeConfig.STORE_LOGO 
                ).trim() 
                : ""; 
 
 
        let logoHTML = 
            "T"; 
 
 
        if (storeLogo) { 
 
            if ( 
                storeLogo.startsWith( 
                    "data:image/" 
                ) || 
                storeLogo.startsWith( 
                    "http://" 
                ) || 
                storeLogo.startsWith( 
                    "https://" 
                ) 
            ) { 
 
                logoHTML = ` 
 
                    <img 
                        src="${this.escapeAttribute(storeLogo)}" 
                        alt="" 
                    > 
 
                `; 
 
            } 
            else { 
 
                logoHTML = 
                    this.escape( 
                        storeLogo 
                    ); 
 
            } 
 
        } 
 
 
        main.innerHTML = ` 
 
            <div class="cust-standby"> 
 
                <img 
                    class="cust-standby-gif" 
                    src="videos/customer-standby.gif" 
                    alt="" 
                > 
 
 
                <div class="cust-standby-overlay"> 
 
                    <div class="cust-standby-logo"> 
 
                        ${logoHTML} 
 
                    </div> 
 
                    <div class="cust-standby-title"> 
                        Selamat Datang 
                    </div> 
 
                    <div class="cust-standby-brand"> 
                        di ${this.escape(storeName)} 
                    </div> 
 
                    <div class="cust-standby-message">

                        <div class="cust-standby-cashier-name">
                            ${this.escape(
                                (
                                    typeof CustScreenDisplay !== "undefined" &&
                                    CustScreenDisplay.cashierName
                                ) || "Kasir"
                            )}
                        </div>

                        <div class="cust-standby-greeting">
                            Senang melayani Anda
                        </div>

                    </div>
 
                    <div class="cust-standby-instruction"> 
                        Silakan pilih barang 
                        untuk memulai transaksi 
                    </div> 
 
                </div> 
 
            </div> 
 
        `; 
 
 
        const statusElement = 
            document.querySelector( 
                ".cust-status" 
            ); 
 
 
        if (statusElement) { 
 
            statusElement.textContent = 
                "Silakan lakukan pemesanan kepada kasir"; 
 
        } 
 
    }, 
 
 
    escape(value) { 
 
        return String( 
            value || "" 
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
 
    }, 
 
 
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
 
    } 
 
};