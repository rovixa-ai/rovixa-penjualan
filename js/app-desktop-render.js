const AppDesktopRender = {

    getStoreName() {

        return (
            StoreConfig.getStoreName() ||
            "Treehouse POS"
        );

    },


    getLogoUrl() {

        return StoreConfig.getLogo() || "";

    },


    getUserName() {

        const user =
            Auth.getCurrentUser();

        if (!user) {
            return "ADMIN";
        }

        return (
            user.nama ||
            user.username ||
            "ADMIN"
        );

    },


    renderSidebar() {

        return "";

    },


    renderHeader() {

        return "";

    }

};