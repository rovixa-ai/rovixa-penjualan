/* ======================================
TREEHOUSE POS
DOWNLOAD USERS
MASTER USER KASIR → LOCAL DATABASE
====================================== */

const DownloadUsers = {


/* ==================================
   DOWNLOAD USERS
================================== */

async download() {

   

    if (
        typeof API === "undefined" ||
        typeof API.get !== "function"
    ) {

        throw new Error(
            "API.get tidak tersedia."
        );

    }


    if (
        typeof LocalDB === "undefined"
    ) {

        throw new Error(
            "LocalDB tidak tersedia."
        );

    }


    const response =
        await API.get(
            "users"
        );


   


    if (
        !response ||
        response.success !== true
    ) {

        throw new Error(
            response?.message ||
            "Gagal mengambil data User."
        );

    }


    const users =
        Array.isArray(
            response.data
        )
            ? response.data
            : [];


   

    const normalizedUsers =
        users
            .map(
                user => {

                    return {

                        id:
                            String(
                                user?.id ||
                                ""
                            ).trim(),

                        username:
                            String(
                                user?.username ||
                                ""
                            ).trim(),

                        nama:
                            String(
                                user?.nama ||
                                ""
                            ).trim(),

                        pinHash:
                            String(
                                user?.pinHash ||
                                user?.PINHash ||
                                ""
                            ).trim(),

                        role:
                            String(
                                user?.role ||
                                ""
                            ).trim().toUpperCase(),

                        status:
                            String(
                                user?.status ||
                                ""
                            ).trim().toUpperCase(),

                        updatedAt:
                            String(
                                user?.updatedAt ||
                                ""
                            ).trim()

                    };

                }
            )
            .filter(
                user =>
                    user.id &&
                    user.username
            );


    await LocalDB.putAll(
        "users",
        normalizedUsers
    );


   


    return {

        success: true,

        count:
            normalizedUsers.length,

        data:
            normalizedUsers

    };

},


/* ==================================
   GET LOCAL USERS
================================== */

async getLocalUsers() {

    if (
        typeof LocalDB === "undefined"
    ) {

        throw new Error(
            "LocalDB tidak tersedia."
        );

    }


    return await LocalDB.getAll(
        "users"
    );

},


/* ==================================
   GET ACTIVE USERS
================================== */

async getActiveUsers() {

    const users =
        await this.getLocalUsers();


    return (
        users || []
    )
        .filter(
            user =>
                String(
                    user?.status ||
                    ""
                )
                    .trim()
                    .toUpperCase() ===
                "AKTIF"
        );

}


};